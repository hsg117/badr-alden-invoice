import { useParams, Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { fetchInvoiceByNumber } from '../data/supabaseService'
import { decodeInvoiceId, getInvoiceUrl } from '../utils/encode'
import type { Invoice } from '../types/invoice'
// @ts-ignore
import html2pdf from 'html2pdf.js'

const statusConfig = {
  paid:      { label: 'مدفوع',         color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: '✓' },
  pending:   { label: 'قيد الانتظار', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⏳' },
  cancelled: { label: 'ملغي',          color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: '✕' },
}

const orderTypeConfig: Record<string, { label: string; icon: string; color: string }> = {
  delivery: { label: 'توصيل',   icon: '🛵', color: '#C8722A' },
  online:   { label: 'أونلاين', icon: '💻', color: '#8B5CF6' },
  instore:  { label: 'في المحل', icon: '🏪', color: '#22c55e' },
}

function ToastMsg({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="toast-msg">
      <span>✓</span> {msg}
    </div>
  )
}

function InvoiceView() {
  const { id: encodedId } = useParams<{ id: string }>()
  const realId = encodedId ? decodeInvoiceId(encodedId) : null

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [toast, setToast] = useState('')
  const [visible, setVisible] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      if (!realId) { setNotFound(true); setLoading(false); return }
      const result = await fetchInvoiceByNumber(realId)
      if (result) { setInvoice(result); setNotFound(false) }
      else setNotFound(true)
      setLoading(false)
      setTimeout(() => setVisible(true), 100)
    }
    setLoading(true); setNotFound(false); setVisible(false)
    load()
  }, [realId])

  if (loading) {
    return (
      <div className="iv-page iv-loading-page">
        <div className="iv-loading-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>
        <div className="iv-loading-box">
          <img src="/logo.png" alt="" className="loading-logo" />
          <div className="loading-ring">
            <div></div><div></div><div></div><div></div>
          </div>
          <p className="loading-text">جاري تحميل الفاتورة...</p>
          <div className="loading-dots"><span></span><span></span><span></span></div>
        </div>
      </div>
    )
  }

  if (notFound || !invoice) {
    return (
      <div className="iv-page iv-error-page">
        <div className="iv-loading-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>
        <div className="iv-error-box glass-card">
          <div className="error-icon-big">!</div>
          <h2>الفاتورة غير موجودة</h2>
          <p>لم يتم العثور على الفاتورة المطلوبة.<br/>تأكد من صحة الرابط أو رمز QR.</p>
          <Link to="/" className="iv-back-btn">← العودة للرئيسية</Link>
        </div>
      </div>
    )
  }

  const invoiceUrl = getInvoiceUrl(invoice.id)
  const subtotal = invoice.subtotal || invoice.items.reduce((s, it) => s + it.total, 0)
  const status = statusConfig[invoice.status] || statusConfig.pending
  const orderType = invoice.orderType ? (orderTypeConfig[invoice.orderType] || { label: invoice.orderType, icon: '📋', color: '#C8722A' }) : null

  const handlePrint = () => window.print()

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return
    setIsGeneratingPdf(true)
    try {
      await html2pdf().set({
        margin: 0.4,
        filename: `فاتورة_${invoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }).from(invoiceRef.current).save()
    } catch { alert('حدث خطأ أثناء إنشاء PDF') }
    finally { setIsGeneratingPdf(false) }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invoiceUrl)
    setToast('تم نسخ رابط الفاتورة!')
  }

  return (
    <div className={`iv-page ${visible ? 'iv-visible' : ''}`}>
      {toast && <ToastMsg msg={toast} onDone={() => setToast('')} />}

      <div className="iv-bg">
        <div className="iv-bg-gradient"></div>
        <div className="iv-bg-grid"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="iv-top-bar no-print">
        <Link to="/" className="iv-top-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          الرئيسية
        </Link>
        <div className="iv-top-actions">
          <button onClick={handleCopyLink} className="iv-action-btn btn-copy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            نسخ الرابط
          </button>
          <button onClick={handlePrint} className="iv-action-btn btn-print">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            طباعة
          </button>
          <button onClick={handleDownloadPDF} className={`iv-action-btn btn-pdf ${isGeneratingPdf ? 'loading' : ''}`} disabled={isGeneratingPdf}>
            {isGeneratingPdf ? <span className="btn-spinner"></span> : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="iv-container">
        <div className="invoice-doc" ref={invoiceRef}>

          <div className="inv-header">
            <div className="inv-header-left">
              <img src="/logo-full.png" alt="محمصة بدر الدين" className="inv-logo" />
            </div>
            <div className="inv-header-right">
              <div className="inv-title-badge">فاتورة إلكترونية</div>
              <div className="inv-meta-rows">
                <div className="inv-meta-row">
                  <span className="inv-meta-label">رقم الفاتورة</span>
                  <span className="inv-meta-val inv-num">#{invoice.invoiceNumber}</span>
                </div>
                <div className="inv-meta-row">
                  <span className="inv-meta-label">التاريخ</span>
                  <span className="inv-meta-val">{invoice.date}{invoice.time ? ` — ${invoice.time}` : ''}</span>
                </div>
                <div className="inv-meta-row">
                  <span className="inv-meta-label">الحالة</span>
                  <span className="inv-status-badge" style={{ color: status.color, background: status.bg, border: `1px solid ${status.color}40` }}>
                    <span>{status.icon}</span> {status.label}
                  </span>
                </div>
                {orderType && (
                  <div className="inv-meta-row">
                    <span className="inv-meta-label">نوع الطلب</span>
                    <span className="inv-order-badge" style={{ color: orderType.color, background: `${orderType.color}18`, border: `1px solid ${orderType.color}40` }}>
                      {orderType.icon} {orderType.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="inv-divider-line"></div>

          <div className="inv-info-grid">
            <div className="inv-info-card">
              <div className="inv-info-card-header">
                <span className="inv-info-icon">👤</span>
                <span>بيانات العميل</span>
              </div>
              <div className="inv-info-rows">
                <div className="inv-info-row">
                  <span className="inv-info-label">الاسم</span>
                  <span className="inv-info-val bold">{invoice.customerName || '—'}</span>
                </div>
                {invoice.customerPhone && (
                  <div className="inv-info-row">
                    <span className="inv-info-label">رقم التواصل</span>
                    <span className="inv-info-val" dir="ltr">{invoice.customerPhone}</span>
                  </div>
                )}
                {invoice.customerAddress && (
                  <div className="inv-info-row">
                    <span className="inv-info-label">العنوان</span>
                    <span className="inv-info-val">{invoice.customerAddress}</span>
                  </div>
                )}
                {invoice.paymentMethod && (
                  <div className="inv-info-row">
                    <span className="inv-info-label">طريقة الدفع</span>
                    <span className="inv-info-val">{invoice.paymentMethod}</span>
                  </div>
                )}
              </div>
            </div>

            {(invoice.employeeName || invoice.deliveryPersonName || invoice.deliveryAddress || invoice.orderType === 'delivery') && (
              <div className="inv-info-card">
                <div className="inv-info-card-header">
                  <span className="inv-info-icon">{invoice.orderType === 'delivery' ? '🛵' : '🏪'}</span>
                  <span>تفاصيل الطلب</span>
                </div>
                <div className="inv-info-rows">
                  {invoice.employeeName && (
                    <div className="inv-info-row">
                      <span className="inv-info-label">الموظف</span>
                      <span className="inv-info-val bold highlight-orange">{invoice.employeeName}</span>
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

          <div className="inv-items-section">
            <div className="inv-section-title">
              <span className="inv-section-icon">🛒</span>
              <span>المنتجات</span>
            </div>
            <div className="inv-table-wrapper">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th className="th-num">#</th>
                    <th className="th-desc">المنتج</th>
                    <th className="th-qty">الكمية</th>
                    <th className="th-price">سعر الوحدة</th>
                    <th className="th-total">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.length === 0 ? (
                    <tr><td colSpan={5} className="empty-items">لا توجد أصناف</td></tr>
                  ) : invoice.items.map((item, i) => (
                    <tr key={item.id} style={{ animationDelay: `${i * 0.05}s` }}>
                      <td className="td-num">{i + 1}</td>
                      <td className="td-desc">{item.description}</td>
                      <td className="td-qty"><span className="qty-pill">{item.quantity}</span></td>
                      <td className="td-price">{item.price.toFixed(2)} ج.م</td>
                      <td className="td-total">{item.total.toFixed(2)} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="inv-bottom-section">
            {invoice.notes && (
              <div className="inv-notes-card">
                <div className="inv-notes-icon">📝</div>
                <div>
                  <div className="inv-notes-title">ملاحظات</div>
                  <div className="inv-notes-text">{invoice.notes}</div>
                </div>
              </div>
            )}

            <div className="inv-totals-card">
              <div className="totals-row">
                <span className="totals-label">المجموع الفرعي</span>
                <span className="totals-val">{subtotal.toFixed(2)} ج.م</span>
              </div>
              {invoice.discount > 0 && (
                <div className="totals-row discount-row">
                  <span className="totals-label">الخصم</span>
                  <span className="totals-val discount-val">− {invoice.discount.toFixed(2)} ج.م</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="totals-row tax-row">
                  <span className="totals-label">
                    ضريبة القيمة المضافة{invoice.taxRate ? ` (${invoice.taxRate}%)` : ''}
                  </span>
                  <span className="totals-val tax-val">+ {invoice.tax.toFixed(2)} ج.م</span>
                </div>
              )}
              <div className="totals-divider"></div>
              <div className="totals-row grand-row">
                <span className="grand-label">الإجمالي النهائي</span>
                <span className="grand-val">{invoice.total.toFixed(2)} ج.م</span>
              </div>
            </div>
          </div>

          <div className="inv-footer">
            <div className="inv-footer-contacts">
              <div className="inv-contact-item">
                <span>🛵</span>
                <span>خدمة التوصيل: <span dir="ltr">01117555759 — 01001706283</span></span>
              </div>
              <div className="inv-contact-item">
                <span>📍</span>
                <span>التجمع: التسعين الشمالي تقاطع محور السادات، أسفل كوبري النائب العام، MUSE MALL</span>
              </div>
            </div>
            <div className="inv-footer-social">
              <a href="https://www.instagram.com/badr_alden_roastery" target="_blank" rel="noopener noreferrer" className="inv-social-link insta">📸 انستقرام</a>
              <a href="https://www.facebook.com/share/16sijBdhH5/" target="_blank" rel="noopener noreferrer" className="inv-social-link face">📘 فيسبوك</a>
              <a href="https://www.tiktok.com/@badr.alden19" target="_blank" rel="noopener noreferrer" className="inv-social-link tik">🎵 تيكتوك</a>
            </div>
            <div className="inv-footer-logo">
              <img src="/logo.png" alt="بدر الدين" className="inv-footer-logo-img" />
              <p className="inv-footer-copy">محمصة بدر الدين © {new Date().getFullYear()} — شكراً لثقتكم</p>
            </div>
          </div>

          <div className="inv-accent-bar"></div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceView
