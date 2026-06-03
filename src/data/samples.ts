import { Invoice } from '../types';

export const THEMES = [
  { id: 'indigo', name: '專業靛藍 (Professional Indigo)', primaryColor: '#4f46e5', secondaryColor: '#312e81', bgClass: 'bg-slate-50' },
  { id: 'minimal', name: '卓越極簡 (Minimalist Gray)', primaryColor: '#1f2937', secondaryColor: '#4b5563', bgClass: 'bg-gray-50' },
  { id: 'ocean', name: '專業深藍 (Ocean Blue)', primaryColor: '#1d4ed8', secondaryColor: '#1e3a8a', bgClass: 'bg-blue-50' },
  { id: 'emerald', name: '典雅翡翠 (Emerald Green)', primaryColor: '#059669', secondaryColor: '#064e3b', bgClass: 'bg-emerald-50' },
  { id: 'warm', name: '優雅珊瑚 (Warm Coral)', primaryColor: '#db2777', secondaryColor: '#881337', bgClass: 'bg-rose-50' },
];

export const CURRENCIES = [
  { code: 'TWD', symbol: 'NT$', label: '新台幣 (TWD)' },
  { code: 'USD', symbol: '$', label: '美金 (USD)' },
  { code: 'JPY', symbol: '¥', label: '日圓 (JPY)' },
  { code: 'EUR', symbol: '€', label: '歐元 (EUR)' },
  { code: 'HKD', symbol: 'HK$', label: '港幣 (HKD)' },
  { code: 'CNY', symbol: '¥', label: '人民幣 (CNY)' },
];

export const PAYMENT_TERMS = [
  { value: 'COD', label: '貨到付款 (COD)' },
  { value: 'Net 7', label: '7 天內付款 (Net 7)' },
  { value: 'Net 15', label: '15 天內付款 (Net 15)' },
  { value: 'Net 30', label: '30 天內付款 (Net 30)' },
  { value: 'Net 60', label: '60 天內付款 (Net 60)' },
  { value: 'custom', label: '其他 (自訂期限)' },
];

export const SAMPLE_INVOICE_1: Invoice = {
  id: 'sample-design-consultancy',
  invoiceNumber: 'INV-20260603-080',
  issueDate: '2026-06-03',
  dueDate: '2026-07-03',
  paymentTerms: 'Net 30',
  currency: 'TWD',
  sender: {
    name: '創點數位設計有限公司',
    taxId: '24681357',
    contact: '林明軒',
    email: 'contact@design-studio.tw',
    phone: '02-2345-6789',
    address: '台北市信義區信義路五段 7 號 80 樓',
    logoUrl: '', // Placeholder or empty
  },
  recipient: {
    name: '品味生活家具有限公司',
    taxId: '13572468',
    contact: '張莉雅 經理',
    email: 'lia.chang@yourtaste-life.com',
    phone: '03-512-3456',
    address: '新竹市東區光復路二段 101 號',
  },
  items: [
    {
      id: 'item-1',
      description: '品牌識別系統設計 (含 CIS 標誌、標準色彩、名片與名牌規範)',
      quantity: 1,
      unit: '組',
      price: 85000,
    },
    {
      id: 'item-2',
      description: '企業官方響應式網站 RWD UI/UX 視覺設計 (首頁及 5 個核心內頁)',
      quantity: 1,
      unit: '專案',
      price: 120000,
    },
    {
      id: 'item-3',
      description: '前端互動特效網頁切版與整合 (使用 React & Tailwind CSS)',
      quantity: 120,
      unit: '工時',
      price: 1500,
    },
    {
      id: 'item-4',
      description: '專案管理與使用者驗收測試與除錯維護服務 (3個月免費維護)',
      quantity: 1,
      unit: '件',
      price: 35000,
    },
  ],
  taxType: 'exclusive',
  taxRate: 5,
  discountType: 'percent',
  discountValue: 10, // 10% off
  shippingFee: 0,
  amountPaid: 80000, // Prepaid deposit
  bankInfo: {
    bankName: '玉山商業銀行 (808)',
    branchCode: '信義分行 (0980)',
    accountName: '創點數位設計有限公司',
    accountNumber: '0980-940-1234567',
  },
  notes: '感謝您的合作！本報價已包含三個月後的基礎技術諮詢與定時備份。如有任何問題，歡迎隨時與本專案負責人林明軒 (0912-345-678) 聯絡。',
  terms: '1. 請於期限內將款項匯至指定銀行帳戶。匯款完成後請回傳帳號後五碼以利對帳。\n2. 匯款手續費需由買方自行負擔。\n3. 逾期未付將按照每月 1.5% 計收延遲利息。',
  theme: 'indigo',
  signature: {
    type: 'typed',
    typedName: '創點數位設計 林明軒',
    typedFont: 'font-serif',
  },
  createdAt: '2026-06-03T05:30:00.000Z',
};

export const SAMPLE_INVOICE_2: Invoice = {
  id: 'sample-software-dev',
  invoiceNumber: 'INV-20260515-012',
  issueDate: '2026-05-15',
  dueDate: '2026-05-30',
  paymentTerms: 'Net 15',
  currency: 'USD',
  sender: {
    name: 'Apex Coders Freelance Studio',
    taxId: '987654321',
    contact: 'Alex Chen',
    email: 'alex@apexcoders.io',
    phone: '+886 987 654 321',
    address: '高雄市新興區中正三路 55 號',
    logoUrl: '',
  },
  recipient: {
    name: 'Zenith Global Solutions Inc.',
    taxId: 'US-99887766',
    contact: 'Sarah Jenkins',
    email: 'billing@zenithglobe.com',
    phone: '+1 415 555 2671',
    address: '500 Howard Street, San Francisco, CA 94105, USA',
  },
  items: [
    {
      id: 'dev-1',
      description: 'API Integration with Salesforce and HubSpot Platforms',
      quantity: 45,
      unit: 'hrs',
      price: 85,
    },
    {
      id: 'dev-2',
      description: 'Custom Dashboard Development (Data charting, exporting, user management)',
      quantity: 1,
      unit: 'pkg',
      price: 4500,
    },
    {
      id: 'dev-3',
      description: 'Cloud Infrastructure Setup & CI/CD deployment automation (AWS ECS/RDS)',
      quantity: 1,
      unit: 'pkg',
      price: 1800,
    },
  ],
  taxType: 'none',
  taxRate: 0,
  discountType: 'flat',
  discountValue: 300,
  shippingFee: 50,
  amountPaid: 0,
  bankInfo: {
    bankName: 'Megabank International (TW)',
    branchCode: 'SWIFT: MEGA-TW-TP',
    accountName: 'Apex Coders Studio LLC',
    accountNumber: '998-202-888-12345',
  },
  notes: 'Thank you for your business. It is a pleasure working with your professional engineering team on this cloud scalability assignment!',
  terms: 'Payment is due within 15 days of invoice date. International wire transfer fee should be fully absorbed by the sender. Late payments will incur standard service disruption.',
  theme: 'minimal',
  signature: {
    type: 'typed',
    typedName: 'Alex Chen',
    typedFont: 'font-sans',
  },
  createdAt: '2026-05-15T12:00:00.000Z',
};
