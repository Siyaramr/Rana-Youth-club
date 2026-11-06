export type NewsArticle = {
  id: string
  slug: string
  title: string
  category: string
  date: string
  summary: string
  content: string
  image: string
  imageAlt: string
  galleryImages: string[]
  author: string
  status: 'draft' | 'published'
  featured: boolean
  seoTitle: string
  seoDescription: string
  createdAt: string
  updatedAt: string
}

const storageKey = 'rana-youth-club-news'
const updateEvent = 'rana-youth-club-news-updated'

function isNewsArticle(value: unknown): value is NewsArticle {
  if (typeof value !== 'object' || value === null) return false
  const article = value as Record<string, unknown>
  return typeof article.id === 'string'
    && typeof article.slug === 'string'
    && typeof article.title === 'string'
    && typeof article.category === 'string'
    && typeof article.date === 'string'
    && typeof article.summary === 'string'
    && typeof article.content === 'string'
    && typeof article.image === 'string'
    && typeof article.imageAlt === 'string'
    && Array.isArray(article.galleryImages)
    && article.galleryImages.every((image) => typeof image === 'string')
    && typeof article.author === 'string'
    && (article.status === 'draft' || article.status === 'published')
    && typeof article.featured === 'boolean'
    && typeof article.seoTitle === 'string'
    && typeof article.seoDescription === 'string'
    && typeof article.createdAt === 'string'
    && typeof article.updatedAt === 'string'
}

export function getNewsArticles(): NewsArticle[] {
  const stored = window.localStorage.getItem(storageKey)
  if (!stored) return []

  const articles: unknown = JSON.parse(stored)
  if (!Array.isArray(articles) || !articles.every(isNewsArticle)) {
    throw new Error('स्थानीय समाचार डाटा सही ढाँचामा छैन।')
  }
  return articles
}

export function saveNewsArticles(articles: NewsArticle[]): void {
  window.localStorage.setItem(storageKey, JSON.stringify(articles))
  window.dispatchEvent(new CustomEvent(updateEvent))
}

export function addNewsUpdateListener(listener: () => void): () => void {
  window.addEventListener(updateEvent, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(updateEvent, listener)
    window.removeEventListener('storage', listener)
  }
}

export function createSlug(title: string): string {
  return title
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}
