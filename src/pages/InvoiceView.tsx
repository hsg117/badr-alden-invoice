import { useParams, Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { fetchInvoiceByNumber } from '../data/supabaseService'
import { decodeInvoiceId, getInvoiceUrl } from '../utils/encode'
import type { Invoice } from '../types/invoice'
import Logo from '../components/Logo'
// @ts-ignore
import html2pdf from 'html2pdf.js'

const statusMap: Record<string, { label: string; className: string; icon: string }> = {
  paid: { label: 'مدفوع', className: 'status-paid', icon: '✓' },
  pending: { label: 'قيد الانتظار', className: 'status-pending', icon: '⏳' },
  cancelled: { label: 'ملغي', className: 'status-cancelled', icon: '✕' },
}

function InvoiceView() {
  const { id: encodedId } = useParams<{ id: string }>()
  const realId = encodedId ? decodeInvoiceId(encodedId) : null

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      if (!realId) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const result = await fetchInvoiceByNumber(realId)
      if (result) {
        setInvoice(result)
        setNotFound(false)
      } else {
        setNotFound(true)
      }
      setLoading(false)
    }

    setLoading(true)
    setNotFound(false)
    load()
  }, [realId])

  if (loading) {
    return (
      <div className="invoice-page">
        <div className="invoice-container">
          <div className="invoice-loading modern-card">
            <div className="loading-spinner"></div>
            <p>جاري تجهيز الفاتورة الاحترافية...</p>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !invoice) {
    return (
      <div className="invoice-page">
        <div className="invoice-container">
          <div className="invoice-error modern-card">
            <div className="error-icon">!</div>
            <h2>الفاتورة غير موجودة</h2>
            <p>لم يتم العثور على الفاتورة المطلوبة. تأكد من صحة الرابط أو رمز الـ QR.</p>
            <Link to="/" className="action-btn back-btn">← العودة للرئيسية</Link>
          </div>
        </div>
      </div>
    )
  }

  const invoiceUrl = getInvoiceUrl(invoice.id)
  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return
    setIsGeneratingPdf(true)
    
    try {
      const element = invoiceRef.current;
      const opt: any = {
        margin:       0.5,
        filename:     `invoice_${invoice.invoiceNumber}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invoiceUrl)
    
    // Show a beautiful toast instead of alert (using a simple local state if we want, or just alert for now, but let's make it alert for simplicity unless we add a toast component)
    alert('تم نسخ رابط الفاتورة بنجاح')
  }

  return (
    <div className="invoice-page">
      <div className="invoice-bg-decorations no-print">
        <div className="decor-circle decor-1"></div>
        <div className="decor-circle decor-2"></div>
      </div>

      <div className="invoice-container">
        <div className="invoice-actions no-print glass-panel">
          <div className="actions-left">
            <Link to="/" className="action-btn back-btn">
              <span className="icon">⌂</span> الرئيسية
            </Link>
          </div>
          <div className="actions-right">
            <button onClick={handleCopyLink} className="action-btn copy-btn" title="نسخ الرابط">
              <span className="icon">🔗</span> نسخ الرابط
            </button>
            <button onClick={handlePrint} className="action-btn print-btn" title="طباعة">
              <span className="icon">🖨️</span> طباعة
            </button>
            <button 
              onClick={handleDownloadPDF} 
              className="action-btn pdf-btn" 
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <><span className="icon loading-icon">⏳</span> جاري التحميل...</>
              ) : (
                <><span className="icon">📥</span> تحميل PDF</>
              )}
            </button>
          </div>
        </div>

        <div className="invoice-wrapper" ref={invoiceRef}>
          <div className="invoice-premium">
            <div className="invoice-header-premium">
              <div className="header-branding">
                <div className="company-logos">
                  <div className="logo-badr-wrapper">
                    <img src="/badr-logo.svg" alt="بدر الدين" className="badr-logo-img-premium" />
                  </div>
                  <div className="logo-divider"></div>
                  <div className="logo-social-wrapper">
                    <Logo size={45} />
                  </div>
                </div>
                <div className="company-info">
                  <h2>مؤسسة بدر الدين</h2>
                  <p>للتجارة والتوريدات</p>
                </div>
              </div>
              <div className="header-details">
                <div className="invoice-title-badge">فاتورة ضريبية</div>
                <div className="detail-row">
                  <span className="detail-label">رقم الفاتورة:</span>
                  <span className="detail-value invoice-number">{invoice.invoiceNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">التاريخ:</span>
                  <span className="detail-value">{invoice.date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">الحالة:</span>
                  <span className={`status-badge-premium ${statusMap[invoice.status]?.className || ''}`}>
                    <span className="status-icon">{statusMap[invoice.status]?.icon}</span>
                    {statusMap[invoice.status]?.label || invoice.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="invoice-body-premium">
              <div className="customer-card-premium">
                <div className="card-accent-line"></div>
                <h3 className="section-title">بيانات العميل</h3>
                <div className="customer-details">
                  <div className="info-group">
                    <span className="info-icon">👤</span>
                    <div className="info-text">
                      <span className="info-label">الاسم</span>
                      <strong className="customer-name">{invoice.customerName}</strong>
                    </div>
                  </div>
                  {invoice.customerPhone && (
                    <div className="info-group">
                      <span className="info-icon">📱</span>
                      <div className="info-text">
                        <span className="info-label">رقم التواصل</span>
                        <span className="customer-phone">{invoice.customerPhone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="items-table-container">
                <table className="items-table-premium">
                  <thead>
                    <tr>
                      <th className="col-num">#</th>
                      <th className="col-desc">البيان</th>
                      <th className="col-qty">الكمية</th>
                      <th className="col-price">سعر الوحدة</th>
                      <th className="col-total">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-row">لا توجد أصناف مسجلة في هذه الفاتورة</td>
                      </tr>
                    ) : (
                      invoice.items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="col-num">{index + 1}</td>
                          <td className="col-desc">
                            <span className="item-name">{item.description}</span>
                          </td>
                          <td className="col-qty">
                            <span className="qty-badge">{item.quantity}</span>
                          </td>
                          <td className="col-price">{item.price.toFixed(2)}</td>
                          <td className="col-total font-bold">{item.total.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="summary-section">
                {invoice.notes && (
                  <div className="notes-card">
                    <div className="notes-icon">📝</div>
                    <div className="notes-content">
                      <h4>ملاحظات</h4>
                      <p>{invoice.notes}</p>
                    </div>
                  </div>
                )}
                
                <div className="totals-card">
                  <div className="summary-row">
                    <span className="summary-label">المجموع الفرعي</span>
                    <span className="summary-value">{subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="summary-row discount">
                      <span className="summary-label">الخصم</span>
                      <span className="summary-value">-{invoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.tax > 0 && (
                    <div className="summary-row tax">
                      <span className="summary-label">ضريبة القيمة المضافة (5%)</span>
                      <span className="summary-value">{invoice.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="summary-row grand-total">
                    <span className="summary-label">الإجمالي النهائي</span>
                    <span className="summary-value highlight-value">
                      {invoice.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="invoice-footer-premium">
              <div className="footer-contact-info">
                <div className="contact-grid">
                  <div className="contact-item new-contact">
                    <span className="contact-icon">🛵</span>
                    <span className="contact-text">خدمة التوصيل: <span dir="ltr">01117555759 - 01001706283</span></span>
                  </div>
                  <div className="contact-item new-contact">
                    <span className="contact-icon">📍</span>
                    <span className="contact-text">فرع التجمع: التسعين الشمالي تقاطع محور السادات، أسفل كوبري النائب العام، MUSE MALL موازي اللوتس الشمالية</span>
                  </div>
                </div>
                <div className="social-links">
                  <a href="https://www.instagram.com/badr_alden_roastery" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                    📸 انستقرام
                  </a>
                  <a href="https://www.facebook.com/share/16sijBdhH5/" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                    📘 فيسبوك
                  </a>
                  <a href="https://www.tiktok.com/@badr.alden19" target="_blank" rel="noopener noreferrer" className="social-link tiktok">
                    🎵 تيكتوك
                  </a>
                </div>
              </div>
              <div className="footer-qr-compact">
                <div className="qr-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/badr-logo.svg" alt="بدر الدين" style={{ width: '80%', height: 'auto', opacity: 0.8 }} />
                </div>
              </div>
            </div>
            
            <div className="bottom-accent-bar"></div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default InvoiceView
