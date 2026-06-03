import React, { useState, useEffect } from 'react';
import { Invoice } from './types';
import { SAMPLE_INVOICE_1, SAMPLE_INVOICE_2 } from './data/samples';
import HistorySidebar from './components/HistorySidebar';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import { FileText, Eye, Edit3, Loader2, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Firebase core integrations
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import AuthScreen from './components/AuthScreen';


export default function App() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string>('');
  const [activeMobileView, setActiveMobileView] = useState<'editor' | 'preview'>('editor');

  // Authentication and DB synchronization states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(false);

  // 1. Auth & Data Subscription Handler
  useEffect(() => {
    setAuthChecking(true);
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        setLoadingInvoices(true);
        // Load only the invoices owned by this authenticated user
        const q = query(
          collection(db, 'invoices'),
          where('userId', '==', user.uid)
        );
        
        const unsubscribeDocs = onSnapshot(q, async (snapshot) => {
          const loaded: Invoice[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as Invoice);
          });
          
          // Sort descendingly on client in-memory to prevent requiring composite indices in Firestore!
          loaded.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          
          setInvoices(loaded);
          
          // Seed initial invoice sample if the newly logged in user has an empty history
          if (loaded.length === 0) {
            const today = new Date().toISOString().slice(0, 10);
            const initialInvoice: Invoice = {
              ...SAMPLE_INVOICE_1,
              id: `inv-${Date.now()}`,
              userId: user.uid,
              invoiceNumber: `INV-${today.replace(/-/g, '')}-101`,
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(doc(db, 'invoices', initialInvoice.id), initialInvoice);
              setCurrentInvoiceId(initialInvoice.id);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `invoices/${initialInvoice.id}`);
            }
          } else {
            // Keep current selection if valid, or select first item
            if (!currentInvoiceId || !loaded.some(inv => inv.id === currentInvoiceId)) {
              setCurrentInvoiceId(loaded[0].id);
            }
          }
          
          setLoadingInvoices(false);
          setAuthChecking(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'invoices');
        });

        return () => {
          unsubscribeDocs();
        };
      } else {
        // Clear state on log out
        setInvoices([]);
        setCurrentInvoiceId('');
        setLoadingInvoices(false);
        setAuthChecking(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [currentInvoiceId]);

  // Find currently active invoice record
  const currentInvoice = invoices.find((inv) => inv.id === currentInvoiceId) || invoices[0];

  const handleUpdateInvoice = async (updated: Invoice) => {
    if (!currentUser) return;
    const invoiceWithUser = { ...updated, userId: currentUser.uid };
    // Optimistic offline update for instant form responsiveness
    setInvoices((prev) => prev.map((item) => (item.id === updated.id ? invoiceWithUser : item)));
    
    try {
      await setDoc(doc(db, 'invoices', updated.id), invoiceWithUser);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `invoices/${updated.id}`);
    }
  };

  const handleSelectInvoice = (id: string) => {
    setCurrentInvoiceId(id);
  };

  // Create a brand new clean blank invoice
  const handleNewInvoice = async () => {
    if (!currentUser) return;
    const today = new Date().toISOString().slice(0, 10);
    const future30 = new Date();
    future30.setDate(future30.getDate() + 30);
    const dueDay = future30.toISOString().slice(0, 10);

    const randomCounter = Math.floor(Math.random() * 900) + 100; // 3-digit serial
    const dateFormatted = today.replace(/-/g, '');
    const newInvoiceNumber = `INV-${dateFormatted}-${randomCounter}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      userId: currentUser.uid,
      invoiceNumber: newInvoiceNumber,
      issueDate: today,
      dueDate: dueDay,
      paymentTerms: 'Net 30',
      currency: 'TWD',
      sender: {
        name: '',
        taxId: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
        logoUrl: '',
      },
      recipient: {
        name: '',
        taxId: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
      },
      items: [
        {
          id: `item-${Date.now()}`,
          description: '',
          quantity: 1,
          unit: '個',
          price: 0,
        },
      ],
      taxType: 'exclusive',
      taxRate: 5,
      discountType: 'none',
      discountValue: 0,
      shippingFee: 0,
      amountPaid: 0,
      bankInfo: {
        bankName: '',
        branchCode: '',
        accountName: '',
        accountNumber: '',
      },
      notes: '請在收到帳單後 30 天內完成匯付款項。轉帳手續費由買受方負擔。',
      terms: '本發票經雙方核對明細後成立。\n逾期未付者，買方同意每日按欠款總額萬分之五加計滯納利息。',
      theme: 'indigo',
      signature: {
        type: 'none',
      },
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'invoices', newInvoice.id), newInvoice);
      setCurrentInvoiceId(newInvoice.id);
      setActiveMobileView('editor');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `invoices/${newInvoice.id}`);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'invoices', id));
      const backupList = invoices.filter((item) => item.id !== id);
      if (currentInvoiceId === id && backupList.length > 0) {
        setCurrentInvoiceId(backupList[0].id);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `invoices/${id}`);
    }
  };

  const handleDuplicateInvoice = async (invoice: Invoice) => {
    if (!currentUser) return;
    const today = new Date().toISOString().slice(0, 10);
    const dateFormatted = today.replace(/-/g, '');
    const randomCounter = Math.floor(Math.random() * 900) + 100;
    
    const duplicated: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      userId: currentUser.uid,
      invoiceNumber: `${invoice.invoiceNumber}-Copy-${randomCounter}`,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'invoices', duplicated.id), duplicated);
      setCurrentInvoiceId(duplicated.id);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `invoices/${duplicated.id}`);
    }
  };

  const handleImportBackup = async (imported: Invoice[]) => {
    if (!currentUser) return;
    const currentIds = new Set(invoices.map((i) => i.id));
    
    for (const item of imported) {
      const cleanId = currentIds.has(item.id)
        ? `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        : item.id;
        
      const cleanItem: Invoice = {
        ...item,
        id: cleanId,
        userId: currentUser.uid,
      };

      try {
        await setDoc(doc(db, 'invoices', cleanId), cleanItem);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `invoices/${cleanId}`);
      }
    }
  };

  // Inject beautiful premade samples under a new random draft ID for editing
  const handleLoadSample = async (sampleIndex: 1 | 2) => {
    if (!currentUser) return;
    const source = sampleIndex === 1 ? SAMPLE_INVOICE_1 : SAMPLE_INVOICE_2;
    const freshSample: Invoice = {
      ...source,
      id: `inv-${Date.now()}`,
      userId: currentUser.uid,
      invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 100) + 10}`,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'invoices', freshSample.id), freshSample);
      setCurrentInvoiceId(freshSample.id);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `invoices/${freshSample.id}`);
    }
  };

  if (authChecking) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 font-sans select-none">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <span className="text-sm font-bold text-gray-400">正在確認帳號安全與載入雲端資料...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  if (loadingInvoices && invoices.length === 0) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 font-sans select-none">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <span className="text-sm font-bold text-gray-400">正在安全同步雲端發票資料，請稍候...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-gray-800 antialiased">
      
      {/* 1. History Sidebar (Hidden during browser Print!) */}
      <HistorySidebar
        invoices={invoices}
        currentInvoiceId={currentInvoiceId}
        onSelectInvoice={handleSelectInvoice}
        onNewInvoice={handleNewInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        onDuplicateInvoice={handleDuplicateInvoice}
        onImportBackup={handleImportBackup}
        onLoadSample={handleLoadSample}
      />

      {/* 2. Main Editing and Live Preview Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Control Bar (Hidden on Print) */}
        <header className="no-print h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 text-sm hidden sm:inline">工作面板</span>
            <div className="text-xs text-gray-400 font-medium font-mono hidden md:inline">
              ID: {currentInvoice?.id}
            </div>
            <div className="text-xs bg-slate-100 py-1 px-2.5 rounded-full font-bold text-slate-700">
              目前編輯：<span className="font-mono text-indigo-600 font-extrabold">{currentInvoice?.invoiceNumber || '草稿'}</span>
            </div>
          </div>

          <div className="text-xs flex items-center gap-3 text-gray-500">
            <span className="hidden lg:inline">• A4 標準 A-grade 比例</span>
            
            {/* Logged in User email badge / chip */}
            <div className="flex items-center gap-2 border bg-slate-50 border-gray-200 rounded-lg py-1 px-2.5 text-xs text-gray-650 font-medium">
              <UserIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate max-w-[130px] font-mono select-all" title={currentUser.email || ''}>
                {currentUser.email || '已驗證帳號'}
              </span>
            </div>

            {/* Logout Trigger button */}
            <button
              onClick={() => signOut(auth)}
              title="登出帳號"
              className="py-1 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>登出</span>
            </button>
          </div>
        </header>

        {/* Workspace body (Splits side-by-side or tabs based on viewport width) */}
        {currentInvoice ? (
          <div className="flex-1 overflow-hidden relative">
            
            {/* Desktop View: Side-By-Side (hidden on mobile, uses full screen) */}
            <div className="hidden lg:grid lg:grid-cols-12 h-full">
              {/* Form Editor in Column 1 */}
              <div className="lg:col-span-5 h-full overflow-hidden p-6 border-r border-gray-200">
                <InvoiceForm 
                  invoice={currentInvoice}
                  onChange={handleUpdateInvoice}
                />
              </div>

              {/* Live Preview Paper inside Column 2 */}
              <div className="lg:col-span-7 h-full overflow-hidden">
                <InvoicePreview 
                  invoice={currentInvoice}
                />
              </div>
            </div>

            {/* Mobile/Tablet view: Interactive views selection tabs */}
            <div className="lg:hidden h-full flex flex-col pt-2 bg-slate-100">
              
              {/* Mobile screen switcher */}
              <div className="flex px-4 py-2 gap-2 shrink-0 no-print">
                <button
                  type="button"
                  onClick={() => setActiveMobileView('editor')}
                  className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                    activeMobileView === 'editor'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white hover:bg-gray-50 border text-gray-700'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  編輯發票資訊
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMobileView('preview')}
                  className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                    activeMobileView === 'preview'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white hover:bg-gray-50 border text-gray-700'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  觀看預覽與列印
                </button>
              </div>

              {/* Content Panel Area */}
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeMobileView === 'editor' ? (
                    <motion.div
                      key="editor"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      transition={{ duration: 0.15 }}
                      className="h-full px-4 pb-4"
                    >
                      <InvoiceForm 
                        invoice={currentInvoice}
                        onChange={handleUpdateInvoice}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.15 }}
                      className="h-full"
                    >
                      <InvoicePreview 
                        invoice={currentInvoice}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
            <p>正在載入發票系統，請稍候...</p>
          </div>
        )}

      </div>

      {/* Embedded CSS rules forcing hide-others during A4 Window printing */}
      <style>{`
        @media print {
          /* Force hide ALL screen chrome except print node */
          .no-print, header, nav, aside, button, select, input, #signature-pad-modal {
            display: none !important;
          }
          
          body, html, #root {
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }

          #invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 15mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
