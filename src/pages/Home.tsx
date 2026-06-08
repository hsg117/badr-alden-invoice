import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { encodeInvoiceId } from '../utils/encode'
import { getAllInvoices } from '../data/invoices'

function Home() {
  const [invoiceId, setInvoiceId] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (invoiceId.trim()) {
      const encoded = encodeInvoiceId(invoiceId.trim())
      navigate(`/invoice/${encoded}`)
    }
  }

  return (
    <div className="home-page">
      <div className="home-bg-decoration"></div>
      <div className="home-content">
        <div className="brand-header">
          <img src="/badr-logo.svg" alt="بدر الدين" className="badr-logo-main" />
          <div className="brand-title-group">
            <h1 className="brand-title">بدر الدين</h1>
            <p className="brand-subtitle">نظام الفواتير الإلكترونية</p>
          </div>
        </div>

        <div className="home-card">
          <p className="home-desc">
            لعرض فاتورتك، أدخل رقم الفاتورة أو استخدم رمز QR المطبوع على فاتورتك
          </p>

          <form onSubmit={handleSubmit} className="search-form">
            <input
              type="text"
              placeholder="أدخل رقم الفاتورة"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              className="search-input"
              dir="auto"
            />
            <button type="submit" className="search-btn">🔍 عرض الفاتورة</button>
          </form>

          <div className="quick-links">
            <p className="quick-title">فواتير سريعة:</p>
            <div className="quick-invoices">
              {getAllInvoices().slice(0, 4).map((inv) => (
                <button
                  key={inv.id}
                  className="quick-btn"
                  onClick={() => {
                    const encoded = encodeInvoiceId(inv.id)
                    navigate(`/invoice/${encoded}`)
                  }}
                >
                  {inv.id}
                </button>
              ))}
            </div>
          </div>
        </div>



        <div className="home-footer">
          <p>روابط مشفرة وآمنة - كل فاتورة لها رابط خاص ومشفر بالكامل</p>
          <p className="small">بدر الدين © 2025</p>
        </div>
      </div>
    </div>
  )
}

export default Home
