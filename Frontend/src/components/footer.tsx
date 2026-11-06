import type { MouseEvent } from 'react'
import clubLogo from '../assets/images/logo.jpg'

type FooterProps = {
  currentYear: number
  isArticlePage: boolean
  onNavigate: (path: string) => void
}

function Footer({ currentYear, isArticlePage, onNavigate }: FooterProps) {
  function handleNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || href === '/admin') return

    if (href === '/gallery') {
      event.preventDefault()
      onNavigate(href)
      return
    }

    if (isArticlePage && href.startsWith('#')) {
      event.preventDefault()
      onNavigate(`/${href}`)
    }
  }

  return (
    <footer className="site-footer">
      <div className="site-container footer-main">
        <div className="footer-about">
          <a className="footer-brand" href="#home" onClick={(event) => handleNavigation(event, '#home')}>
            <img src={clubLogo} alt="" width="40" height="40" />
            <span>राना युथ क्लब</span>
          </a>
          <p>हाम्रो राजपुर, हाम्रो आवाज</p>
          <a className="footer-location-link" href="https://maps.app.goo.gl/N4PYtdzysmup5tjY8" target="_blank" rel="noopener noreferrer">
            राजपुर, नेपाल · नक्सामा हेर्नुहोस्
          </a>
        </div>
        <div className="footer-links">
          <h2>द्रुत लिङ्क</h2>
          <a href="#news" onClick={(event) => handleNavigation(event, '#news')}>ताजा समाचार</a>
          <a href="#activities" onClick={(event) => handleNavigation(event, '#activities')}>गतिविधि तथा सेवा</a>
          <a href="/gallery" onClick={(event) => handleNavigation(event, '/gallery')}>तस्बिर ग्यालरी</a>
          <a href="#about" onClick={(event) => handleNavigation(event, '#about')}>हाम्रो बारेमा</a>
        </div>
        <div className="footer-links">
          <h2>सम्पर्क तथा सामाजिक सञ्जाल</h2>
          <span>राजपुर, नेपाल</span>
          <span>आधिकारिक सम्पर्क विवरण आउँदैछ</span>
          <a className="footer-social-link" href="https://www.facebook.com/rana.yutha.klba.rajapura" target="_blank" rel="noopener noreferrer">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v5h4v-5h3l1-4h-4V9c0-.7.3-1 1-1Z" /></svg>
            Facebook मा जोडिनुहोस्
          </a>
          <a href="/admin/login">प्रशासक लगइन</a>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="site-container footer-bottom-inner">
          <span>© {currentYear} राना युथ क्लब</span>
          <a href="#home" onClick={(event) => handleNavigation(event, '#home')}>माथि जानुहोस् ↑</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer