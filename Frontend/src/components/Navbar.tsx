import { useState, type FormEvent, type MouseEvent } from 'react'
import clubLogo from '../assets/images/logo.jpg'

type NavigationItem = {
  label: string
  href: string
}

type NavbarProps = {
  navigation: NavigationItem[]
  isArticlePage: boolean
  searchQuery: string
  onNavigate: (path: string) => void
  onSearch: (event: FormEvent<HTMLFormElement>) => void
  onSearchQueryChange: (query: string) => void
}

function Navbar({
  navigation,
  isArticlePage,
  searchQuery,
  onNavigate,
  onSearch,
  onSearchQueryChange,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  function handleNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    setMenuOpen(false)
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    if (href === '/gallery') {
      event.preventDefault()
      onNavigate(href)
    } else if (isArticlePage && href.startsWith('#')) {
      event.preventDefault()
      onNavigate(`/${href}`)
    }
  }

  function handleHomeLink(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setMenuOpen(false)
    onNavigate('/')
  }

  return (
    <>
      <div className="utility-bar">
        <div className="site-container utility-inner">
          <span className="utility-location">
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <path d="M10 18s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
              <circle cx="10" cy="8" r="2" />
            </svg>
            राजपुर, नेपाल
          </span>
          <span>स्थानीय आवाज, समुदायका लागि</span>
        </div>
      </div>

      <header className="site-header" id="home">
        <div className="site-container header-inner">
          <a className="brand" href="/" aria-label="राना युथ क्लब गृहपृष्ठ" onClick={handleHomeLink}>
            <img
              className="brand-logo"
              src={clubLogo}
              alt="राना युथ क्लबको लोगो"
              width="48"
              height="48"
            />
            <span className="brand-copy">
              <strong>राना युथ क्लब</strong>
              <span>राजपुर, नेपाल</span>
            </span>
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'मेनु बन्द गर्नुहोस्' : 'मेनु खोल्नुहोस्'}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav
            className={`primary-navigation${menuOpen ? ' is-open' : ''}`}
            id="primary-navigation"
            aria-label="मुख्य नेभिगेसन"
          >
            {navigation.map((item) => (
              <a key={item.href} href={item.href} onClick={(event) => handleNavigation(event, item.href)}>
                {item.label}
              </a>
            ))}
            <a className="mobile-admin-link" href="/admin/login" onClick={() => setMenuOpen(false)}>
              प्रशासक लगइन
            </a>
          </nav>

          <div className="header-actions">
            <form className="search-form" role="search" onSubmit={onSearch}>
              <label className="visually-hidden" htmlFor="site-search">समाचार खोज्नुहोस्</label>
              <input
                id="site-search"
                type="search"
                placeholder="समाचार खोज्नुहोस्"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
              />
              <button type="submit" aria-label="खोज्नुहोस्">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 5 5" />
                </svg>
              </button>
            </form>
            <a className="admin-link" href="/admin/login">
              <svg aria-hidden="true" viewBox="0 0 20 20">
                <path d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4 17c.4-2.7 2.5-4 6-4s5.6 1.3 6 4" />
              </svg>
              प्रशासक लगइन
            </a>
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar