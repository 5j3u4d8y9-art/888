import React, { useState } from 'react';
import { Invoice, InvoiceItem, TaxType, DiscountType, SignatureData } from '../types';
import { 
  Building2, Users, FileSpreadsheet, Library, 
  Plus, Trash2, Calendar, DollarSign, PenTool, Image, 
  HelpCircle, AlignLeft, Percent, HelpCircle as HelpIcon, ArrowUp, ArrowDown
} from 'lucide-react';
import SignaturePad from './SignaturePad';
import { THEMES, CURRENCIES, PAYMENT_TERMS } from '../data/samples';

interface InvoiceFormProps {
  invoice: Invoice;
  onChange: (updatedInvoice: Invoice) => void;
}

export default function InvoiceForm({ invoice, onChange }: InvoiceFormProps) {
  const [activeTab, setActiveTab] = useState<'sender' | 'recipient' | 'items' | 'terms'>('sender');
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);

  // Helper to deep update keys
  const updateInvoiceField = (path: string[], value: any) => {
    const updated = { ...invoice };
    let current: any = updated;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    onChange(updated);
  };

  // Logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 800000) {
        alert('上傳的商標圖片過大（請小於 800KB）以確保順暢儲存。');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateInvoiceField(['sender', 'logoUrl'], event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Item Management
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unit: '件',
      price: 0,
    };
    updateInvoiceField(['items'], [...invoice.items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...invoice.items];
    updatedItems.splice(index, 1);
    updateInvoiceField(['items'], updatedItems);
  };

  const handleItemFieldChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoice.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    updateInvoiceField(['items'], updatedItems);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === invoice.items.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedItems = [...invoice.items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[targetIndex];
    updatedItems[targetIndex] = temp;

    updateInvoiceField(['items'], updatedItems);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col no-print">
      {/* Editor Main Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/50 p-1.5 gap-1 select-none">
        {[
          { id: 'sender', label: '1. 商家與商標', icon: Building2 },
          { id: 'recipient', label: '2. 客戶與對象', icon: Users },
          { id: 'items', label: '3. 發票品項與日期', icon: FileSpreadsheet },
          { id: 'terms', label: '4. 金額與簽章說明', icon: PenTool },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                isSelected 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.label.split('.')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Editor Body Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* TAB 1: SENDER (商家與商標) */}
        {activeTab === 'sender' && (
          <div className="space-y-5">
            <div className="border-l-4 border-blue-500 pl-3">
              <h3 className="text-sm font-bold text-gray-800">商家基本資訊</h3>
              <p className="text-xs text-gray-400">輸入您作為付款發起方的基本資料，會自動儲存。</p>
            </div>

            {/* Logo Upload Box */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="md:col-span-1 flex flex-col items-center">
                {invoice.sender.logoUrl ? (
                  <div className="relative group w-24 h-24 bg-white border rounded-lg overflow-hidden shadow-sm flex items-center justify-center">
                    <img 
                      src={invoice.sender.logoUrl} 
                      alt="Brand Logo" 
                      className="max-w-full max-h-full object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={() => updateInvoiceField(['sender', 'logoUrl'], '')}
                      className="absolute inset-0 bg-red-650/80 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
                    >
                      移除商標
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer transition-colors shadow-sm group">
                    <Image className="w-5 h-5 text-gray-400 group-hover:text-blue-500 mb-1" />
                    <span className="text-[10px] text-gray-400 font-medium font-sans">上傳商標</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
              <div className="md:col-span-3 text-xs space-y-1">
                <p className="font-bold text-gray-700">自訂發票商標 (Logo)</p>
                <p className="text-gray-400 leading-normal">
                  支援 JPG, PNG 格式。檔案建議限制於 400x120 像素內以獲得最佳渲染效果。上傳後，商標會顯示在您的發票左上方。
                </p>
              </div>
            </div>

            {/* Sender form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">商家名稱 / 姓名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={invoice.sender.name}
                  onChange={(e) => updateInvoiceField(['sender', 'name'], e.target.value)}
                  placeholder="創點數位設計有限公司"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">統一編號 / 稅籍編號</label>
                <input
                  type="text"
                  maxLength={15}
                  value={invoice.sender.taxId}
                  onChange={(e) => updateInvoiceField(['sender', 'taxId'], e.target.value)}
                  placeholder="24681357"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">聯絡人姓名</label>
                <input
                  type="text"
                  value={invoice.sender.contact}
                  onChange={(e) => updateInvoiceField(['sender', 'contact'], e.target.value)}
                  placeholder="林明軒"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">聯絡電話</label>
                <input
                  type="text"
                  value={invoice.sender.phone}
                  onChange={(e) => updateInvoiceField(['sender', 'phone'], e.target.value)}
                  placeholder="02-2345-6789"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">電子郵件信箱</label>
                <input
                  type="email"
                  value={invoice.sender.email}
                  onChange={(e) => updateInvoiceField(['sender', 'email'], e.target.value)}
                  placeholder="contact@design-studio.tw"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">商店 / 服務通訊地址</label>
                <input
                  type="text"
                  value={invoice.sender.address}
                  onChange={(e) => updateInvoiceField(['sender', 'address'], e.target.value)}
                  placeholder="台北市信義區信義路五段 7 號 80 樓"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RECIPIENT (客戶與對象) */}
        {activeTab === 'recipient' && (
          <div className="space-y-5">
            <div className="border-l-4 border-blue-500 pl-3">
              <h3 className="text-sm font-bold text-gray-800">客戶對象資訊</h3>
              <p className="text-xs text-gray-400">輸入您客戶公司的相關開立細節，將完美排版。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">客戶公司 / 抬頭名稱 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={invoice.recipient.name}
                  onChange={(e) => updateInvoiceField(['recipient', 'name'], e.target.value)}
                  placeholder="品味生活家具有限公司"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">客戶統一客編 / 統一編號</label>
                <input
                  type="text"
                  value={invoice.recipient.taxId}
                  onChange={(e) => updateInvoiceField(['recipient', 'taxId'], e.target.value)}
                  placeholder="13572468"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">客戶負責聯絡人</label>
                <input
                  type="text"
                  value={invoice.recipient.contact}
                  onChange={(e) => updateInvoiceField(['recipient', 'contact'], e.target.value)}
                  placeholder="張莉雅 經理"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">客戶信箱</label>
                <input
                  type="email"
                  value={invoice.recipient.email}
                  onChange={(e) => updateInvoiceField(['recipient', 'email'], e.target.value)}
                  placeholder="lia.chang@yourtaste-life.com"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">客戶聯絡電話</label>
                <input
                  type="text"
                  value={invoice.recipient.phone}
                  onChange={(e) => updateInvoiceField(['recipient', 'phone'], e.target.value)}
                  placeholder="03-512-3456"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">客戶帳單 / 寄送通訊地址</label>
                <input
                  type="text"
                  value={invoice.recipient.address}
                  onChange={(e) => updateInvoiceField(['recipient', 'address'], e.target.value)}
                  placeholder="新竹市東區光復路二段 101 號"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ITEMS & DATES (發票品項與日期) */}
        {activeTab === 'items' && (
          <div className="space-y-5">
            <div className="border-l-4 border-blue-500 pl-3">
              <h3 className="text-sm font-bold text-gray-800">日期、單號與幣別</h3>
              <p className="text-xs text-gray-400">設定此次結算清冊的重要日期指標與金額使用幣種。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  發票編號
                </label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => updateInvoiceField(['invoiceNumber'], e.target.value)}
                  placeholder="INV-20260603-001"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono tracking-wider font-semibold text-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">貨幣幣種別</label>
                <select
                  value={invoice.currency}
                  onChange={(e) => updateInvoiceField(['currency'], e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.label} ({curr.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">付款約定天數</label>
                <select
                  value={invoice.paymentTerms}
                  onChange={(e) => {
                    updateInvoiceField(['paymentTerms'], e.target.value);
                    // Autoset due date based on selection
                    const match = e.target.value.match(/\d+/);
                    if (match) {
                      const days = parseInt(match[0], 10);
                      const baseDate = new Date(invoice.issueDate);
                      baseDate.setDate(baseDate.getDate() + days);
                      updateInvoiceField(['dueDate'], baseDate.toISOString().slice(0, 10));
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {PAYMENT_TERMS.map((term) => (
                    <option key={term.value} value={term.value}>
                      {term.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">開立發票日期</label>
                <div className="relative">
                  <input
                    type="date"
                    value={invoice.issueDate}
                    onChange={(e) => {
                      updateInvoiceField(['issueDate'], e.target.value);
                      // Auto calculate due date if net terms exist
                      const match = invoice.paymentTerms.match(/\d+/);
                      if (match) {
                        const days = parseInt(match[0], 10);
                        const baseDate = new Date(e.target.value);
                        baseDate.setDate(baseDate.getDate() + days);
                        updateInvoiceField(['dueDate'], baseDate.toISOString().slice(0, 10));
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 animate-pulse">截止付款日期</label>
                <div className="relative">
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => updateInvoiceField(['dueDate'], e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">選用版面色調風格</label>
                <select
                  value={invoice.theme}
                  onChange={(e) => updateInvoiceField(['theme'], e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  {THEMES.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items table / rows list */}
            <div className="border-t pt-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-800">專案明細或品項清單 ({invoice.items.length})</span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增明細品項
                </button>
              </div>

              <div className="space-y-2.5">
                {invoice.items.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl text-xs text-gray-400">
                    目前沒有任何品項！請點點右上角「新增明細品項」開始填寫。
                  </div>
                ) : (
                  invoice.items.map((item, index) => (
                    <div 
                      key={item.id || index}
                      className="group flex flex-col md:flex-row gap-2.5 p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-slate-50 relative min-h-12 items-center"
                    >
                      {/* Sorting & Item number index */}
                      <div className="flex items-center gap-1.5 self-start md:self-center">
                        <span className="text-[10px] w-5 h-5 rounded-full bg-gray-200 text-gray-600 font-mono font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex flex-col shrink-0 no-print">
                          <button
                            type="button"
                            onClick={() => handleMoveItem(index, 'up')}
                            className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition"
                            title="向上置頂"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveItem(index, 'down')}
                            className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition"
                            title="向下置底"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Item inputs details */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2.5 w-full">
                        <div className="md:col-span-6">
                          <input
                            type="text"
                            required
                            value={item.description}
                            onChange={(e) => handleItemFieldChange(index, 'description', e.target.value)}
                            placeholder="請填寫品項品名、規格詳細描述（如：網站 React 切版服務）"
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="number"
                            min="0"
                            required
                            step="any"
                            value={item.quantity}
                            onChange={(e) => handleItemFieldChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="數量"
                            className="w-full px-2.5 py-1.5 text-xs text-center border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                          />
                        </div>
                        <div className="md:col-span-1.5 col-span-3">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemFieldChange(index, 'unit', e.target.value)}
                            placeholder="單位"
                            className="w-full px-2.5 py-1.5 text-xs text-center border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2.5 col-span-9 flex items-center gap-1.5 relative">
                          <div className="absolute left-2.5 text-gray-400 text-[10px] font-mono pointer-events-none">$</div>
                          <input
                            type="number"
                            min="0"
                            required
                            step="any"
                            value={item.price}
                            onChange={(e) => handleItemFieldChange(index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="單價"
                            className="w-full pl-6 pr-2.5 py-1.5 text-xs text-right border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-semibold"
                          />
                        </div>
                      </div>

                      {/* Subtotal & Action buttons */}
                      <div className="flex items-center gap-2.5 justify-between w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
                        <span className="text-xs font-mono font-bold text-gray-600 md:hidden">小計:</span>
                        <div className="font-mono text-xs font-bold text-gray-800 md:w-20 text-right pr-1">
                          {(item.quantity * item.price).toLocaleString()}
                        </div>
                        <button
                          type="button"
                          disabled={invoice.items.length <= 1}
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded transition-all disabled:opacity-45 cursor-pointer disabled:cursor-not-allowed"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TERMS & BANK (金額、說明、簽章與銀行) */}
        {activeTab === 'terms' && (
          <div className="space-y-5">
            <div className="border-l-4 border-blue-500 pl-3 animate-pulse">
              <h3 className="text-sm font-bold text-gray-800">稅率、折抵項目、收款方式</h3>
              <p className="text-xs text-gray-400">自訂加值稅、折讓金額，並填寫臨櫃或 ATM 收款銀行帳號細項。</p>
            </div>

            {/* Financial variables adjustments */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">加值型營業稅率 (%)</label>
                <div className="flex gap-1.5">
                  <select
                    value={invoice.taxType}
                    onChange={(e) => updateInvoiceField(['taxType'], e.target.value as TaxType)}
                    className="w-1/2 px-2 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="none">無稅 (None)</option>
                    <option value="exclusive">外加稅 (Exclusive)</option>
                    <option value="inclusive">內含稅 (Inclusive)</option>
                  </select>
                  {invoice.taxType !== 'none' && (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={invoice.taxRate}
                      onChange={(e) => updateInvoiceField(['taxRate'], parseFloat(e.target.value) || 0)}
                      className="w-1/2 px-2 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-center font-bold"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">特別折讓 / 促銷優惠</label>
                <div className="flex gap-1.5">
                  <select
                    value={invoice.discountType}
                    onChange={(e) => updateInvoiceField(['discountType'], e.target.value as DiscountType)}
                    className="w-1/2 px-2 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="none">無折抵 (None)</option>
                    <option value="flat">折抵定額 (Flat)</option>
                    <option value="percent">折抵比例 %</option>
                  </select>
                  {invoice.discountType !== 'none' && (
                    <input
                      type="number"
                      min="0"
                      value={invoice.discountValue}
                      onChange={(e) => updateInvoiceField(['discountValue'], parseFloat(e.target.value) || 0)}
                      placeholder={invoice.discountType === 'percent' ? '%' : '金額'}
                      className="w-1/2 px-2 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-center font-bold text-red-700"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">預付定金 / 已付金額</label>
                <input
                  type="number"
                  min="0"
                  value={invoice.amountPaid}
                  onChange={(e) => updateInvoiceField(['amountPaid'], parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-semibold text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">運費、郵資或其他雜費</label>
                <input
                  type="number"
                  min="0"
                  value={invoice.shippingFee}
                  onChange={(e) => updateInvoiceField(['shippingFee'], parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-semibold text-right text-gray-700"
                />
              </div>
            </div>

            {/* Bank details info */}
            <div className="border border-blue-50/70 bg-gradient-to-r from-blue-50/30 to-indigo-50/20 p-4 rounded-xl space-y-3">
              <span className="text-xs font-bold text-indigo-900 block border-b pb-1">臨櫃匯款 / 實名金融帳號</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-gray-650 mb-0.5">收款銀行名稱</label>
                  <input
                    type="text"
                    value={invoice.bankInfo.bankName}
                    onChange={(e) => updateInvoiceField(['bankInfo', 'bankName'], e.target.value)}
                    placeholder="玉山商業銀行 (808)"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-650 mb-0.5">分行名稱 / 網路銀行統一 Swift</label>
                  <input
                    type="text"
                    value={invoice.bankInfo.branchCode}
                    onChange={(e) => updateInvoiceField(['bankInfo', 'branchCode'], e.target.value)}
                    placeholder="信義分行 (0980)"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-650 mb-0.5">戶名 / 註冊法人戶名</label>
                  <input
                    type="text"
                    value={invoice.bankInfo.accountName}
                    onChange={(e) => updateInvoiceField(['bankInfo', 'accountName'], e.target.value)}
                    placeholder="創點數位設計有限公司"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-650 mb-0.5">匯款帳號 (純數字或代碼)</label>
                  <input
                    type="text"
                    value={invoice.bankInfo.accountNumber}
                    onChange={(e) => updateInvoiceField(['bankInfo', 'accountNumber'], e.target.value)}
                    placeholder="0980-940-1234567"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Note & signature */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">交易附言 / 客戶備註 (Notes)</label>
                <textarea
                  rows={3}
                  value={invoice.notes}
                  onChange={(e) => updateInvoiceField(['notes'], e.target.value)}
                  placeholder="例：感謝您的合作！如有任何問題，歡迎隨時與本專案聯絡。"
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">交易特別約定 / 付款條款 (Terms)</label>
                <textarea
                  rows={3}
                  value={invoice.terms}
                  onChange={(e) => updateInvoiceField(['terms'], e.target.value)}
                  placeholder="1. 請於期限內將款項匯至指定銀行帳戶。&#10;2. 匯款手續費由買方自行負擔。"
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans resize-none"
                />
              </div>
            </div>

            {/* Interactive Signature Trigger Area */}
            <div className="border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-emerald-600" />
                  官方簽章蓋印/手寫認證方式
                </span>
                <p className="text-[11px] text-gray-400">
                  此處的簽名將顯示於預覽發票右下方。可選擇用手寫或是打字生成華麗襯線或草寫。
                </p>
                {invoice.signature.type !== 'none' && (
                  <div className="mt-2 text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded inline-block font-medium">
                    {invoice.signature.type === 'sketch' ? '✓ 已保存手寫簽名軌跡' : `✓ 已啟用打字簽章："${invoice.signature.typedName}"`}
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-3">
                {isSignaturePadOpen ? (
                  <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
                    <SignaturePad 
                      value={invoice.signature} 
                      onChange={(sigVal) => {
                        updateInvoiceField(['signature'], sigVal);
                      }}
                      onClose={() => setIsSignaturePadOpen(false)}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSignaturePadOpen(true)}
                    className="px-4 py-2 bg-slate-904 border hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    設定簽章與親筆手寫
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
