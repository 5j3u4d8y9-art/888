export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
}

export type TaxType = 'inclusive' | 'exclusive' | 'none';
export type DiscountType = 'percent' | 'flat' | 'none';

export interface SignatureData {
  type: 'sketch' | 'typed' | 'none';
  sketchDataUrl?: string;
  typedName?: string;
  typedFont?: string;
}

export interface BankInfo {
  bankName: string;
  branchCode: string;
  accountName: string;
  accountNumber: string;
}

export interface PartyInfo {
  name: string;
  taxId: string; // 統一編號等
  contact: string;
  email: string;
  phone: string;
  address: string;
}

export interface Invoice {
  id: string;
  userId?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  currency: string;
  sender: PartyInfo & { logoUrl?: string };
  recipient: PartyInfo;
  items: InvoiceItem[];
  taxType: TaxType;
  taxRate: number; // e.g. 5 for 5%
  discountType: DiscountType;
  discountValue: number;
  shippingFee: number;
  amountPaid: number;
  bankInfo: BankInfo;
  notes: string;
  terms: string;
  theme: 'indigo' | 'minimal' | 'ocean' | 'emerald' | 'warm';
  signature: SignatureData;
  createdAt: string;
}
