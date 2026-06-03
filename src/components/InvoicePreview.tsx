import React, { useMemo, useState } from 'react';
import { Invoice } from '../types';
import { calculateInvoiceTotals, formatCurrencyValue } from '../utils/calculations';
import { THEMES, CURRENCIES } from '../data/samples';
import { FileText, MapPin, Mail, Phone, Calendar, Landmark, Info, Printer, Loader2, Download } from 'lucide-react';
import { exportElementToPDF } from '../utils/pdf';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export default function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');

  // Compute invoice financial calculations
  const totals = useMemo(() => calculateInvoiceTotals(invoice), [invoice]);

  // Retrieve current active design theme config details
  const activeTheme = useMemo(() => {
    return THEMES.find((t) => t.id === invoice.theme) || THEMES[0];
  }, [invoice.theme]);

  // Render a nice colored badge or background header depending on the theme
  const primaryColor = activeTheme.primaryColor;

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportStatus('exporting');
    const filename = `發票_${invoice.invoiceNumber || '款項明細'}.pdf`;
    
    try {
      // Generate high-resolution PDF download directly in iframe
      const success = await exportElementToPDF('invoice-print-area', filename);
      
      if (success) {
        setExportStatus('success');
        // Clear success message after 5 seconds
        setTimeout(() => {
          setExportStatus('idle');
        }, 5000);
      } else {
        setExportStatus('error');
        // Silent automatic fallback: trigger print so they can always save it as PDF
        setTimeout(() => {
          window.print();
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setExportStatus('error');
      setTimeout(() => {
        window.print();
      }, 1000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 p-4 md:p-6 overflow-y-auto relative">
      {/* Real-time status toast/alert for sandbox friendly status updates */}
      {exportStatus !== 'idle' && (
        <div className={`mb-4 p-3.5 rounded-xl border no-print flex items-start gap-3 shadow-sm animate-fade-in transition-all ${
          exportStatus === 'exporting' ? 'bg-blue-50 border-blue-200 text-blue-800' :
          exportStatus === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          {exportStatus === 'exporting' && (
            <>
              <Loader2 className="w-5 h-5 text-blue-550 animate-spin shrink-0" />
              <div className="text-xs">
                <span className="font-bold block text-blue-900 font-sans">正在製作高解析度 A4 PDF 檔案...</span>
                <span className="text-blue-600 block mt-0.5">這可能需要幾秒鐘，請勿關閉或刷新頁面。</span>
              </div>
            </>
          )}
          {exportStatus === 'success' && (
            <>
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">✓</div>
              <div className="text-xs">
                <span className="font-bold block text-emerald-900 font-sans">🎉 PDF 檔案已順利產生並啟動下載！</span>
                <span className="text-emerald-700 block mt-0.5">若下載未自動開始，請檢查瀏覽器上方下載通知或安全性設置。</span>
              </div>
            </>
          )}
          {exportStatus === 'error' && (
            <>
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">!</div>
              <div className="text-xs">
                <span className="font-bold block text-amber-950 font-sans">⚠️ 自動下載因瀏覽器安全性限制（沙盒預覽模式）需使用「系統列印」：</span>
                <span className="text-amber-800 block mt-1 leading-relaxed">
                  系統正為您喚起<strong>「系統列印與 PDF 保存」</strong>視窗。請在目的地選項中選擇<strong>「另存為 PDF」</strong>即可！
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="mt-2.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  手動開啟系統列印
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Upper informational bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 p-4 bg-white border border-gray-150 rounded-xl shadow-xs no-print select-none">
        <div className="flex items-center gap-2.5 text-xs text-gray-600 flex-1">
          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
          <div className="leading-normal">
            <p className="font-semibold text-gray-800">
              系統支援「直接下載 PDF」與「瀏覽器 A4 列印」雙核心：
            </p>
            <p className="text-gray-400">
              直接下載為無失真 JPEG 嵌入式 PDF 檔案；若要自定義紙底紙張或預覽尺寸，可使用備用系統列印。
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportPDF}
            className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                正在產生 PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                下載 PDF 檔案
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
            title="系統列印/另存 PDF 備份"
          >
            <Printer className="w-3.5 h-3.5" />
            系統列印
          </button>
        </div>
      </div>

      {/* The Printable A4 Sheet container */}
      <div 
        id="invoice-print-area"
        className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 print:p-0 print:shadow-none print:border-none print:rounded-none flex flex-col justify-between print-page transition-all ease-in-out duration-300"
      >
        {/* UPPER LEAF: Company details and Invoice metadata */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-8">
            {/* Sender and Logo Grid */}
            <div className="space-y-3 flex-1">
              {invoice.sender.logoUrl ? (
                <div className="h-16 flex items-center mb-1">
                  <img 
                    src={invoice.sender.logoUrl} 
                    alt="Company Logo" 
                    className="max-h-full max-w-[250px] object-contain object-left referrerPolicy"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans font-extrabold text-sm tracking-wide text-white shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  🧾 {invoice.sender.name ? invoice.sender.name.slice(0, 4) : 'INVOICE'}
                </div>
              )}

              <div className="space-y-1">
                <h2 className="text-lg font-bold text-gray-900 leading-tight">{invoice.sender.name || '（請輸入商家名稱）'}</h2>
                {invoice.sender.taxId && (
                  <p className="text-xs text-gray-500 font-medium">統編 / 稅籍編號: <span className="font-mono">{invoice.sender.taxId}</span></p>
                )}
                
                <div className="pt-2 text-xs text-gray-500 space-y-0.5 font-sans">
                  {invoice.sender.contact && <p className="text-gray-700 font-medium">聯絡人: {invoice.sender.contact}</p>}
                  {invoice.sender.address && (
                    <p className="flex items-start gap-1 leading-normal">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      地址: {invoice.sender.address}
                    </p>
                  )}
                  {invoice.sender.phone && (
                    <p className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      電話: {invoice.sender.phone}
                    </p>
                  )}
                  {invoice.sender.email && (
                    <p className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      信箱: {invoice.sender.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Meta header details */}
            <div className="text-left md:text-right space-y-3.5 shrink-0 w-full md:w-auto">
              <div>
                <h1 
                  className="text-3xl font-extrabold tracking-wider uppercase font-sans print:text-gray-900" 
                  style={{ color: primaryColor }}
                >
                  發票明細單
                </h1>
                <span className="text-[10px] text-gray-400 font-semibold tracking-wide block leading-none">INVOICE STATEMENT</span>
              </div>

              <div className="inline-grid grid-cols-2 md:block text-xs text-gray-500 gap-x-4 gap-y-1 md:space-y-1.5 font-sans">
                <div className="flex justify-between md:justify-end gap-2">
                  <span className="text-gray-400">發票單號:</span>
                  <span className="font-mono font-bold text-gray-900 tracking-wide">{invoice.invoiceNumber || '（請輸入單號）'}</span>
                </div>
                <div className="flex justify-between md:justify-end gap-2">
                  <span className="text-gray-400">開立日期:</span>
                  <span className="font-mono font-medium text-gray-800">{invoice.issueDate}</span>
                </div>
                <div className="flex justify-between md:justify-end gap-2">
                  <span className="text-gray-400">付款期限:</span>
                  <span className="font-mono font-bold text-red-600">{invoice.dueDate}</span>
                </div>
                <div className="flex justify-between md:justify-end gap-2">
                  <span className="text-gray-400">款項狀態:</span>
                  <span className="font-semibold text-gray-800">
                    {invoice.paymentTerms === 'COD' ? '貨到付款' : '期約結帳'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ssender vs Recipient details banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-xl border border-gray-100 print:bg-white print:border-none print:p-0">
            <div>
              <span 
                className="text-[10px] font-bold tracking-wider uppercase text-gray-400 block mb-2"
                style={{ color: primaryColor }}
              >
                買受人 (收件方 / 客戶 資訊) / BILL TO:
              </span>
              <div className="space-y-1 font-sans">
                <h3 className="text-sm font-bold text-gray-900">{invoice.recipient.name || '（請輸入客戶抬頭）'}</h3>
                {invoice.recipient.taxId && (
                  <p className="text-[11px] text-gray-500 font-medium font-sans">
                    統一編號 / 稅籍代碼: <span className="font-mono text-gray-800">{invoice.recipient.taxId}</span>
                  </p>
                )}
                
                <div className="pt-1.5 text-xs text-gray-500 space-y-0.5">
                  {invoice.recipient.contact && <p className="text-gray-700 font-medium">聯絡窗口: {invoice.recipient.contact}</p>}
                  {invoice.recipient.address && <p>地址: {invoice.recipient.address}</p>}
                  {invoice.recipient.phone && <p>電話: {invoice.recipient.phone}</p>}
                  {invoice.recipient.email && <p>信箱: {invoice.recipient.email}</p>}
                </div>
              </div>
            </div>
            
            <div className="hidden md:block text-right self-end text-xs text-gray-400 space-y-1 font-mono">
              <span className="text-[10px] font-bold tracking-wider uppercase block text-gray-300">結帳貨幣 / CURRENCY</span>
              <p className="text-sm font-bold text-gray-700">{invoice.currency} {CURRENCIES.find(c => c.code === invoice.currency)?.label.split('(')[0]}</p>
            </div>
          </div>

          {/* Mid Section: Item tables details */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b text-xs font-bold text-gray-500 bg-slate-50 border-gray-200">
                  <th className="py-2.5 px-3 w-8 text-center bg-transparent">#</th>
                  <th className="py-2.5 px-2 bg-transparent text-gray-700 font-bold">項目與工程服務細節描述</th>
                  <th className="py-2.5 px-2 text-center w-16 bg-transparent">數量</th>
                  <th className="py-2.5 px-2 text-center w-14 bg-transparent">單位</th>
                  <th className="py-2.5 px-3 text-right w-24 bg-transparent">單價</th>
                  <th className="py-2.5 px-3 text-right w-28 bg-transparent">小計金額</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-gray-100">
                {invoice.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">目前無項目明細。請在前方面板新增品項。</td>
                  </tr>
                ) : (
                  invoice.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50/40 print:hover:bg-transparent">
                      <td className="py-3 px-3 text-center text-gray-400 font-mono font-medium">{index + 1}</td>
                      <td className="py-3 px-2 text-gray-800 leading-normal font-medium max-w-sm whitespace-pre-line">
                        {item.description || '（未命名項目）'}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-gray-600">{item.quantity}</td>
                      <td className="py-3 px-2 text-center text-gray-500 font-sans">{item.unit || '件'}</td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-gray-700">
                        {formatCurrencyValue(item.price, invoice.currency)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">
                        {formatCurrencyValue(item.quantity * item.price, invoice.currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* LOWER LEAF: Summary math, notes and signatures */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t pt-6">
            {/* Columns left: bank info details */}
            <div className="md:col-span-7 space-y-4 font-sans">
              {/* Bank Details section */}
              {(invoice.bankInfo.bankName || invoice.bankInfo.accountNumber) && (
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/15 text-xs text-gray-600 space-y-2 print:border-none print:p-0 print:bg-white">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <Landmark className="w-4 h-4 text-indigo-650" />
                    <span>指定收款與匯款帳號</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 pl-5">
                    {invoice.bankInfo.bankName && (
                      <div>
                        <span className="text-gray-400 block text-[10px]">銀行名稱:</span>
                        <span className="font-semibold text-gray-800">{invoice.bankInfo.bankName}</span>
                      </div>
                    )}
                    {invoice.bankInfo.branchCode && (
                      <div>
                        <span className="text-gray-400 block text-[10px]">分行名或 Swift:</span>
                        <span className="font-semibold text-gray-800">{invoice.bankInfo.branchCode}</span>
                      </div>
                    )}
                    {invoice.bankInfo.accountName && (
                      <div className="col-span-2">
                        <span className="text-gray-400 block text-[10px]">戶名 / Beneficiary:</span>
                        <span className="font-bold text-gray-800">{invoice.bankInfo.accountName}</span>
                      </div>
                    )}
                    {invoice.bankInfo.accountNumber && (
                      <div className="col-span-2">
                        <span className="text-gray-400 block text-[10px]">轉帳帳號 / Account number:</span>
                        <span className="font-mono font-bold text-blue-900 text-sm tracking-wide">{invoice.bankInfo.accountNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Remarks/Notes details */}
              {invoice.notes && (
                <div className="text-xs space-y-1">
                  <span className="font-bold text-gray-500 block">交易備註說明:</span>
                  <p className="text-gray-600 leading-normal bg-gray-50/40 p-2.5 rounded-lg border border-gray-100 print:bg-white print:border-none print:p-0 whitespace-pre-line">
                    {invoice.notes}
                  </p>
                </div>
              )}

              {/* Agreement terms */}
              {invoice.terms && (
                <div className="text-[11px] space-y-1">
                  <span className="font-bold text-gray-400 block">約定付款條款:</span>
                  <p className="text-gray-500 leading-normal whitespace-pre-line">
                    {invoice.terms}
                  </p>
                </div>
              )}
            </div>

            {/* Columns right: subtotal discount and final taxes totals */}
            <div className="md:col-span-5 space-y-2.5 text-xs text-gray-600">
              <div className="space-y-2 font-mono border-b pb-3 border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-sans">品項小計:</span>
                  <span className="text-gray-800 font-medium">{formatCurrencyValue(totals.subtotal, invoice.currency)}</span>
                </div>

                {invoice.discountType !== 'none' && (
                  <div className="flex justify-between text-red-650">
                    <span className="text-gray-400 font-sans">
                      折扣折讓 ({invoice.discountType === 'percent' ? `${invoice.discountValue}%` : '定額'}):
                    </span>
                    <span>-{formatCurrencyValue(totals.discountAmount, invoice.currency)}</span>
                  </div>
                )}

                {invoice.taxType !== 'none' && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-sans">
                      應稅基數 (Post-discount):
                    </span>
                    <span className="text-gray-700">{formatCurrencyValue(totals.taxableAmount, invoice.currency)}</span>
                  </div>
                )}

                {invoice.taxType !== 'none' && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-sans">
                      營業稅 ({invoice.taxRate}%, {invoice.taxType === 'inclusive' ? '內含' : '外加'}):
                    </span>
                    <span className="text-gray-800">{formatCurrencyValue(totals.taxAmount, invoice.currency)}</span>
                  </div>
                )}

                {invoice.shippingFee > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span className="text-gray-400 font-sans">運費郵資雜費:</span>
                    <span>+{formatCurrencyValue(invoice.shippingFee, invoice.currency)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 border-b pb-3 border-gray-100">
                <div className="flex justify-between items-baseline font-sans">
                  <span className="font-extrabold text-sm text-gray-900">發票總額 (Total):</span>
                  <span className="font-mono text-lg font-extrabold text-gray-950">
                    {formatCurrencyValue(totals.total, invoice.currency)}
                  </span>
                </div>

                {invoice.amountPaid > 0 && (
                  <div className="flex justify-between items-center text-emerald-800 bg-emerald-50/50 p-1.5 rounded font-sans print:p-0 print:bg-white">
                    <span className="text-xs">已付定金/款項 (Offset):</span>
                    <span className="font-mono font-bold">-{formatCurrencyValue(invoice.amountPaid, invoice.currency)}</span>
                  </div>
                )}
              </div>

              {/* Balanced Due (未繳款) styled highlights */}
              <div 
                className="flex justify-between items-baseline p-2.5 rounded-lg border tracking-wide font-sans print:p-0 print:border-none"
                style={{ 
                  backgroundColor: totals.balanceDue > 0 ? `${primaryColor}0c` : '#f0fdf4',
                  borderColor: totals.balanceDue > 0 ? `${primaryColor}22` : '#bbf7d0',
                }}
              >
                <span className="font-black text-gray-900 text-xs">應付淨額 (Balance Due):</span>
                <span 
                  className="font-mono text-xl font-black shrink-0"
                  style={{ color: totals.balanceDue > 0 ? primaryColor : '#15803d' }}
                >
                  {formatCurrencyValue(totals.balanceDue, invoice.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOMFOOTER: Signatures and company stamping */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-400 font-sans">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-semibold text-gray-800">{invoice.sender.name || '（請輸入商家名稱）'}</p>
            <p className="text-[10px]">感謝您的惠顧，期盼不久得能再度與您合作承攬項目！</p>
          </div>

          {/* Signature graphics pad rendering */}
          {invoice.signature.type !== 'none' && (
            <div className="flex flex-col items-center justify-end shrink-0 text-center md:text-right border-2 border-dashed border-slate-150 p-2.5 rounded-lg bg-slate-50/20 max-w-60 min-w-44 h-24 print:border-none print:bg-white select-none">
              <span className="text-[9px] text-gray-400 block pb-1 font-bold">官方合法核准簽章欄印</span>
              {invoice.signature.type === 'sketch' && invoice.signature.sketchDataUrl ? (
                <img 
                  src={invoice.signature.sketchDataUrl} 
                  alt="Sign Track" 
                  className="max-h-16 max-w-full object-contain pointer-events-none filter saturate-150 bg-transparent inline-block"
                />
              ) : (
                <div className="h-16 flex items-center justify-center">
                  <span className={`text-xl font-bold tracking-widest text-indigo-900 border-b border-indigo-400 pb-0.5 whitespace-nowrap ${invoice.signature.typedFont}`}>
                    {invoice.signature.typedName}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
