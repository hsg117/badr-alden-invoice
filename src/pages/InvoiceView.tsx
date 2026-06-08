import { useParams, Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { fetchInvoiceByNumber } from '../data/supabaseService'
import { decodeInvoiceId, getInvoiceUrl } from '../utils/encode'
import type { Invoice } from '../types/invoice'
// @ts-ignore
import html2pdf from 'html2pdf.js'

/* ── helpers ── */
const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const [y, m, d] = parts.map(Number)
  const monthName = ARABIC_MONTHS[(m || 1) - 1] || ''
  return `${d} ${monthName} ${y}`
}

const statusConfig = {
  paid:      { label: 'مدفوع',        color: '#16a34a', bg: '#dcfce7', icon: CheckIcon },
  pending:   { label: 'قيد الانتظار', color: '#d97706', bg: '#fef3c7', icon: ClockIcon },
  cancelled: { label: 'ملغي',         color: '#dc2626', bg: '#fee2e2', icon: XIcon },
}
const orderTypeConfig: Record<string, { label: string; icon: string; color: string }> = {
  delivery: { label: 'توصيل',   icon: '🛵', color: '#C8722A' },
  online:   { label: 'أونلاين', icon: '💻', color: '#7c3aed' },
  instore:  { label: 'في المحل', icon: '🏪', color: '#16a34a' },
}

/* ── SVG icon components ── */
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
    </svg>
  )
}
function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

/* ── Social icons ── */
function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}
function FacebookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}
function TikTokIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/>
    </svg>
  )
}
function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

/* ── Toast ── */
function ToastMsg({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [onDone])
  return <div className="toast-msg"><CheckIcon /> {msg}</div>
}

