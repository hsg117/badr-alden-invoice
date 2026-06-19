import { createClient } from '@supabase/supabase-js'
import type { Invoice } from '../types/invoice'
import { getInvoiceById as getLocalInvoice } from './invoices'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ccvprapyetmkorblrkgw.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_FYWy-1ZaF3Ad8olmhPKZhg_wvRISriE'

const supabase = createClient(supabaseUrl, supabaseKey)

function mapOrderType(type: string | undefined): Invoice['orderType'] {
  if (!type) return undefined
  const t = type.toLowerCase()
  if (t.includes('دلفري') || t.includes('delivery') || t.includes('توصيل')) return 'delivery'
  if (t.includes('online') || t.includes('اونلاين') || t.includes('أونلاين')) return 'online'
  if (t.includes('محل') || t.includes('instore') || t.includes('كاشير')) return 'instore'
  return type
}

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

    const taxAmount = sale.taxAmount || sale.tax || 0
    const taxRate = sale.taxRate || (taxAmount > 0 && sale.subtotal > 0 ? Math.round((taxAmount / sale.subtotal) * 100) : 0)

    const createdAt = sale.createdAt || sale.created_at || ''
    const dateParts = createdAt ? createdAt.split('T') : ['', '']

    const invoice: Invoice = {
      id: sale.invoiceNumber,
      invoiceNumber: sale.invoiceNumber,
      date: dateParts[0] || '',
      time: dateParts[1] ? dateParts[1].substring(0, 5) : undefined,
      customerName: sale.customerName || sale.customer_name || '',
      customerPhone: sale.customerPhone || sale.customer_phone || sale.phone || '',
      customerAddress: sale.customerAddress || sale.customer_address || sale.address || undefined,
      items: Array.isArray(sale.items) ? sale.items.map((item: any, i: number) => ({
        id: item.productId || item.id || i + 1,
        description: item.productName || item.name || item.description || '',
        quantity: item.qty || item.quantity || 1,
        price: item.unitPrice || item.price || 0,
        total: item.total || 0,
      })) : [],
      subtotal: sale.subtotal || 0,
      tax: taxAmount,
      taxRate: taxRate || undefined,
      discount: sale.discountAmount || sale.discount || 0,
      total: sale.total || 0,
      notes: sale.notes || undefined,
      status: sale.status === 'مكتمل' ? 'paid' : sale.status === 'ملغي' ? 'cancelled' : 'pending',
      employeeName: sale.employeeName || sale.employee_name || sale.cashierName || sale.cashier_name || undefined,
      orderType: mapOrderType(sale.orderType || sale.order_type || sale.type),
      deliveryPersonName: sale.deliveryPersonName || sale.delivery_person || sale.driverName || sale.driver_name || undefined,
      deliveryAddress: sale.deliveryAddress || sale.delivery_address || sale.customerAddress || undefined,
      paymentMethod: sale.paymentMethod || sale.payment_method || undefined,
    }

    return invoice
  } catch (err) {
    console.error('Supabase fetch error:', err)
    return null
  }
}
