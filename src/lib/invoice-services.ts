import { createClient } from '@supabase/supabase-js';
import type { Invoice } from '@/types/invoices';
import type { PropertyOffer } from '@/types/offers';
import { getPropertyOfferById } from '@/lib/offer-services';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const generateInvoiceNumber = async (): Promise<string> => {
  const seq = Date.now().toString().slice(-6);
  return `INV-${new Date().getFullYear()}-${seq}`;
};

// Add N working days to a given date (skip Sat/Sun)
const addWorkingDays = (start: Date, days: number): Date => {
  const d = new Date(start);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      added += 1;
    }
  }
  return d;
};

export const createInvoiceForOffer = async (offerId: string): Promise<Invoice | null> => {
  try {
    const offer = await getPropertyOfferById(offerId);
    if (!offer) return null;

    // Compute deposit (cash => offer price; installments => deposit)
    const currency = offer.property?.currency || 'USD';
    const subtotal = offer.payment_method === 'cash' ? offer.offer_price : offer.deposit_amount;
    const taxes = 0;
    const total = subtotal + taxes;

    const invoiceNumber = await generateInvoiceNumber();
    const issueDate = new Date();
    // 7 working days validity
    const dueDate = addWorkingDays(issueDate, 7);

    const buyerFullName = `${offer.buyer?.first_name || ''} ${offer.buyer?.last_name || ''}`.trim();
    const listingType = offer.payment_method === 'cash' ? 'Cash Sale' : 'Installments';
    const addressParts = [
      (offer as any).property?.street_address,
      (offer as any).property?.suburb,
      offer.property?.location?.city || (offer as any).property?.city,
      offer.property?.location?.country || (offer as any).property?.country
    ].filter(Boolean);
    const propertyAddress = addressParts.join(', ');

    const invoicePayload = {
      invoice_number: invoiceNumber,
      offer_id: offer.id,
      buyer_id: offer.buyer_id,
      property_id: offer.property_id,
      currency,
      subtotal,
      taxes,
      total,
      amount_due: total,
      status: 'unpaid' as const,
      issue_date: issueDate.toISOString(),
      due_date: dueDate.toISOString(),
      line_items: [{
        description: `Deposit for ${offer.property?.title || 'Property'}`,
        quantity: 1,
        unit_price: subtotal,
        total: subtotal
      }],
      metadata: {
        offer_reference: offer.offer_reference,
        offer_price: offer.offer_price,
        payment_method: offer.payment_method,
        listing_type: listingType,
        estimated_timeline: offer.estimated_timeline,
        property_title: offer.property?.title,
        property_address: propertyAddress,
        buyer_name: buyerFullName,
        buyer_email: offer.buyer?.email,
        buyer_phone: offer.buyer?.phone,
        buyer_uid: offer.buyer?.id
      }
    };

    if (!supabase) {
      return { id: `mock-${invoiceNumber}`, ...invoicePayload } as Invoice;
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoicePayload)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to create invoice:', error);
      return { id: `mock-${invoiceNumber}`, ...invoicePayload } as Invoice;
    }

    return data as Invoice;
  } catch (e) {
    console.error('Error in createInvoiceForOffer:', e);
    return null;
  }
};

export const getInvoiceByOffer = async (offerId: string): Promise<Invoice | null> => {
  try {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('offer_id', offerId)
      .order('issue_date', { ascending: false })
      .limit(1)
      .single();
    if (error) return null;
    return data as Invoice;
  } catch {
    return null;
  }
};

export const markInvoicePaid = async (invoiceId: string): Promise<boolean> => {
  try {
    if (!supabase) return true;
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid', amount_due: 0 })
      .eq('id', invoiceId);
    return !error;
  } catch {
    return false;
  }
};


