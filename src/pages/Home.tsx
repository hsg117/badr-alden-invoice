import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { encodeInvoiceId } from '../utils/encode'

function Home() {
  const [invoiceId, setInvoiceId] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, duration: number, delay: number}>>([])
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const ps = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 15 + 8,
      delay: Math.random() * 10,
    }))
    setParticles(ps)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoiceId.trim()) return
    setIsSearching(true)
    await new Promise(r => setTimeout(r, 600))
    const encoded = encodeInvoiceId(invoiceId.trim())
    navigate(`/invoice/${encoded}`)
  }

  return (
    <div className="home-page">
      <div className="home-bg">
        <div className="home-bg-gradient"></div>
        <div className="home-bg-grid"></div>
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="home-content">
        <div className="home-logo-section">
          <div className="logo-glow-ring">
            <img src="/logo-full.png" alt="بدر الدين" className="home-logo-img" />
          </div>
          <div className="home-brand-text">
            <h1 className="home-brand-name">محمصة بدر الدين</h1>
            <p className="home-brand-tagline">نظام الفواتير الإلكتروني الاحترافي</p>
            <div className="brand-divider">
              <span></span><span className="divider-dot"></span><span></span>
            </div>
          </div>
        </div>

        <div className="home-card glass-card">
          <div className="card-shine"></div>
          <div className="card-top-bar"></div>

          <div className="card-inner">
            <div className="search-icon-wrap">
              <div className="search-icon-bg">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
            </div>

            <h2 className="card-title">عرض فاتورتك</h2>
            <p className="card-desc">أدخل رقم الفاتورة الخاص بك أو امسح رمز QR المطبوع عليها</p>

            <form onSubmit={handleSubmit} className="search-form">
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="رقم الفاتورة..."
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className="search-input"
                  dir="auto"
                  autoComplete="off"
                />
              </div>
              <button type="submit" className={`search-btn ${isSearching ? 'searching' : ''}`} disabled={isSearching}>
                {isSearching ? (
                  <span className="btn-spinner"></span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <span>عرض الفاتورة</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <span>روابط مشفرة وآمنة</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <span>متوافق مع الجوال</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <span>عرض فوري للبيانات</span>
          </div>
        </div>

        <p className="home-footer-text">محمصة بدر الدين © {new Date().getFullYear()} — جميع الحقوق محفوظة</p>
      </div>
    </div>
  )
}

export default Home
