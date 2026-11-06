import { useEffect, useState, type FormEvent, type MouseEvent } from 'react'
import {
  addClubProfileUpdateListener,
  clubProfile,
  getClubProfile,
  type ClubProfile,
} from './data/clubProfile'
import About from './Pages/About'
import { addNewsUpdateListener, getNewsArticles, type NewsArticle } from './data/newsStore'
import AdminDashboard from './Pages/AdminDashboard'
import Footer from './components/footer'
import Navbar from './components/Navbar'
import AdminLayout, { type AdminAuthMode } from './Layout/AdminLayout'
import groupPhotoOne from './assets/images/820147492_122187905930783854_7063860979059703753_n.jpg'
import rajpurBoard from './assets/images/Rajpur board.jpg'
import culturePhoto from './assets/images/Rana dress.jpg'
import heritagePhoto from './assets/images/macha.jpg'
import groupPhotoTwo from './assets/images/hori.jpg'
import communityPhoto from './assets/images/745314167_122180708294783854_4917434312983988106_n.jpg'
import culturalGroupPhoto from './assets/images/601511063_122158250174783854_8090778687126995892_n.jpg'
import culturalPortraitPhoto from './assets/images/515584592_122134370522783854_2485462315820806515_n.jpg'
import './App.css'

const currentYear = new Date().getFullYear()
const newsPageSize = 6
const newsCategories = ['समुदाय', 'युवा', 'शिक्षा', 'स्वास्थ्य', 'खेलकुद', 'सूचना']

function formatNewsDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('ne-NP')
}

const navigation = [
  { label: 'गृहपृष्ठ', href: '#home' },
  { label: 'समाचार', href: '#news' },
  { label: 'गतिविधि', href: '#activities' },
  { label: 'तस्बिर', href: '/gallery' },
  { label: 'भिडियो', href: '#videos' },
  { label: 'हाम्रो बारेमा', href: '#about' },
  { label: 'सम्पर्क', href: '#contact' },
]

const galleryPhotos = [
  {
    src: rajpurBoard,
    alt: 'राजपुर लेखिएको स्थानीय स्वागत बोर्ड',
    label: 'राजपुर, नेपाल',
  },
  {
    src: groupPhotoOne,
    alt: 'परम्परागत पोशाकमा सजिएका स्थानीय सदस्यहरूको सामूहिक तस्बिर',
    label: 'हाम्रो समूह',
  },
  {
    src: groupPhotoTwo,
    alt: 'बाहिर भेला भएका स्थानीय समुदायका सदस्यहरूको तस्बिर',
    label: 'समुदायका सदस्य',
  },
  {
    src: culturePhoto,
    alt: 'परम्परागत नेपाली पोशाकमा एक जना व्यक्ति',
    label: 'परम्परागत पोशाक',
  },
  {
    src: heritagePhoto,
    alt: 'परम्परागत कृषि सामग्री र बालीको तस्बिर',
    label: 'स्थानीय जीवनशैली',
  },
  {
    src: communityPhoto,
    alt: 'परम्परागत पोशाकमा समुदायका सदस्यहरूको सामूहिक तस्बिर',
    label: 'समुदायको सामूहिक तस्बिर',
  },
  {
    src: culturalGroupPhoto,
    alt: 'परम्परागत पोशाकमा सजिएका महिलाहरूको समूह',
    label: 'परम्परागत पोशाक',
  },
  {
    src: culturalPortraitPhoto,
    alt: 'परम्परागत पोशाकमा एक महिलाको तस्बिर',
    label: 'सांस्कृतिक पहिचान',
  },
]

type GalleryPhoto = (typeof galleryPhotos)[number]

const videoPreviews = [
  {
    src: groupPhotoTwo,
    alt: 'भिडियो ग्यालरीका लागि स्थानीय समुदायको तस्बिर',
  },
  {
    src: heritagePhoto,
    alt: 'भिडियो ग्यालरीका लागि स्थानीय जीवनशैलीको तस्बिर',
  },
]

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10h12m-5-5 5 5-5 5" />
    </svg>
  )
}

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="section-kicker">{eyebrow}</span>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  )
}

