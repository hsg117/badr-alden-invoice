import type { VercelRequest, VercelResponse } from '@vercel/node'

const SUPABASE_URL = 'https://ccvprapyetmkorblrkgw.supabase.co'
const SUPABASE_KEY = 'sb_publishable_FYWy-1ZaF3Ad8olmhPKZhg_wvRISriE'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invoice number is required' })
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/sales?invoiceNumber=eq.${encodeURIComponent(id)}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' })
    }

    const sale = data[0]

    const invoice = {
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

    return res.status(200).json(invoice)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
