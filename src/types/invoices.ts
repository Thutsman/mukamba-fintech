export type InvoiceStatus = 'unpaid' | 'paid' | 'void';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  offer_id: string;
  buyer_id: string;
  property_id: string;
  currency: string;
  subtotal: number;
  taxes: number;
  total: number;
  amount_due: number;
  status: InvoiceStatus;
  issue_date: string; // ISO
  due_date: string;   // ISO
  pdf_url?: string | null;
  line_items?: InvoiceLineItem[];
  metadata?: Record<string, any>;
}