function ArticleDetail({
  article,
  onNavigate,
}: {
  article: NewsArticle | undefined
  onNavigate: (path: string) => void
}) {
  const [shareMessage, setShareMessage] = useState('')

  async function shareArticle() {
    if (!article) return

    const url = new URL(`/news/${encodeURIComponent(article.slug)}`, window.location.origin).href
    const shareData = { title: article.title, text: article.summary, url }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setShareMessage('समाचार साझा गरियो।')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setShareMessage('साझा गर्न सकिएन। लिङ्क प्रतिलिपि गर्ने प्रयास गर्नुहोस्।')
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const field = document.createElement('textarea')
        field.value = url
        field.setAttribute('readonly', '')
        field.style.position = 'fixed'
        field.style.opacity = '0'
        document.body.append(field)
        field.select()
        const copied = document.execCommand('copy')
        field.remove()
        if (!copied) throw new Error('Clipboard copy was not available')
      }
      setShareMessage('समाचारको लिङ्क प्रतिलिपि गरियो।')
    } catch {
      setShareMessage('लिङ्क प्रतिलिपि गर्न सकिएन। कृपया ब्राउजरबाट URL प्रतिलिपि गर्नुहोस्।')
    }
  }

  if (!article) {
    return (
      <main className="article-page site-container" id="main-content">
        <a className="text-link" href="/#news" onClick={(event) => {
          event.preventDefault()
          onNavigate('/#news')
        }}>
          समाचारमा फर्कनुहोस् <ArrowIcon />
        </a>
        <div className="empty-state article-not-found" role="status">
          <h1>समाचार भेटिएन</h1>
          <p>यो समाचार उपलब्ध छैन वा हटाइएको हुन सक्छ।</p>
        </div>
      </main>
    )
  }

  return (
    <main className="article-page site-container" id="main-content">
      <a className="text-link" href="/#news" onClick={(event) => {
        event.preventDefault()
        onNavigate('/#news')
      }}>
        ताजा समाचारमा फर्कनुहोस् <ArrowIcon />
      </a>
      <article className="article-detail">
        <span className="news-badge">{article.category}</span>
        <h1>{article.title}</h1>
        <div className="article-meta">
          <time dateTime={article.date}>{formatNewsDate(article.date)}</time>
          <button className="button button-outline share-button" type="button" onClick={shareArticle}>
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <circle cx="15" cy="4" r="2.5" />
              <circle cx="5" cy="10" r="2.5" />
              <circle cx="15" cy="16" r="2.5" />
              <path d="m7.2 8.8 5.5-3.5m-5.5 5.9 5.5 3.5" />
            </svg>
            समाचार साझा गर्नुहोस्
          </button>
        </div>
        {shareMessage && <p className="share-message" role="status">{shareMessage}</p>}
        <img className="article-image" src={article.image} alt={article.imageAlt} />
        <p className="article-summary">{article.summary}</p>
        <div className="article-content">{article.content}</div>
      </article>
    </main>
  )
}

