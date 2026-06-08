import type { Invoice } from '../types/invoice'

export const invoices: Invoice[] = [
  {
    id: 'INV-2025-001',
    invoiceNumber: 'INV-2025-001',
    date: '2025-05-15',
    customerName: 'أحمد محمد',
    customerPhone: '966512345678',
    customerAddress: 'الرياض، المملكة العربية السعودية',
    items: [
      { id: 1, description: 'منتج أ - نسخة أساسية', quantity: 2, price: 150.00, total: 300.00 },
      { id: 2, description: 'منتج ب - نسخة مطورة', quantity: 1, price: 250.00, total: 250.00 },
      { id: 3, description: 'خدمة تركيب', quantity: 1, price: 100.00, total: 100.00 },
    ],
    subtotal: 650.00,
    tax: 32.50,
    discount: 0,
    total: 682.50,
    notes: 'شكراً لتعاملكم معنا',
    status: 'paid',
  },
  {
    id: 'INV-2025-002',
    invoiceNumber: 'INV-2025-002',
    date: '2025-05-20',
    customerName: 'سارة خالد',
    customerPhone: '966598765432',
    customerAddress: 'جدة، المملكة العربية السعودية',
    items: [
      { id: 1, description: 'حقيبة جلدية فاخرة', quantity: 1, price: 450.00, total: 450.00 },
      { id: 2, description: 'محفظة جلدية', quantity: 2, price: 120.00, total: 240.00 },
    ],
    subtotal: 690.00,
    tax: 34.50,
    discount: 50.00,
    total: 674.50,
    status: 'pending',
  },
  {
    id: 'INV-2025-003',
    invoiceNumber: 'INV-2025-003',
    date: '2025-06-01',
    customerName: 'محمد علي',
    customerPhone: '966555555555',
    customerAddress: 'الدمام، المملكة العربية السعودية',
    items: [
      { id: 1, description: 'سماعات لاسلكية', quantity: 1, price: 350.00, total: 350.00 },
      { id: 2, description: 'حافظة سماعات', quantity: 1, price: 50.00, total: 50.00 },
      { id: 3, description: 'شاحن لاسلكي', quantity: 2, price: 80.00, total: 160.00 },
      { id: 4, description: 'كابل USB-C', quantity: 3, price: 25.00, total: 75.00 },
    ],
    subtotal: 635.00,
    tax: 31.75,
    discount: 0,
    total: 666.75,
    status: 'paid',
  },
  {
    id: 'INV-2025-004',
    invoiceNumber: 'INV-2025-004',
    date: '2025-06-05',
    customerName: 'نورة عبدالله',
    customerPhone: '966577777777',
    items: [
      { id: 1, description: 'تصميم جرافيك', quantity: 1, price: 800.00, total: 800.00 },
      { id: 2, description: 'تطوير موقع', quantity: 1, price: 2000.00, total: 2000.00 },
    ],
    subtotal: 2800.00,
    tax: 140.00,
    discount: 200.00,
    total: 2740.00,
    notes: 'الدفع خلال 30 يوماً',
    status: 'pending',
  },
  {
    id: 'INV-2025-005',
    invoiceNumber: 'INV-2025-005',
    date: '2025-06-10',
    customerName: 'خالد عمر',
    customerPhone: '966588888888',
    customerAddress: 'مكة المكرمة، المملكة العربية السعودية',
    items: [
      { id: 1, description: 'اشتراك سنوي - باقة بريميم', quantity: 1, price: 1200.00, total: 1200.00 },
    ],
    subtotal: 1200.00,
    tax: 60.00,
    discount: 100.00,
    total: 1160.00,
    status: 'paid',
  },
  {
    id: 'INV-2025-006',
    invoiceNumber: 'INV-2025-006',
    date: '2025-06-12',
    customerName: 'لينا حسن',
    customerPhone: '966599999999',
    items: [
      { id: 1, description: 'ساعة ذكية', quantity: 1, price: 650.00, total: 650.00 },
      { id: 2, description: 'سوار بديل', quantity: 2, price: 45.00, total: 90.00 },
      { id: 3, description: 'واقي شاشة', quantity: 1, price: 30.00, total: 30.00 },
      { id: 4, description: 'شاحن سريع', quantity: 1, price: 75.00, total: 75.00 },
    ],
    subtotal: 845.00,
    tax: 42.25,
    discount: 0,
    total: 887.25,
    status: 'cancelled',
  },
]

export function getInvoiceById(id: string): Invoice | undefined {
  return invoices.find((inv) => inv.id === id || inv.invoiceNumber === id)
}

export function getAllInvoices(): Invoice[] {
  return invoices
}
