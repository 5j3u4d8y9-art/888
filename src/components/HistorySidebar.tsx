import React, { useState } from 'react';
import { Invoice } from '../types';
import { 
  FileText, PlusCircle, Trash2, Copy, Download, Upload, 
  Search, Calendar, Receipt, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { formatCurrencyValue } from '../utils/calculations';

interface HistorySidebarProps {
  invoices: Invoice[];
  currentInvoiceId: string;
  onSelectInvoice: (id: string) => void;
  onNewInvoice: () => void;
  onDeleteInvoice: (id: string) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onImportBackup: (imported: Invoice[]) => void;
  onLoadSample: (sampleIndex: 1 | 2) => void;
}

export default function HistorySidebar({
  invoices,
  currentInvoiceId,
  onSelectInvoice,
  onNewInvoice,
  onDeleteInvoice,
  onDuplicateInvoice,
  onImportBackup,
  onLoadSample,
}: HistorySidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.recipient.name.toLowerCase().includes(term) ||
      inv.sender.name.toLowerCase().includes(term)
    );
  });

  // Export all as JSON backup file
  const handleExportBackup = () => {
    const backupStr = JSON.stringify(invoices, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(backupStr);
    
    const exportFileDefaultName = `發票產生器_備份_${new Date().toISOString().slice(0, 10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].invoiceNumber) {
            onImportBackup(parsed);
            alert('對帳單/發票備份匯入成功！');
          } else {
            alert('資料格式不正確，匯入失敗。');
          }
        } catch (err) {
          alert('讀取檔案時出錯，請確認是否為正確的 JSON 備份檔。');
        }
      };
    }
  };

  return (
    <div 
      className={`relative h-full bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 no-print z-20 ${
        isOpen ? 'w-80' : 'w-12'
      }`}
    >
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-12 bg-slate-800 rounded-r-md flex items-center justify-center border-y border-r border-slate-700 hover:bg-slate-700 transition-colors z-30"
        title={isOpen ? '收起側邊欄' : '展開側邊欄'}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      {/* Sidebar Content */}
      <div className={`h-full flex flex-col ${isOpen ? 'opacity-100' : 'opacity-0 overflow-hidden pointer-events-none w-0'}`}>
        {/* Header Branding */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-indigo-500/20">
              🧾
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide">智慧發票產生器</h1>
              <span className="text-[10px] text-slate-400">Professional Invoice</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onNewInvoice}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white transition-colors flex items-center gap-1"
            title="新增發票"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜尋編號、客戶或商家..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-slate-800 border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onLoadSample(1)}
              className="flex-1 py-1 px-2 text-[10px] bg-slate-800 hover:bg-slate-700 rounded text-center text-slate-300 font-medium transition-colors"
            >
              載入繁中範例
            </button>
            <button
              type="button"
              onClick={() => onLoadSample(2)}
              className="flex-1 py-1 px-2 text-[10px] bg-slate-800 hover:bg-slate-700 rounded text-center text-slate-300 font-medium transition-colors"
            >
              載入英文範例
            </button>
          </div>
        </div>

        {/* Invoice List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1 text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            所有發票紀錄 ({filteredInvoices.length})
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs">
              無發票紀錄，點選右上角 + 開始建立。
            </div>
          ) : (
            filteredInvoices.map((inv) => {
              const isActive = inv.id === currentInvoiceId;
              const subtotal = inv.items.reduce((s, x) => s + (x.quantity * x.price), 0);
              
              return (
                <div
                  key={inv.id}
                  onClick={() => onSelectInvoice(inv.id)}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-indigo-600/10 border border-indigo-500/30 text-white' 
                      : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 text-xs">
                    <span className="font-mono font-medium tracking-wide group-hover:text-indigo-400 transition-colors">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {inv.issueDate}
                    </span>
                  </div>

                  <div className="text-xs font-semibold truncate max-w-44 text-slate-250">
                    {inv.recipient.name || '未命名客戶'}
                  </div>

                  <div className="flex justify-between items-end mt-1.5">
                    <span className="text-[10px] text-slate-400 truncate max-w-32">
                      {inv.sender.name || '未設商家'}
                    </span>
                    <span className="font-mono font-bold text-xs text-indigo-500 group-hover:text-indigo-400">
                      {formatCurrencyValue(subtotal, inv.currency)}
                    </span>
                  </div>

                  {/* Operational Hover Controls */}
                  <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-slate-800 p-1 rounded border border-slate-700 shadow-lg">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateInvoice(inv);
                      }}
                      className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                      title="複製此發票"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {invoices.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm(`確認要刪除發票 ${inv.invoiceNumber} 嗎？`)) {
                            onDeleteInvoice(inv.id);
                          }
                        }}
                        className="p-1 hover:bg-red-950/60 text-slate-400 hover:text-red-400 rounded transition-colors"
                        title="刪除發票"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Backup footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2 text-xs text-slate-400">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-all font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              導出備份
            </button>
            <label className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-all font-medium cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              匯入備份
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-[10px] text-center text-slate-500 leading-tight">
            所有資料均保存在您本機的瀏覽器 LocalStorage 中，安全私密不外流。
          </p>
        </div>
      </div>
    </div>
  );
}
