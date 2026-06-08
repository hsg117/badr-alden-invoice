import { createClient } from '@supabase/supabase-js'
import type { Invoice } from '../types/invoice'
import { getInvoiceById as getLocalInvoice } from './invoices'

const supabaseUrl = 'https://ccvprapyetmkorblrkgw.supabase.co'
const supabaseKey = 'sb_publishable_FYWy-1ZaF3Ad8olmhPKZhg_wvRISriE'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function fetchInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
  const local = getLocalInvoice(invoiceNumber)
  if (local) return local

  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('invoiceNumber', invoiceNumber)
      .limit(1)

    if (error) throw error
    if (!data || data.length === 0) return null

    const sale = data[0]

    const invoice: Invoice = {
      id: sale.invoiceNumber,
      invoiceNumber: sale.invoiceNumber,
      date: sale.createdAt ? sale.createdAt.split('T')[0] : '',
      customerName: sale.customerName || '',
      customerPhone: '',
      items: Array.isArray(sale.items) ? sale.items.map((item: any, i: number) => ({
        id: item.productId || i + 1,
        description: item.productName || '',
        quantity: item.qty || 1,
        price: item.unitPrice || 0,
        total: item.total || 0,
      })) : [],
      subtotal: sale.subtotal || 0,
      tax: 0,
      discount: sale.discountAmount || 0,
      total: sale.total || 0,
      notes: sale.notes || undefined,
      status: sale.status === 'مكتمل' ? 'paid' : sale.status === 'ملغي' ? 'cancelled' : 'pending',
    }

    return invoice
  } catch (err) {
    console.error('Supabase fetch error:', err)
    return null
  }
}
