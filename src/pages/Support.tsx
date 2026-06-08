import { Link } from 'react-router-dom'

function Support() {
  return (
    <div className="support-page">
      <div className="support-bg-decoration"></div>
      <div className="support-content">
        <div className="brand-header">
          <img src="/badr-logo.svg" alt="بدر الدين" className="badr-logo-main" />
          <div className="brand-title-group">
            <h1 className="brand-title">بدر الدين</h1>
            <p className="brand-subtitle">التواصل والدعم الفني</p>
          </div>
        </div>

        <p className="support-intro">
          نحن هنا لمساعدتك على مدار الساعة. تواصل معنا عبر أي من القنوات التالية:
        </p>

        <div className="contact-cards">
          <a href="https://wa.me/966512345678" target="_blank" rel="noopener noreferrer" className="contact-card whatsapp">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <h3>واتساب</h3>
            <p>تواصل مباشر وسريع</p>
            <span className="contact-handle">@FsFSn01</span>
          </a>

          <a href="https://t.me/FsFSn01" target="_blank" rel="noopener noreferrer" className="contact-card telegram">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </div>
            <h3>تيليجرام</h3>
            <p>قنوات وأخبار</p>
            <span className="contact-handle">@FsFSn01</span>
          </a>

          <a href="https://twitter.com/FsFSn01" target="_blank" rel="noopener noreferrer" className="contact-card twitter">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <h3>تويتر / X</h3>
            <p>آخر التحديثات</p>
            <span className="contact-handle">@FsFSn01</span>
          </a>

          <a href="mailto:support@FsFSn01.com" className="contact-card email">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <h3>البريد الإلكتروني</h3>
            <p>راسلنا مباشرة</p>
            <span className="contact-handle">support@FsFSn01.com</span>
          </a>
        </div>

        <Link to="/" className="back-btn">← العودة للرئيسية</Link>
      </div>
    </div>
  )
}

export default Support
