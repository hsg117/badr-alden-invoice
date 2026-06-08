export interface InvoiceItem {
  id: number
  description: string
  quantity: number
  price: number
  total: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  notes?: string
  status: 'paid' | 'pending' | 'cancelled'
}
