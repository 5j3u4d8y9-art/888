import { Invoice } from '../types';

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
  balanceDue: number;
}

export function calculateInvoiceTotals(invoice: Invoice): InvoiceTotals {
  // 1. Calculate items subtotal
  const subtotal = invoice.items.reduce((sum, item) => {
    return sum + (item.quantity * item.price);
  }, 0);

  // 2. Calculate discount amount
  let discountAmount = 0;
  if (invoice.discountType === 'percent') {
    discountAmount = subtotal * (invoice.discountValue / 100);
  } else if (invoice.discountType === 'flat') {
    discountAmount = invoice.discountValue;
  }
  // Ensure discount doesn't exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);

  // 3. Taxable Amount after discount
  const baseForTax = subtotal - discountAmount;

  // 4. Calculate tax based on taxType
  let taxAmount = 0;
  let taxableAmount = baseForTax;

  if (invoice.taxType === 'exclusive') {
    // 外加稅
    taxAmount = baseForTax * (invoice.taxRate / 100);
  } else if (invoice.taxType === 'inclusive') {
    // 內含稅
    // taxAmount = baseForTax - (baseForTax / (1 + taxRate/100))
    taxAmount = baseForTax * (invoice.taxRate / (100 + invoice.taxRate));
    taxableAmount = baseForTax - taxAmount;
  }

  // 5. Final grand total
  // For exclusive: subtotal - discount + tax + shipping
  // For inclusive/none: subtotal - discount + shipping
  let total = baseForTax + (invoice.taxType === 'exclusive' ? taxAmount : 0) + invoice.shippingFee;
  total = Math.max(0, total);

  // 6. Balance Due (Remaining)
  const balanceDue = Math.max(0, total - invoice.amountPaid);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    balanceDue: Math.round(balanceDue * 100) / 100,
  };
}

export function formatCurrencyValue(amount: number, currencyCode: string): string {
  const formatter = new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currencyCode === 'JPY' || currencyCode === 'TWD' ? 0 : 2,
    maximumFractionDigits: currencyCode === 'JPY' || currencyCode === 'TWD' ? 0 : 2,
  });
  return formatter.format(amount);
}
