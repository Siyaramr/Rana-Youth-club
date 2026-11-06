import { useState, type FormEvent } from 'react'
import clubLogo from '../assets/images/logo.jpg'
import './AdminLayout.css'

export type AdminAuthMode = 'login' | 'signup'

type AdminLayoutProps = {
  mode: AdminAuthMode
  onNavigate: (path: string) => void
}

function AdminLayout({ mode, onNavigate }: AdminLayoutProps) {
  const [notice, setNotice] = useState('')
  const isSignup = mode === 'signup'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('यो फारमको authentication सेवा जोडिएको छैन। वास्तविक लगइन वा खाता सिर्जना अहिले हुँदैन।')
  }

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card" aria-labelledby="admin-auth-title">
        <a className="admin-auth-brand" href="/" onClick={(event) => {
          event.preventDefault()
          onNavigate('/')
        }}>
          <img src={clubLogo} alt="" width="48" height="48" />
          <span>
            <strong>राना युथ क्लब</strong>
            <small>प्रशासक क्षेत्र</small>
          </span>
        </a>

        <div className="admin-auth-tabs" aria-label="प्रशासक खाता विकल्प">
          <button
            type="button"
            className={!isSignup ? 'active' : ''}
            aria-current={!isSignup ? 'page' : undefined}
            onClick={() => onNavigate('/admin/login')}
          >
            लगइन
          </button>
          <button
            type="button"
            className={isSignup ? 'active' : ''}
            aria-current={isSignup ? 'page' : undefined}
            onClick={() => onNavigate('/admin/signup')}
          >
            खाता खोल्नुहोस्
          </button>
        </div>

        <h1 id="admin-auth-title">{isSignup ? 'प्रशासक खाता खोल्नुहोस्' : 'प्रशासक लगइन'}</h1>
        <p className="admin-auth-description">
          {isSignup
            ? 'प्रशासक खाताका लागि आफ्नो विवरण भर्नुहोस्।'
            : 'व्यवस्थापन क्षेत्रमा प्रवेश गर्न आफ्नो विवरण भर्नुहोस्।'}
        </p>

        <div className="admin-auth-warning" role="note">
          यो हाल देखावटका लागि मात्र हो। सुरक्षित प्रमाणीकरण सेवा जोडिएको छैन; वास्तविक पासवर्ड प्रयोग नगर्नुहोस्।
        </div>

        <form className="admin-auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              पूरा नाम
              <input name="name" type="text" autoComplete="name" required />
            </label>
          )}
          <label>
            इमेल
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            पासवर्ड
            <input
              name="password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={8}
              required
            />
          </label>
          <button className="admin-auth-submit" type="submit">
            {isSignup ? 'खाता खोल्नुहोस्' : 'लगइन गर्नुहोस्'}
          </button>
        </form>

        {notice && <p className="admin-auth-notice" role="status">{notice}</p>}

        <button className="admin-auth-dashboard-link" type="button" onClick={() => onNavigate('/admin')}>
          स्थानीय ड्यासबोर्ड खोल्नुहोस्
        </button>
        <button className="admin-auth-home-link" type="button" onClick={() => onNavigate('/')}>
          सार्वजनिक साइटमा फर्कनुहोस्
        </button>
      </section>
    </main>
  )
}

export default AdminLayout