/* ════════════════════════════════
   MAIN COMPONENT
════════════════════════════════ */
function InvoiceView() {
  const { id: encodedId } = useParams<{ id: string }>()
  const realId = encodedId ? decodeInvoiceId(encodedId) : null

  const [invoice, setInvoice]       = useState<Invoice | null>(null)
  const [loading, setLoading]       = useState(true)
  const [notFound, setNotFound]     = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [toast, setToast]           = useState('')
  const [visible, setVisible]       = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      if (!realId) { setNotFound(true); setLoading(false); return }
      const result = await fetchInvoiceByNumber(realId)
      if (result) { setInvoice(result); setNotFound(false) }
      else         setNotFound(true)
      setLoading(false)
      setTimeout(() => setVisible(true), 80)
    }
    setLoading(true); setNotFound(false); setVisible(false)
    load()
  }, [realId])

  /* ── loading ── */
  if (loading) return (
    <div className="iv-page iv-loading-page">
      <div className="iv-loading-bg"><div className="orb orb-1"/><div className="orb orb-2"/></div>
      <div className="iv-loading-box">
        <img src="/logo.png" alt="" className="loading-logo" />
        <div className="loading-ring"><div/><div/><div/><div/></div>
        <p className="loading-text">جاري تحميل الفاتورة...</p>
        <div className="loading-dots"><span/><span/><span/></div>
      </div>
    </div>
  )

  /* ── not found ── */
  if (notFound || !invoice) return (
    <div className="iv-page iv-error-page">
      <div className="iv-loading-bg"><div className="orb orb-1"/><div className="orb orb-2"/></div>
      <div className="iv-error-box glass-card">
        <div className="error-icon-big"><XIcon /></div>
        <h2>الفاتورة غير موجودة</h2>
        <p>لم يتم العثور على الفاتورة المطلوبة.<br/>تأكد من صحة الرابط أو رمز QR.</p>
        <Link to="/" className="iv-back-btn">← العودة للرئيسية</Link>
      </div>
    </div>
  )

  /* ── derived values ── */
  const invoiceUrl = getInvoiceUrl(invoice.id)
  const subtotal   = invoice.subtotal || invoice.items.reduce((s, it) => s + it.total, 0)
  const StatusIcon = statusConfig[invoice.status]?.icon || CheckIcon
  const status     = statusConfig[invoice.status] || statusConfig.pending
  const orderType  = invoice.orderType
    ? (orderTypeConfig[invoice.orderType] || { label: invoice.orderType, icon: '📋', color: '#C8722A' })
    : null

  /* ── actions ── */
  const handlePrint = () => window.print()

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || pdfLoading) return
    setPdfLoading(true)
    // temporarily add pdf-mode class so print CSS applies
    invoiceRef.current.classList.add('pdf-export')
    try {
      await html2pdf().set({
        margin:      [8, 8, 8, 8],
        filename:    `فاتورة_${invoice.invoiceNumber}.pdf`,
        image:       { type: 'jpeg', quality: 0.99 },
        html2canvas: { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff' },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(invoiceRef.current).save()
    } catch { alert('حدث خطأ أثناء إنشاء PDF') }
    finally {
      invoiceRef.current?.classList.remove('pdf-export')
      setPdfLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invoiceUrl)
    setToast('تم نسخ رابط الفاتورة!')
  }

  /* ── render ── */
  return (
    <div className={`iv-page ${visible ? 'iv-visible' : ''}`}>
      {toast && <ToastMsg msg={toast} onDone={() => setToast('')} />}

      {/* dark animated background */}
      <div className="iv-bg">
        <div className="iv-bg-gradient"/>
        <div className="iv-bg-grid"/>
        <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>
      </div>

      {/* sticky top bar */}
      <div className="iv-top-bar no-print">
        <Link to="/" className="iv-top-back">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          الرئيسية
        </Link>
        <div className="iv-top-actions">
          <button onClick={handleCopyLink} className="iv-action-btn btn-copy">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            نسخ الرابط
          </button>
          <button onClick={handlePrint} className="iv-action-btn btn-print">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            طباعة
          </button>
          <button onClick={handleDownloadPDF} className={`iv-action-btn btn-pdf ${pdfLoading ? 'loading' : ''}`} disabled={pdfLoading}>
            {pdfLoading ? <span className="btn-spinner"/> : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                تحميل PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* main container */}
      <div className="iv-container">
        <div className="invoice-doc" ref={invoiceRef}>

          {/* ══ HEADER ══ */}
          <div className="inv-header">
            <div className="inv-header-watermark">بدر الدين</div>
            <div className="inv-header-left">
              <img src="/logo-full.png" alt="محمصة بدر الدين" className="inv-logo" />
              <div className="inv-header-company">
                <div className="inv-company-name">محمصة بدر الدين</div>
                <div className="inv-company-sub">للقهوة المحمصة الفاخرة</div>
              </div>
            </div>
            <div className="inv-header-right">
              <div className="inv-title-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                فاتورة إلكترونية
              </div>
              <div className="inv-meta-rows">
                <div className="inv-meta-row">
                  <span className="inv-meta-label">رقم الفاتورة</span>
                  <span className="inv-meta-val inv-num">#{invoice.invoiceNumber}</span>
                </div>
                <div className="inv-meta-row">
                  <span className="inv-meta-label">التاريخ</span>
                  <span className="inv-meta-val">
                    {formatDate(invoice.date)}
                    {invoice.time ? <span className="inv-time"> — {invoice.time}</span> : null}
                  </span>
                </div>
                <div className="inv-meta-row">
                  <span className="inv-meta-label">الحالة</span>
                  <span className="inv-status-badge" style={{ color: status.color, background: status.bg, border: `1.5px solid ${status.color}50` }}>
                    <StatusIcon /> {status.label}
                  </span>
                </div>
                {orderType && (
                  <div className="inv-meta-row">
                    <span className="inv-meta-label">نوع الطلب</span>
                    <span className="inv-order-badge" style={{ color: orderType.color, background: `${orderType.color}18`, border: `1.5px solid ${orderType.color}40` }}>
                      {orderType.icon} {orderType.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══ RAINBOW DIVIDER ══ */}
          <div className="inv-divider-line"/>

          {/* ══ INFO CARDS ══ */}
          <div className="inv-info-grid">
            {/* customer */}
            <div className="inv-info-card anim-card" style={{ animationDelay: '0.1s' }}>
              <div className="inv-info-card-header">
                <div className="inv-info-header-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <span>بيانات العميل</span>
              </div>
              <div className="inv-info-rows">
                <div className="inv-info-row"><span className="inv-info-label">الاسم</span><span className="inv-info-val bold">{invoice.customerName || '—'}</span></div>
                {invoice.customerPhone && (
                  <div className="inv-info-row"><span className="inv-info-label">رقم التواصل</span><span className="inv-info-val" dir="ltr">{invoice.customerPhone}</span></div>
                )}
                {invoice.customerAddress && (
                  <div className="inv-info-row"><span className="inv-info-label">العنوان</span><span className="inv-info-val">{invoice.customerAddress}</span></div>
                )}
                {invoice.paymentMethod && (
                  <div className="inv-info-row">
                    <span className="inv-info-label">طريقة الدفع</span>
                    <span className="inv-pay-badge">{invoice.paymentMethod}</span>
                  </div>
                )}
              </div>
            </div>

            {/* order details (only if we have relevant data) */}
            {(invoice.employeeName || invoice.deliveryPersonName || invoice.deliveryAddress) && (
              <div className="inv-info-card anim-card" style={{ animationDelay: '0.2s' }}>
                <div className="inv-info-card-header">
                  <div className="inv-info-header-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  </div>
                  <span>تفاصيل الطلب</span>
                </div>
                <div className="inv-info-rows">
                  {invoice.employeeName && (
                    <div className="inv-info-row">
                      <span className="inv-info-label">الموظف</span>
                      <span className="inv-info-val bold inv-employee">{invoice.employeeName}</span>
                    </div>
                  )}
                  {invoice.deliveryPersonName && (
                    <div className="inv-info-row">
                      <span className="inv-info-label">المندوب</span>
                      <span className="inv-info-val bold">{invoice.deliveryPersonName}</span>
                    </div>
                  )}
                  {invoice.deliveryAddress && (
                    <div className="inv-info-row">
                      <span className="inv-info-label">عنوان التوصيل</span>
                      <span className="inv-info-val">{invoice.deliveryAddress}</span>
                    </div>
                  )}
                  {orderType && (
                    <div className="inv-info-row">
                      <span className="inv-info-label">نوع الطلب</span>
                      <span className="inv-info-val">{orderType.icon} {orderType.label}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ══ ITEMS TABLE ══ */}
          <div className="inv-items-section anim-card" style={{ animationDelay: '0.25s' }}>
            <div className="inv-section-title">
              <div className="inv-section-icon-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </div>
              <span>المنتجات والأصناف</span>
              <span className="inv-items-count">{invoice.items.length} صنف</span>
            </div>
            <div className="inv-table-wrapper">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th className="th-num">#</th>
                    <th>المنتج</th>
                    <th className="th-center">الكمية</th>
                    <th className="th-center">سعر الوحدة</th>
                    <th className="th-center">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.length === 0 ? (
                    <tr><td colSpan={5} className="empty-items">لا توجد أصناف مسجلة</td></tr>
                  ) : invoice.items.map((item, i) => (
                    <tr key={item.id} className="item-row" style={{ animationDelay: `${0.3 + i * 0.06}s` }}>
                      <td className="td-num">{i + 1}</td>
                      <td className="td-desc"><span className="item-dot"/>  {item.description}</td>
                      <td className="td-center"><span className="qty-pill">{item.quantity}</span></td>
                      <td className="td-center td-price">{item.price.toFixed(2)} <span className="currency">ج.م</span></td>
                      <td className="td-center td-total">{item.total.toFixed(2)} <span className="currency">ج.م</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ══ TOTALS + NOTES ══ */}
          <div className="inv-bottom-section">
            {invoice.notes && (
              <div className="inv-notes-card anim-card" style={{ animationDelay: '0.4s' }}>
                <div className="inv-notes-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div>
                  <div className="inv-notes-title">ملاحظات</div>
                  <div className="inv-notes-text">{invoice.notes}</div>
                </div>
              </div>
            )}

            <div className="inv-totals-card anim-card" style={{ animationDelay: '0.45s' }}>
              <div className="totals-row">
                <span className="totals-label">المجموع الفرعي</span>
                <span className="totals-val">{subtotal.toFixed(2)} ج.م</span>
              </div>
              {invoice.discount > 0 && (
                <div className="totals-row">
                  <span className="totals-label disc-lbl">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    الخصم
                  </span>
                  <span className="totals-val disc-val">− {invoice.discount.toFixed(2)} ج.م</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="totals-row">
                  <span className="totals-label tax-lbl">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    ضريبة ق.م{invoice.taxRate ? ` ${invoice.taxRate}%` : ''}
                  </span>
                  <span className="totals-val tax-val">+ {invoice.tax.toFixed(2)} ج.م</span>
                </div>
              )}
              <div className="totals-divider"/>
              <div className="totals-grand">
                <span className="grand-label">الإجمالي النهائي</span>
                <span className="grand-val">{invoice.total.toFixed(2)} <span className="grand-currency">ج.م</span></span>
              </div>
            </div>
          </div>

          {/* ══ FOOTER ══ */}
          <div className="inv-footer">
            <div className="inv-footer-inner">

              {/* contact info */}
              <div className="inv-footer-contacts">
                <div className="inv-contact-item">
                  <span className="inv-contact-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  </span>
                  <span>خدمة التوصيل: <span dir="ltr" className="contact-nums">01001706283</span></span>
                </div>
                <div className="inv-contact-item">
                  <span className="inv-contact-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </span>
                  <span>التجمع: التسعين الشمالي، تقاطع محور السادات، أسفل كوبري النائب العام — MUSE MALL</span>
                </div>
              </div>

              {/* social links */}
              <div className="inv-footer-social">
                <a href="https://www.instagram.com/badr_alden_roastery" target="_blank" rel="noopener noreferrer" className="inv-social-btn insta-btn">
                  <InstagramIcon />
                  <span>badr_alden_roastery</span>
                </a>
                <a href="https://www.facebook.com/share/16sijBdhH5/" target="_blank" rel="noopener noreferrer" className="inv-social-btn face-btn">
                  <FacebookIcon />
                  <span>بدر الدين</span>
                </a>
                <a href="https://www.tiktok.com/@badr.alden19" target="_blank" rel="noopener noreferrer" className="inv-social-btn tik-btn">
                  <TikTokIcon />
                  <span>@badr.alden19</span>
                </a>
                <a href="https://wa.me/201001706283" target="_blank" rel="noopener noreferrer" className="inv-social-btn whats-btn">
                  <WhatsAppIcon />
                  <span>واتساب</span>
                </a>
              </div>

              {/* logo + copyright */}
              <div className="inv-footer-brand">
                <img src="/logo.png" alt="بدر الدين" className="inv-footer-logo" />
                <div className="inv-footer-copy-wrap">
                  <span className="inv-footer-name">محمصة بدر الدين</span>
                  <span className="inv-footer-copy">© {new Date().getFullYear()} — جميع الحقوق محفوظة</span>
                </div>
                <div className="inv-verified-badge">
                  <CheckIcon />
                  <span>فاتورة موثقة</span>
                </div>
              </div>
            </div>
          </div>

          {/* bottom gradient bar */}
          <div className="inv-accent-bar"/>
        </div>
      </div>
    </div>
  )
}

export default InvoiceView