function GalleryPage({
  photos,
  onNavigate,
}: {
  photos: GalleryPhoto[]
  onNavigate: (path: string) => void
}) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const selectedPhoto = selectedPhotoIndex === null ? null : photos[selectedPhotoIndex]

  useEffect(() => {
    if (selectedPhotoIndex === null) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedPhotoIndex(null)
      if (event.key === 'ArrowRight') {
        setSelectedPhotoIndex((index) => index === null ? null : (index + 1) % photos.length)
      }
      if (event.key === 'ArrowLeft') {
        setSelectedPhotoIndex((index) => index === null ? null : (index - 1 + photos.length) % photos.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [photos.length, selectedPhotoIndex])

  return (
    <main className="gallery-page" id="main-content">
      <section className="gallery-page-section section-space" aria-labelledby="gallery-page-title">
        <div className="site-container">
          <a className="text-link gallery-back-link" href="/" onClick={(event) => {
            event.preventDefault()
            onNavigate('/')
          }}>
            गृहपृष्ठमा फर्कनुहोस् <ArrowIcon />
          </a>
          <div className="section-heading gallery-page-heading">
            <div>
              <span className="section-kicker">तस्बिर संग्रह</span>
              <h1 id="gallery-page-title">तस्बिर ग्यालरी</h1>
              <p>तस्बिरलाई ठूलो आकारमा स्पष्ट हेर्न कुनै तस्बिरमा थिच्नुहोस्।</p>
            </div>
            <span className="gallery-label">{photos.length} तस्बिर</span>
          </div>
          {photos.length > 0 ? (
            <div className="gallery-page-grid">
              {photos.map((photo, index) => (
                <button
                  className="gallery-page-card"
                  type="button"
                  key={`${photo.src}-${index}`}
                  onClick={() => setSelectedPhotoIndex(index)}
                  aria-label={`${photo.label} — ठूलो आकारमा हेर्नुहोस्`}
                >
                  <span className="gallery-page-image">
                    <img src={photo.src} alt={photo.alt} loading="lazy" />
                  </span>
                  <span className="gallery-page-caption">
                    <strong>{photo.label}</strong>
                    <small>{photo.alt}</small>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state" role="status">
              <h2>अहिले तस्बिर उपलब्ध छैनन्</h2>
              <p>तस्बिरहरू थपिएपछि यहाँ देखिनेछन्।</p>
            </div>
          )}
        </div>
      </section>

      {selectedPhoto && (
        <div className="gallery-lightbox" role="presentation" onClick={() => setSelectedPhotoIndex(null)}>
          <section
            className="gallery-lightbox-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedPhoto.label} को ठूलो तस्बिर`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="gallery-lightbox-close"
              type="button"
              aria-label="तस्बिर बन्द गर्नुहोस्"
              onClick={() => setSelectedPhotoIndex(null)}
            >
              ×
            </button>
            <button
              className="gallery-lightbox-arrow gallery-lightbox-prev"
              type="button"
              aria-label="अघिल्लो तस्बिर"
              onClick={() => setSelectedPhotoIndex((index) => index === null ? null : (index - 1 + photos.length) % photos.length)}
            >
              ‹
            </button>
            <img className="gallery-lightbox-image" src={selectedPhoto.src} alt={selectedPhoto.alt} />
            <button
              className="gallery-lightbox-arrow gallery-lightbox-next"
              type="button"
              aria-label="अर्को तस्बिर"
              onClick={() => setSelectedPhotoIndex((index) => index === null ? null : (index + 1) % photos.length)}
            >
              ›
            </button>
            <p className="gallery-lightbox-caption">
              <strong>{selectedPhoto.label}</strong>
              <span>{selectedPhotoIndex! + 1} / {photos.length}</span>
            </p>
          </section>
        </div>
      )}
    </main>
  )
}

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [visibleCount, setVisibleCount] = useState(newsPageSize)
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname + window.location.hash)
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [newsLoadError, setNewsLoadError] = useState('')
  const [profile, setProfile] = useState<ClubProfile>(clubProfile)
  const [profileLoadError, setProfileLoadError] = useState('')

  useEffect(() => {
    const updatePath = () => setCurrentPath(window.location.pathname + window.location.hash)
    window.addEventListener('popstate', updatePath)
    return () => window.removeEventListener('popstate', updatePath)
  }, [])

  useEffect(() => {
    function refreshProfile() {
      try {
        setProfile(getClubProfile())
        setProfileLoadError('')
      } catch {
        setProfile(clubProfile)
        setProfileLoadError('क्लब प्रोफाइल लोड हुन सकेन। स्थानीय डाटा सही ढाँचामा छैन।')
      }
    }
    refreshProfile()
    return addClubProfileUpdateListener(refreshProfile)
  }, [])

  useEffect(() => {
    function refreshNews() {
      try {
        setNewsArticles(getNewsArticles())
        setNewsLoadError('')
      } catch {
        setNewsLoadError('समाचार लोड गर्न सकिएन। स्थानीय समाचार डाटा सही ढाँचामा छैन।')
      }
    }
    refreshNews()
    return addNewsUpdateListener(refreshNews)
  }, [])

  function navigateTo(path: string) {
    window.history.pushState({}, '', path)
    setCurrentPath(window.location.pathname + window.location.hash)
    const hash = window.location.hash
    if (hash) {
      window.setTimeout(() => document.querySelector(hash)?.scrollIntoView(), 0)
    } else {
      window.scrollTo(0, 0)
    }
  }

  function handleArticleLink(event: MouseEvent<HTMLAnchorElement>, path: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigateTo(path)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setVisibleCount(newsPageSize)
    if (articlePath.startsWith('/news/')) {
      navigateTo('/#news')
      return
    }
    document.querySelector('#news')?.scrollIntoView()
  }

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase()
  const filteredArticles = newsArticles.filter((article) => article.status === 'published').sort((first, second) => second.date.localeCompare(first.date)).filter((article) => {
    const matchesQuery = !normalizedQuery
      || `${article.title} ${article.content}`.toLocaleLowerCase().includes(normalizedQuery)
    const matchesCategory = !selectedCategory || article.category === selectedCategory
    return matchesQuery && matchesCategory
  })
  const visibleArticles = filteredArticles.slice(0, visibleCount)
  const featuredArticle = newsArticles.find((article) => article.status === 'published' && article.featured)
  const publishedGalleryPhotos = newsArticles
    .filter((article) => article.status === 'published')
    .flatMap((article) =>
      [article.image, ...article.galleryImages].map((src, index) => ({
        src,
        alt: index === 0 ? article.imageAlt || article.title : `${article.title} — ग्यालरी तस्बिर ${index}`,
        label: article.title,
      })),
    )
  const displayGalleryPhotos = publishedGalleryPhotos.length ? publishedGalleryPhotos : galleryPhotos
  const articlePath = currentPath.split('#')[0]
  let articleId = ''
  if (articlePath.startsWith('/news/')) {
    try {
      articleId = decodeURIComponent(articlePath.slice('/news/'.length))
    } catch {
      articleId = ''
    }
  }
  const currentArticle = articleId
    ? newsArticles.find((article) => article.status === 'published' && (article.slug === articleId || article.id === articleId))
    : undefined
  const adminAuthMode: AdminAuthMode | null = articlePath === '/admin/login'
    ? 'login'
    : articlePath === '/admin/signup'
      ? 'signup'
      : null

  return (
    <>
      {articlePath.startsWith('/admin') ? (
        adminAuthMode ? (
          <AdminLayout mode={adminAuthMode} onNavigate={navigateTo} />
        ) : (
          <AdminDashboard onExit={() => navigateTo('/')} onPublicUpdate={() => {
            try {
              setNewsArticles(getNewsArticles())
              setNewsLoadError('')
            } catch {
              setNewsLoadError('समाचार लोड गर्न सकिएन। स्थानीय समाचार डाटा सही ढाँचामा छैन।')
            }
          }} />
        )
      ) : <>
      <a className="skip-link" href="#main-content">मुख्य सामग्रीमा जानुहोस्</a>
      <Navbar
        navigation={navigation}
        isArticlePage={articlePath !== '/'}
        searchQuery={searchQuery}
        onNavigate={navigateTo}
        onSearch={handleSearch}
        onSearchQueryChange={(query) => {
          setSearchQuery(query)
          setVisibleCount(newsPageSize)
        }}
      />

      {articlePath.startsWith('/news/')
        ? <ArticleDetail article={currentArticle} onNavigate={navigateTo} />
        : articlePath === '/gallery'
          ? <GalleryPage photos={displayGalleryPhotos} onNavigate={navigateTo} />
          : <main id="main-content">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="site-container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow"><span /> समुदायको साझा चौतारी</span>
              <h1 id="hero-title">हाम्रो राजपुर,<br /><span>हाम्रो आवाज</span></h1>
              <p>
                राजपुरका खबर, विचार र समुदायका आवाजलाई एउटै ठाउँमा जोड्ने
                हाम्रो साझा प्रयास।
              </p>
              <a className="button button-light" href="#news">
                समाचार हेर्नुहोस्
                <ArrowIcon />
              </a>
              <div className="hero-note">
                <span className="note-rule" />
                <span>स्थानीय कथा, स्थानीय पहिचान</span>
              </div>
            </div>
            <div className="hero-image-wrap">
              {imageStatus !== 'error' ? (
                <img
                  className={`hero-image${imageStatus === 'loading' ? ' is-loading' : ''}`}
                  src={groupPhotoOne}
                  alt="राना युथ क्लबका सदस्यहरूको सामूहिक तस्बिर"
                  onLoad={() => setImageStatus('loaded')}
                  onError={() => setImageStatus('error')}
                />
              ) : (
                <div className="image-fallback" role="alert">
                  <span aria-hidden="true">◌</span>
                  <p>तस्बिर अहिले उपलब्ध छैन।</p>
                </div>
              )}
              {imageStatus === 'loading' && (
                <div className="image-loading" role="status">
                  <span className="loading-spinner" aria-hidden="true" />
                  तस्बिर लोड हुँदैछ
                </div>
              )}
              <div className="image-caption">
                <span className="caption-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20"><path d="M3 15 8 9l3 3 3-5 4 8H3Z" /></svg>
                </span>
                <span>राना युथ क्लबका सदस्यहरू</span>
              </div>
              <span className="image-decoration" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="news-section section-space" id="news" aria-labelledby="news-title">
          <div className="site-container">
            <div className="section-heading">
              <div>
                <span className="section-kicker">राजपुरबाट</span>
                <h2 id="news-title">ताजा स्थानीय समाचार</h2>
                <p>समुदायका प्रमाणित खबर र गतिविधि यहाँ पढ्नुहोस्।</p>
              </div>
              <a className="text-link" href="#contact">
                समाचार पठाउनुहोस् <ArrowIcon />
              </a>
            </div>

            <div className="news-controls">
              <label className="category-filter">
                <span>समाचारको श्रेणी</span>
                <select
                  value={selectedCategory}
                  onChange={(event) => {
                    setSelectedCategory(event.target.value)
                    setVisibleCount(newsPageSize)
                  }}
                >
                  <option value="">सबै श्रेणी</option>
                  {newsCategories.map((category) => (
                    <option value={category} key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <span className="news-count" aria-live="polite">
                {filteredArticles.length} समाचार
              </span>
            </div>

            {newsLoadError ? (
              <div className="empty-state news-empty" role="alert">
                <h3>समाचार लोड हुन सकेन</h3>
                <p>{newsLoadError}</p>
              </div>
            ) : visibleArticles.length > 0 ? (
              <div className="news-card-grid">
                {visibleArticles.map((article) => (
                  <a
                    className="news-card"
                    href={`/news/${encodeURIComponent(article.slug)}`}
                    key={article.id}
                    onClick={(event) => handleArticleLink(event, `/news/${encodeURIComponent(article.slug)}`)}
                  >
                    <div className="news-card-image">
                      <img src={article.image} alt={article.imageAlt} loading="lazy" />
                    </div>
                    <div className="news-card-copy">
                      <div className="news-card-meta">
                        <span className="news-badge">{article.category}</span>
                        <time dateTime={article.date}>
                          {formatNewsDate(article.date)}
                        </time>
                      </div>
                      <h3>{article.title}</h3>
                      <p>{article.summary}</p>
                      <span className="news-card-link">पूरा समाचार पढ्नुहोस् <ArrowIcon /></span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-state news-empty" role="status">
                <div className="empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48">
                    <path d="M10 8h28v32H10zM17 17h14M17 24h14M17 31h8" />
                    <path d="m31 34 3 3 6-7" />
                  </svg>
                </div>
                <h3>
                  {normalizedQuery || selectedCategory ? 'समाचार भेटिएन' : 'समाचार चाँडै आउँदैछन्'}
                </h3>
                <p>
                  {normalizedQuery || selectedCategory
                    ? 'यो खोजी वा श्रेणीमा प्रकाशित समाचार छैन। अर्को शब्द वा श्रेणीले प्रयास गर्नुहोस्।'
                    : 'अहिले प्रकाशित समाचार छैनन्। नयाँ सामग्री प्रकाशित भएपछि यहीँ देखिनेछ।'}
                </p>
                {(normalizedQuery || selectedCategory) && (
                  <button
                    className="button button-outline"
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('')
                      setVisibleCount(newsPageSize)
                    }}
                  >
                    सबै समाचार हेर्नुहोस्
                  </button>
                )}
              </div>
            )}
            {visibleArticles.length < filteredArticles.length && (
              <div className="load-more-wrap">
                <button
                  className="button button-outline"
                  type="button"
                  onClick={() => setVisibleCount((count) => count + newsPageSize)}
                >
                  थप समाचार हेर्नुहोस्
                </button>
              </div>
            )}
            {featuredArticle ? (
              <a className="featured-card featured-card-live" href={`/news/${encodeURIComponent(featuredArticle.slug)}`} onClick={(event) => handleArticleLink(event, `/news/${encodeURIComponent(featuredArticle.slug)}`)}>
                <div className="featured-live-image"><img src={featuredArticle.image} alt={featuredArticle.imageAlt} /></div>
                <div className="featured-copy">
                  <span className="news-badge">विशेष समाचार · {featuredArticle.category}</span>
                  <h3>{featuredArticle.title}</h3>
                  <p>{featuredArticle.summary}</p>
                  <span className="featured-meta">{formatNewsDate(featuredArticle.date)} · पूरा समाचार पढ्नुहोस्</span>
                </div>
              </a>
            ) : (
            <article className="featured-card">
              <div className="featured-visual" aria-hidden="true">
                <svg viewBox="0 0 56 56">
                  <path d="M12 9h32v38H12zM19 19h18M19 27h18M19 35h12" />
                  <path d="m35 38 4 4 8-9" />
                </svg>
                <span>विशेष समाचार</span>
              </div>
              <div className="featured-copy">
                <span className="news-badge">विशेष समाचार</span>
                <h3>विशेष समाचार प्रकाशित भएपछि यहाँ पढ्नुहोस्</h3>
                <p>
                  सम्पादकीय टोलीले प्रमाणित गरेको स्थानीय समाचार वा विशेष लेख
                  यस स्थानमा प्रस्तुत गरिनेछ।
                </p>
                <span className="featured-meta">हाल कुनै विशेष लेख प्रकाशित छैन</span>
              </div>
            </article>
            )}
          </div>
        </section>

        <section className="activity-section section-space" id="activities" aria-labelledby="activity-title">
          <div className="site-container">
            <SectionHeading
              id="activity-title"
              eyebrow="हाम्रो पहल"
              title="युवा गतिविधि तथा समुदाय सेवा"
              description="क्लबका गतिविधि र सेवामूलक पहलका प्रमाणित अपडेट प्रकाशित भएपछि यहाँ देखिनेछन्।"
            />
            <div className="activity-grid">
              <article className="activity-card">
                <span className="activity-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32"><circle cx="16" cy="10" r="5" /><path d="M6 27c.7-5.3 4-8 10-8s9.3 2.7 10 8M6 12l-3 3 3 3m20-6 3 3-3 3" /></svg>
                </span>
                <span className="activity-label">युवा सहभागिता</span>
                <h3>युवाका आवाज र विचार</h3>
                <p>युवा सहभागितासँग सम्बन्धित कार्यक्रमका समाचार यहाँ राखिनेछ।</p>
              </article>
              <article className="activity-card">
                <span className="activity-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32"><path d="M16 27S4 20 4 11a6 6 0 0 1 12-1 6 6 0 0 1 12 1c0 9-12 16-12 16Z" /><path d="M10 17h4l2-4 3 7 2-3h3" /></svg>
                </span>
                <span className="activity-label">समुदाय सेवा</span>
                <h3>समुदायका लागि पहल</h3>
                <p>समुदाय सेवाका गतिविधि र तिनको प्रभावबारे जानकारी।</p>
              </article>
              <article className="activity-card">
                <span className="activity-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32"><path d="M16 27c-7-4-9-10-7-17 7 0 12 2 14 8 2 6-1 9-7 9Z" /><path d="M10 11c4 4 7 8 8 14m-5-8 7-1m-3 5 5-1" /></svg>
                </span>
                <span className="activity-label">स्थानीय पहिचान</span>
                <h3>राजपुरका कथा र संस्कृति</h3>
                <p>स्थानीय पहिचान र समुदायका कथालाई अभिलेख गर्ने सामग्री।</p>
              </article>
            </div>
            <p className="content-note">माथिका विषयहरू सामग्रीका क्षेत्र हुन्; कुनै कार्यक्रम भएको दाबी होइन।</p>
          </div>
        </section>

        <section className="gallery-section section-space" id="gallery" aria-labelledby="gallery-title">
          <div className="site-container">
            <div className="section-heading">
              <div>
                <span className="section-kicker">तस्बिर संग्रह</span>
                <h2 id="gallery-title">तस्बिर ग्यालरी</h2>
                <p>राजपुर र समुदायका तस्बिरहरू हेर्नुहोस्।</p>
              </div>
              <span className="gallery-label">प्रतिनिधि तस्बिरहरू</span>
            </div>
            <div className="gallery-grid">
              {displayGalleryPhotos.slice(0, 3).map((photo, index) => (
                <figure className="gallery-card" key={`${photo.src}-${index}`}>
                  <img src={photo.src} alt={photo.alt} loading="lazy" />
                  <figcaption>
                    <span>{photo.label}</span>
                    <small>{publishedGalleryPhotos.length ? 'समाचार तस्बिर' : 'क्लबको तस्बिर'}</small>
                  </figcaption>
                </figure>
              ))}
            </div>
            <a className="button button-outline gallery-view-all" href="/gallery" onClick={(event) => handleArticleLink(event, '/gallery')}>
              सबै तस्बिर हेर्नुहोस् <ArrowIcon />
            </a>
          </div>
        </section>

        <section className="video-section section-space" id="videos" aria-labelledby="video-title">
          <div className="site-container">
            <SectionHeading
              id="video-title"
              eyebrow="राजपुरका दृश्य"
              title="हाम्रो समुदाय, हाम्रै आँखाबाट"
              description="अहिले तस्बिरहरू मात्र उपलब्ध छन्। भिडियो सामग्री प्रकाशित भएपछि यहीँ थपिनेछ।"
            />
            <div className="video-grid">
              {videoPreviews.map((video, index) => (
                <article className="video-card" key={video.alt}>
                  <div className="video-poster">
                    <img src={video.src} alt={video.alt} loading="lazy" />
                    <span className="video-play" aria-hidden="true">
                      <svg viewBox="0 0 24 24"><path d="m9 6 10 6-10 6V6Z" /></svg>
                    </span>
                    <span className="video-placeholder-label">भिडियो उपलब्ध छैन</span>
                  </div>
                  <div className="video-caption">
                    <span>समुदायको झलक {index + 1}</span>
                    <p>राजपुर र यहाँको जीवनका तस्बिरहरू</p>
                    <a
                      className="video-gallery-link"
                      href="/gallery"
                      onClick={(event) => handleArticleLink(event, '/gallery')}
                    >
                      तस्बिर संग्रहमा हेर्नुहोस् <ArrowIcon />
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <p className="content-note">यी तस्बिरहरू भिडियोको आवरणका रूपमा छन्; भिडियो सामग्री उपलब्ध छैन।</p>
          </div>
        </section>

        <About profile={profile} profileLoadError={profileLoadError} boardImage={rajpurBoard} />

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="site-container contact-inner">
            <div>
              <span className="section-kicker">तपाईंको आवाज पनि</span>
              <h2 id="contact-title">राजपुरको खबर छ?</h2>
              <p>सम्पर्क र सामाजिक सञ्जालका आधिकारिक विवरण उपलब्ध भएपछि यहाँ थपिनेछन्।</p>
            </div>
            <div className="contact-details">
              <span className="contact-detail">
                <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M10 18s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" /><circle cx="10" cy="8" r="2" /></svg>
                राजपुर, नेपाल
              </span>
              <a className="contact-detail contact-map-link" href="https://maps.app.goo.gl/N4PYtdzysmup5tjY8" target="_blank" rel="noopener noreferrer">
                <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M10 18s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" /><circle cx="10" cy="8" r="2" /><path d="m14.5 14.5 3 3" /></svg>
                नक्सामा स्थान हेर्नुहोस्
              </a>
              <span className="contact-detail">
                <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M3 5h14v10H3zM3 6l7 5 7-5" /></svg>
                आधिकारिक सम्पर्क विवरण आउँदैछ
              </span>
            </div>
          </div>
        </section>
      </main>}

      <Footer currentYear={currentYear} isArticlePage={articlePath !== '/'} onNavigate={navigateTo} />
      </>}
    </>
  )
}

export default App
