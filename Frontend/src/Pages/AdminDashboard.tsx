import { useMemo, useRef, useState, type DragEvent, type FormEvent, type ReactNode } from 'react'
import {
  createSlug,
  getNewsArticles,
  saveNewsArticles,
  type NewsArticle,
} from '../data/newsStore'
import {
  getClubProfile,
  saveClubProfile,
  type ClubProfile,
} from '../data/clubProfile'
import clubLogo from '../assets/images/logo.jpg'
import groupPhoto from '../assets/images/820147492_122187905930783854_7063860979059703753_n.jpg'
import communityPhoto from '../assets/images/745314167_122180708294783854_4917434312983988106_n.jpg'
import culturalGroupPhoto from '../assets/images/601511063_122158250174783854_8090778687126995892_n.jpg'
import rajpurBoard from '../assets/images/Rajpur board.jpg'
import culturalPhoto from '../assets/images/Rana dress.jpg'
import heritagePhoto from '../assets/images/macha.jpg'
import groupPhotoTwo from '../assets/images/hori.jpg'
import './AdminDashboard.css'

type AdminSection =
  | 'dashboard'
  | 'news'
  | 'editor'
  | 'activities'
  | 'photos'
  | 'videos'
  | 'about'
  | 'messages'
  | 'settings'

type EditorForm = Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'>
type ActivityStatus = 'upcoming' | 'completed'
type InboxStatus = 'unread' | 'read' | 'replied'

type ClubActivity = {
  id: string
  title: string
  category: string
  date: string
  location: string
  participants: number
  status: ActivityStatus
  description: string
}

type GalleryPhoto = {
  id: string
  src: string
  caption: string
  category: string
  date: string
}

type ClubVideo = {
  id: string
  title: string
  url: string
  category: string
  date: string
}

type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  date: string
  status: InboxStatus
  reply: string
}

type DashboardSettings = {
  siteName: string
  email: string
  phone: string
  address: string
  description: string
  emailAlerts: boolean
  weeklyReport: boolean
  maintenanceMode: boolean
}

type DashboardState = {
  activities: ClubActivity[]
  photos: GalleryPhoto[]
  videos: ClubVideo[]
  messages: ContactMessage[]
  settings: DashboardSettings
  error: string
}

const sections: { id: AdminSection; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'ड्यासबोर्ड', icon: '▦' },
  { id: 'news', label: 'समाचार व्यवस्थापन', icon: '▤' },
  { id: 'editor', label: 'समाचार थप्नुहोस्', icon: '+' },
  { id: 'activities', label: 'युवा गतिविधि', icon: '♧' },
  { id: 'photos', label: 'तस्बिर ग्यालरी', icon: '▧' },
  { id: 'videos', label: 'भिडियो ग्यालरी', icon: '▷' },
  { id: 'about', label: 'हाम्रो बारेमा / टोली', icon: '♙' },
  { id: 'messages', label: 'सम्पर्क सन्देश', icon: '✉' },
  { id: 'settings', label: 'सेटिङ', icon: '⚙' },
]

const categories = ['समुदाय', 'युवा', 'शिक्षा', 'स्वास्थ्य', 'खेलकुद', 'सूचना']
const maxImageSize = 5 * 1024 * 1024
const activityCategories = ['समुदाय सेवा', 'स्वास्थ्य', 'शिक्षा', 'खेलकुद', 'संस्कृति']
const galleryCategories = ['समुदाय', 'कार्यक्रम', 'संस्कृति', 'खेलकुद']
const dashboardStorageKeys = {
  activities: 'rana-youth-club-admin-activities',
  photos: 'rana-youth-club-admin-photos',
  videos: 'rana-youth-club-admin-videos',
  messages: 'rana-youth-club-admin-messages',
  settings: 'rana-youth-club-admin-settings',
}

const sampleActivities: ClubActivity[] = [
  {
    id: 'activity-clean-up',
    title: 'राजपुर सरसफाइ तथा वृक्षारोपण',
    category: 'समुदाय सेवा',
    date: '2026-11-18',
    location: 'राजपुर बजार',
    participants: 32,
    status: 'upcoming',
    description: 'स्थानीय बाटो सफा गर्दै सार्वजनिक स्थानमा बिरुवा रोप्ने सामुदायिक अभियान।',
  },
  {
    id: 'activity-health',
    title: 'युवा स्वास्थ्य सचेतना कार्यक्रम',
    category: 'स्वास्थ्य',
    date: '2026-10-24',
    location: 'क्लब सामुदायिक हल',
    participants: 48,
    status: 'completed',
    description: 'स्वास्थ्यकर्मीसँगको अन्तरक्रिया र प्राथमिक स्वास्थ्यसम्बन्धी जानकारी सत्र।',
  },
  {
    id: 'activity-tournament',
    title: 'मैत्रीपूर्ण फुटबल प्रतियोगिता',
    category: 'खेलकुद',
    date: '2026-10-05',
    location: 'राजपुर खेलमैदान',
    participants: 64,
    status: 'completed',
    description: 'युवा टोलीहरूबीच सहकार्य र स्वस्थ प्रतिस्पर्धालाई प्रोत्साहन गर्ने खेल।',
  },
  {
    id: 'activity-reading',
    title: 'बालबालिकाका लागि पठन सर्कल',
    category: 'शिक्षा',
    date: '2026-11-26',
    location: 'राजपुर सामुदायिक पुस्तकालय',
    participants: 20,
    status: 'upcoming',
    description: 'बालबालिकामा पठन संस्कृति र सिर्जनात्मक छलफलको बानी विकास गर्ने साप्ताहिक भेट।',
  },
]

const samplePhotos: GalleryPhoto[] = [
  { id: 'photo-rajpur', src: rajpurBoard, caption: 'राजपुरमा स्वागत छ', category: 'समुदाय', date: '2026-10-24' },
  { id: 'photo-community', src: groupPhoto, caption: 'समुदायसँगको भेटघाट', category: 'कार्यक्रम', date: '2026-10-24' },
  { id: 'photo-culture', src: culturalPhoto, caption: 'हाम्रो सांस्कृतिक पहिचान', category: 'संस्कृति', date: '2026-09-15' },
  { id: 'photo-team', src: groupPhotoTwo, caption: 'युवा टोलीको सामूहिक तस्बिर', category: 'समुदाय', date: '2026-08-30' },
  { id: 'photo-heritage', src: heritagePhoto, caption: 'स्थानीय जीवनशैली र सम्पदा', category: 'संस्कृति', date: '2026-08-12' },
  { id: 'photo-women', src: culturalGroupPhoto, caption: 'समुदायका महिला सदस्यहरू', category: 'कार्यक्रम', date: '2026-07-26' },
  { id: 'photo-gathering', src: communityPhoto, caption: 'सांस्कृतिक कार्यक्रममा सहभागी सदस्यहरू', category: 'संस्कृति', date: '2026-07-12' },
]

const sampleVideos: ClubVideo[] = [
  { id: 'video-community', title: 'राजपुर युवा क्लब — परिचय', url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U', category: 'परिचय', date: '2026-10-20' },
  { id: 'video-culture', title: 'हाम्रो संस्कृति र परम्परा', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', category: 'संस्कृति', date: '2026-09-15' },
  { id: 'video-event', title: 'समुदाय सेवा दिवसका झलकहरू', url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4', category: 'कार्यक्रम', date: '2026-08-30' },
]

const sampleMessages: ContactMessage[] = [
  { id: 'message-library', name: 'सुमन चौधरी', email: 'suman@example.com', subject: 'पठन सर्कलमा सहभागी हुनेबारे', message: 'नमस्कार, आगामी पठन सर्कलमा बालबालिकालाई सहभागी गराउन के प्रक्रिया छ? कृपया समय र आवश्यक विवरण जानकारी गराइदिनुहोला।', date: '2026-11-05T09:30:00', status: 'unread', reply: '' },
  { id: 'message-volunteer', name: 'राधा थारू', email: 'radha@example.com', subject: 'स्वयंसेवक बन्न चाहन्छु', message: 'क्लबको समुदाय सेवा कार्यक्रममा स्वयंसेवकको रूपमा सहयोग गर्न इच्छुक छु। आगामी कार्यक्रमको जानकारी पाउन सकिन्छ?', date: '2026-11-04T14:15:00', status: 'unread', reply: '' },
  { id: 'message-venue', name: 'दीपक बुढाथोकी', email: 'deepak@example.com', subject: 'कार्यक्रमका लागि हल उपलब्धता', message: 'युवा समूहको छलफलका लागि सामुदायिक हल उपलब्ध हुने समयबारे जानकारी चाहियो।', date: '2026-11-02T11:00:00', status: 'read', reply: '' },
  { id: 'message-partner', name: 'मिना पुन', email: 'mina@example.com', subject: 'सहकार्य प्रस्ताव', message: 'हाम्रो स्थानीय समूहसँग मिलेर स्वास्थ्य सचेतना कार्यक्रम गर्न सकिन्छ कि भनेर छलफल गर्न चाहन्छौँ।', date: '2026-10-30T16:45:00', status: 'replied', reply: 'नमस्कार, सहकार्य प्रस्तावका लागि धन्यवाद। आगामी बैठकमा यसबारे छलफल गरेर तपाईंलाई जानकारी गराउनेछौँ।' },
]

const defaultSettings: DashboardSettings = {
  siteName: 'राना युथ क्लब',
  email: 'info@ranayouthclub.org',
  phone: '+977 9800000000',
  address: 'राजपुर, नेपाल',
  description: 'युवाको सहभागिता, सहकार्य र समुदाय सेवाका लागि साझा मञ्च।',
  emailAlerts: true,
  weeklyReport: false,
  maintenanceMode: false,
}

const sampleNews: NewsArticle[] = [
  {
    id: 'sample-news-health',
    slug: 'youth-health-awareness',
    title: 'राजपुरमा युवा स्वास्थ्य सचेतना कार्यक्रम सम्पन्न',
    category: 'स्वास्थ्य',
    date: '2026-10-24',
    summary: 'स्थानीय युवाको सहभागितामा स्वास्थ्य सचेतना र प्राथमिक उपचारसम्बन्धी अन्तरक्रिया सम्पन्न भएको छ।',
    content: 'राना युथ क्लबको आयोजनामा राजपुर सामुदायिक हलमा युवा स्वास्थ्य सचेतना कार्यक्रम सम्पन्न भयो। कार्यक्रममा स्थानीय स्वास्थ्यकर्मीहरूले प्राथमिक स्वास्थ्य, स्वस्थ जीवनशैली र आवश्यक पर्दा सहयोग कसरी लिने भन्ने विषयमा जानकारी दिनुभयो। सहभागी युवाले प्रश्नोत्तर र समूह छलफलमा सक्रिय सहभागिता जनाएका थिए।',
    image: groupPhoto,
    imageAlt: 'राजपुरका युवा सदस्यहरू',
    galleryImages: [],
    author: 'क्लब सचिवालय',
    status: 'published',
    featured: true,
    seoTitle: 'राजपुरमा युवा स्वास्थ्य सचेतना कार्यक्रम',
    seoDescription: 'राजपुरमा राना युथ क्लबले आयोजना गरेको युवा स्वास्थ्य सचेतना कार्यक्रमको समाचार।',
    createdAt: '2026-10-24T10:00:00.000Z',
    updatedAt: '2026-10-24T10:00:00.000Z',
  },
  {
    id: 'sample-news-culture',
    slug: 'community-culture-day',
    title: 'समुदायको सांस्कृतिक पहिचान झल्कियो विशेष भेटघाटमा',
    category: 'समुदाय',
    date: '2026-09-15',
    summary: 'स्थानीय परम्परा, अनुभव र पुस्तान्तरणबारे युवाहरूले समुदायका अग्रजसँग छलफल गरे।',
    content: 'समुदायको सांस्कृतिक पहिचान र स्थानीय परम्पराको संरक्षणबारे राना युथ क्लबले विशेष भेटघाट आयोजना गर्‍यो। युवाहरूले समुदायका अग्रजसँग अनुभव सुने र स्थानीय जीवनशैली तथा सांस्कृतिक अभ्यासलाई नयाँ पुस्तासम्म पुर्‍याउने उपायबारे छलफल गरे।',
    image: culturalPhoto,
    imageAlt: 'परम्परागत पोशाकमा समुदायका सदस्य',
    galleryImages: [],
    author: 'क्लब सचिवालय',
    status: 'published',
    featured: false,
    seoTitle: 'समुदायको सांस्कृतिक पहिचान',
    seoDescription: 'राजपुरमा संस्कृति र स्थानीय परम्पराबारे युवाको भेटघाट।',
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
  {
    id: 'sample-news-cleanup',
    slug: 'rajpur-clean-up-upcoming',
    title: 'राजपुर सरसफाइ अभियानमा सहभागी हुन आह्वान',
    category: 'सूचना',
    date: '2026-11-06',
    summary: 'नोभेम्बर १८ मा हुने सरसफाइ तथा वृक्षारोपण अभियानमा स्थानीय युवालाई सहभागी हुन अनुरोध।',
    content: 'राना युथ क्लबले नोभेम्बर १८ मा राजपुर बजार क्षेत्रमा सरसफाइ तथा वृक्षारोपण अभियान आयोजना गर्दैछ। वातावरण संरक्षण र सार्वजनिक स्थानको हेरचाहमा योगदान गर्न इच्छुक युवाहरूलाई बिहान ८ बजे राजपुर बजारमा उपस्थित हुन अनुरोध गरिएको छ। आवश्यक सामग्री क्लबले उपलब्ध गराउनेछ।',
    image: rajpurBoard,
    imageAlt: 'राजपुर स्वागत बोर्ड',
    galleryImages: [],
    author: 'क्लब सचिवालय',
    status: 'draft',
    featured: false,
    seoTitle: 'राजपुर सरसफाइ अभियानमा सहभागी हुनुहोस्',
    seoDescription: 'राजपुर बजारमा नोभेम्बर १८ मा हुने सरसफाइ तथा वृक्षारोपण अभियानको सूचना।',
    createdAt: '2026-11-06T08:00:00.000Z',
    updatedAt: '2026-11-06T08:00:00.000Z',
  },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isClubActivity(value: unknown): value is ClubActivity {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.title === 'string'
    && typeof value.category === 'string'
    && typeof value.date === 'string'
    && typeof value.location === 'string'
    && typeof value.participants === 'number'
    && (value.status === 'upcoming' || value.status === 'completed')
    && typeof value.description === 'string'
}

function isGalleryPhoto(value: unknown): value is GalleryPhoto {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.src === 'string'
    && typeof value.caption === 'string'
    && typeof value.category === 'string'
    && typeof value.date === 'string'
}

function isClubVideo(value: unknown): value is ClubVideo {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.title === 'string'
    && typeof value.url === 'string'
    && typeof value.category === 'string'
    && typeof value.date === 'string'
}

function isContactMessage(value: unknown): value is ContactMessage {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.email === 'string'
    && typeof value.subject === 'string'
    && typeof value.message === 'string'
    && typeof value.date === 'string'
    && (value.status === 'unread' || value.status === 'read' || value.status === 'replied')
    && typeof value.reply === 'string'
}

function isDashboardSettings(value: unknown): value is DashboardSettings {
  return isRecord(value)
    && typeof value.siteName === 'string'
    && typeof value.email === 'string'
    && typeof value.phone === 'string'
    && typeof value.address === 'string'
    && typeof value.description === 'string'
    && typeof value.emailAlerts === 'boolean'
    && typeof value.weeklyReport === 'boolean'
    && typeof value.maintenanceMode === 'boolean'
}

function getLocalCollection<T>(key: string, fallback: T[], isItem: (value: unknown) => value is T): T[] {
  const stored = window.localStorage.getItem(key)
  if (!stored) return fallback
  const value: unknown = JSON.parse(stored)
  if (!Array.isArray(value) || !value.every(isItem)) throw new Error('स्थानीय सूची सही ढाँचामा छैन।')
  return value
}

function loadDashboardState(): DashboardState {
  const errors: string[] = []
  function loadList<T>(key: string, fallback: T[], isItem: (value: unknown) => value is T): T[] {
    try {
      return getLocalCollection(key, fallback, isItem)
    } catch {
      errors.push('स्थानीय नमुना डाटा पढ्न सकिएन। सम्बन्धित सूची रिसेट गर्नुपर्छ।')
      return fallback
    }
  }
  let settings = defaultSettings
  try {
    const stored = window.localStorage.getItem(dashboardStorageKeys.settings)
    if (stored) {
      const value: unknown = JSON.parse(stored)
      if (!isDashboardSettings(value)) throw new Error('Invalid settings')
      settings = value
    }
  } catch {
    errors.push('स्थानीय सेटिङ पढ्न सकिएन।')
  }
  return {
    activities: loadList(dashboardStorageKeys.activities, sampleActivities, isClubActivity),
    photos: loadList(dashboardStorageKeys.photos, samplePhotos, isGalleryPhoto),
    videos: loadList(dashboardStorageKeys.videos, sampleVideos, isClubVideo),
    messages: loadList(dashboardStorageKeys.messages, sampleMessages, isContactMessage),
    settings,
    error: errors.join(' '),
  }
}

const blankForm: EditorForm = {
  slug: '',
  title: '',
  category: categories[0],
  date: new Date().toISOString().slice(0, 10),
  summary: '',
  content: '',
  image: '',
  imageAlt: '',
  galleryImages: [],
  author: '',
  status: 'draft',
  featured: false,
  seoTitle: '',
  seoDescription: '',
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('ne-NP')
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('ne-NP', { dateStyle: 'medium', timeStyle: 'short' })
}

function AdminSectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="workspace-heading">
      <div>
        <span className="admin-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  return <span className={`admin-status ${status}`}>{label}</span>
}

function makeId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('तस्बिर पढ्न सकिएन।'))
    }
    reader.onerror = () => reject(new Error('तस्बिर पढ्न सकिएन।'))
    reader.readAsDataURL(file)
  })
}

function AdminDashboard({
  onExit,
  onPublicUpdate,
}: {
  onExit: () => void
  onPublicUpdate: () => void
}) {
  const [section, setSection] = useState<AdminSection>('dashboard')
  const [initialNews] = useState(() => {
    try {
      const savedArticles = getNewsArticles()
      return { articles: savedArticles.length ? savedArticles : sampleNews, error: '' }
    } catch {
      return {
        articles: sampleNews,
        error: 'स्थानीय समाचार डाटा पढ्न सकिएन। ब्राउजरको साइट डाटा बिग्रिएको हुन सक्छ।',
      }
    }
  })
  const [initialDashboard] = useState(loadDashboardState)
  const [dashboardDate] = useState(() => new Date())
  const [articles, setArticles] = useState<NewsArticle[]>(initialNews.articles)
  const [activities, setActivities] = useState(initialDashboard.activities)
  const [photos, setPhotos] = useState(initialDashboard.photos)
  const [videos, setVideos] = useState(initialDashboard.videos)
  const [messages, setMessages] = useState(initialDashboard.messages)
  const [settings, setSettings] = useState(initialDashboard.settings)
  const [profile, setProfile] = useState<ClubProfile>(() => {
    try {
      return getClubProfile()
    } catch {
      return {
        introduction: '',
        mission: '',
        vision: '',
        goals: [],
        communityImpact: [],
        committeeMembers: [],
      }
    }
  })
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState<EditorForm>(blankForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [storageError, setStorageError] = useState([initialNews.error, initialDashboard.error].filter(Boolean).join(' '))
  const [activityFormOpen, setActivityFormOpen] = useState(false)
  const [activityForm, setActivityForm] = useState({
    title: '',
    category: activityCategories[0],
    date: dashboardDate.toISOString().slice(0, 10),
    location: '',
    participants: 0,
    description: '',
  })
  const [photoFilter, setPhotoFilter] = useState('सबै')
  const [photoCaption, setPhotoCaption] = useState('')
  const [photoCategory, setPhotoCategory] = useState('कार्यक्रम')
  const [videoTitle, setVideoTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoCategory, setVideoCategory] = useState('कार्यक्रम')
  const [selectedMessageId, setSelectedMessageId] = useState('')
  const [replyDraft, setReplyDraft] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const counts = useMemo(() => ({
    totalNews: articles.length,
    published: articles.filter((article) => article.status === 'published').length,
    drafts: articles.filter((article) => article.status === 'draft').length,
    activities: activities.length,
    galleryImages: photos.length + articles.reduce((total, article) => total + article.galleryImages.length + (article.image ? 1 : 0), 0),
    unreadMessages: messages.filter((message) => message.status === 'unread').length,
  }), [articles, activities.length, photos.length, messages])

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message })
    window.setTimeout(() => setToast(null), 4200)
  }

  function persistCollection<T>(key: string, value: T[], message: string): boolean {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      setStorageError('')
      return true
    } catch {
      showToast('error', message)
      return false
    }
  }

  function saveActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activityForm.title.trim() || !activityForm.location.trim() || !activityForm.description.trim()) {
      showToast('error', 'गतिविधिको शीर्षक, स्थान र विवरण पूरा गर्नुहोस्।')
      return
    }
    const activity: ClubActivity = {
      ...activityForm,
      id: makeId(),
      title: activityForm.title.trim(),
      location: activityForm.location.trim(),
      description: activityForm.description.trim(),
      participants: Math.max(0, activityForm.participants),
      status: activityForm.date < new Date().toISOString().slice(0, 10) ? 'completed' : 'upcoming',
    }
    const updated = [activity, ...activities]
    if (!persistCollection(dashboardStorageKeys.activities, updated, 'गतिविधि सुरक्षित गर्न सकिएन।')) return
    setActivities(updated)
    setActivityFormOpen(false)
    setActivityForm({ title: '', category: activityCategories[0], date: new Date().toISOString().slice(0, 10), location: '', participants: 0, description: '' })
    showToast('success', 'नयाँ गतिविधि थपियो।')
  }

  function toggleActivityStatus(activity: ClubActivity) {
    const updated = activities.map((item) => item.id === activity.id
      ? { ...item, status: item.status === 'completed' ? 'upcoming' : 'completed' } as ClubActivity
      : item)
    if (!persistCollection(dashboardStorageKeys.activities, updated, 'गतिविधिको स्थिति बदल्न सकिएन।')) return
    setActivities(updated)
    showToast('success', 'गतिविधिको स्थिति अपडेट भयो।')
  }

  function deleteActivity(activity: ClubActivity) {
    if (!window.confirm(`“${activity.title}” गतिविधि मेटाउने?`)) return
    const updated = activities.filter((item) => item.id !== activity.id)
    if (!persistCollection(dashboardStorageKeys.activities, updated, 'गतिविधि मेटाउन सकिएन।')) return
    setActivities(updated)
    showToast('success', 'गतिविधि मेटाइयो।')
  }

  async function addPhotoFiles(files: FileList | File[]) {
    const list = Array.from(files)
    if (!list.length) return
    const allowed = list.filter((file) => file.type.startsWith('image/'))
    if (allowed.length !== list.length) showToast('error', 'तस्बिर फाइल मात्र अपलोड गर्न सकिन्छ।')
    if (photos.length + allowed.length > 30) {
      showToast('error', 'ग्यालरीमा बढीमा ३० तस्बिर राख्न सकिन्छ।')
      return
    }
    if (allowed.some((file) => file.size > maxImageSize)) {
      showToast('error', 'प्रत्येक तस्बिरको आकार ५ MB भन्दा कम हुनुपर्छ।')
      return
    }
    if (!allowed.length) return
    setBusy(true)
    try {
      const dataUrls = await Promise.all(allowed.map(readFileAsDataUrl))
      const created = dataUrls.map((src, index): GalleryPhoto => ({
        id: makeId(),
        src,
        caption: `${photoCaption.trim() || allowed[index].name.replace(/\.[^.]+$/, '')}${dataUrls.length > 1 ? ` ${index + 1}` : ''}`,
        category: photoCategory,
        date: new Date().toISOString().slice(0, 10),
      }))
      const updated = [...created, ...photos]
      if (!persistCollection(dashboardStorageKeys.photos, updated, 'तस्बिरहरू सुरक्षित गर्न सकिएन।')) return
      setPhotos(updated)
      setPhotoCaption('')
      setToast(null)
      showToast('success', `${created.length} तस्बिर ग्यालरीमा थपियो।`)
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'तस्बिर लोड गर्न सकिएन।')
    } finally {
      setBusy(false)
    }
  }

  function deletePhoto(photo: GalleryPhoto) {
    if (!window.confirm(`“${photo.caption}” तस्बिर ग्यालरीबाट हटाउने?`)) return
    const updated = photos.filter((item) => item.id !== photo.id)
    if (!persistCollection(dashboardStorageKeys.photos, updated, 'तस्बिर हटाउन सकिएन।')) return
    setPhotos(updated)
    showToast('success', 'तस्बिर ग्यालरीबाट हटाइयो।')
  }

  function addVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    let url: URL
    try {
      url = new URL(videoUrl)
    } catch {
      showToast('error', 'मान्य भिडियो URL राख्नुहोस्।')
      return
    }
    if (url.protocol !== 'https:' || !['youtube.com', 'www.youtube.com', 'youtu.be', 'vimeo.com', 'www.vimeo.com'].includes(url.hostname)) {
      showToast('error', 'YouTube वा Vimeo को HTTPS भिडियो URL प्रयोग गर्नुहोस्।')
      return
    }
    const video: ClubVideo = {
      id: makeId(),
      title: videoTitle.trim(),
      url: url.href,
      category: videoCategory,
      date: new Date().toISOString().slice(0, 10),
    }
    const updated = [video, ...videos]
    if (!persistCollection(dashboardStorageKeys.videos, updated, 'भिडियो लिङ्क सुरक्षित गर्न सकिएन।')) return
    setVideos(updated)
    setVideoTitle('')
    setVideoUrl('')
    showToast('success', 'भिडियो ग्यालरीमा थपियो।')
  }

  function deleteVideo(video: ClubVideo) {
    if (!window.confirm(`“${video.title}” भिडियो मेटाउने?`)) return
    const updated = videos.filter((item) => item.id !== video.id)
    if (!persistCollection(dashboardStorageKeys.videos, updated, 'भिडियो मेटाउन सकिएन।')) return
    setVideos(updated)
    showToast('success', 'भिडियो ग्यालरीबाट हटाइयो।')
  }

  function updateMessage(message: ContactMessage, status: InboxStatus) {
    const updated = messages.map((item) => item.id === message.id ? { ...item, status } : item)
    if (!persistCollection(dashboardStorageKeys.messages, updated, 'सन्देश अपडेट गर्न सकिएन।')) return
    setMessages(updated)
  }

  function selectMessage(message: ContactMessage) {
    setSelectedMessageId(message.id)
    setReplyDraft(message.reply)
    if (message.status === 'unread') updateMessage(message, 'read')
  }

  function sendMessageReply() {
    if (!replyDraft.trim()) {
      showToast('error', 'जवाफ लेखेर मात्र पठाउन सकिन्छ।')
      return
    }
    const updated = messages.map((message) => message.id === selectedMessageId
      ? { ...message, reply: replyDraft.trim(), status: 'replied' as const }
      : message)
    if (!persistCollection(dashboardStorageKeys.messages, updated, 'जवाफ सुरक्षित गर्न सकिएन।')) return
    setMessages(updated)
    showToast('success', 'जवाफ स्थानीय इनबक्समा सुरक्षित भयो।')
  }

  function deleteMessage(message: ContactMessage) {
    if (!window.confirm(`“${message.subject}” सन्देश मेटाउने?`)) return
    const updated = messages.filter((item) => item.id !== message.id)
    if (!persistCollection(dashboardStorageKeys.messages, updated, 'सन्देश मेटाउन सकिएन।')) return
    setMessages(updated)
    if (selectedMessageId === message.id) {
      setSelectedMessageId('')
      setReplyDraft('')
    }
    showToast('success', 'सन्देश मेटाइयो।')
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      window.localStorage.setItem(dashboardStorageKeys.settings, JSON.stringify(settings))
      setStorageError('')
      showToast('success', 'सेटिङ सुरक्षित भयो।')
    } catch {
      showToast('error', 'सेटिङ सुरक्षित गर्न सकिएन। ब्राउजरको भण्डारण क्षमता जाँच गर्नुहोस्।')
    }
  }

  function resetSettings() {
    if (!window.confirm('सबै सेटिङ पूर्वनिर्धारित मानमा फर्काउने?')) return
    try {
      window.localStorage.setItem(dashboardStorageKeys.settings, JSON.stringify(defaultSettings))
      setSettings(defaultSettings)
      setStorageError('')
      showToast('success', 'सेटिङ पूर्वनिर्धारित मानमा फर्काइयो।')
    } catch {
      showToast('error', 'सेटिङ रिसेट गर्न सकिएन।')
    }
  }

  function startNewArticle() {
    setEditingId('')
    setForm({ ...blankForm })
    setSlugTouched(false)
    setSection('editor')
    setMenuOpen(false)
  }

  function editArticle(article: NewsArticle) {
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...editable } = article
    setEditingId(article.id)
    setForm(editable)
    setSlugTouched(true)
    setSection('editor')
    setMenuOpen(false)
  }

  async function addFiles(files: FileList | File[], gallery = false) {
    const list = Array.from(files)
    if (list.length === 0) return
    const allowed = list.filter((file) => file.type.startsWith('image/'))
    if (allowed.length !== list.length) {
      showToast('error', 'कृपया JPG, PNG, WebP जस्ता तस्बिर फाइल मात्र छान्नुहोस्।')
    }
    if (gallery && form.galleryImages.length + allowed.length > 8) {
      showToast('error', 'मुख्य तस्बिरबाहेक बढीमा ८ ग्यालरी तस्बिर राख्न सकिन्छ।')
      return
    }
    const oversized = allowed.find((file) => file.size > maxImageSize)
    if (oversized) {
      showToast('error', 'प्रत्येक तस्बिरको आकार ५ MB भन्दा कम हुनुपर्छ।')
      return
    }
    if (allowed.length === 0) return

    setBusy(true)
    try {
      const dataUrls = await Promise.all(allowed.map(readFileAsDataUrl))
      if (gallery) {
        setForm((current) => ({ ...current, galleryImages: [...current.galleryImages, ...dataUrls] }))
      } else {
        setForm((current) => ({ ...current, image: dataUrls[0] }))
      }
      setToast(null)
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'तस्बिर लोड गर्न सकिएन।')
    } finally {
      setBusy(false)
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    void addFiles(event.dataTransfer.files)
  }

  function saveArticle(status: NewsArticle['status']) {
    if (!form.title.trim() || !form.slug.trim() || !form.summary.trim() || !form.content.trim()) {
      showToast('error', 'शीर्षक, स्लग, छोटो परिचय र पूरा सामग्री भर्नुहोस्।')
      return
    }
    if (!form.image) {
      showToast('error', 'मुख्य तस्बिर छान्नुहोस्।')
      return
    }
    const duplicate = articles.some((article) =>
      article.slug.toLocaleLowerCase() === form.slug.trim().toLocaleLowerCase()
      && article.id !== editingId,
    )
    if (duplicate) {
      showToast('error', 'यो स्लग पहिले नै प्रयोग भएको छ। फरक स्लग छान्नुहोस्।')
      return
    }

    const now = new Date().toISOString()
    const oldArticle = articles.find((article) => article.id === editingId)
    const savedArticle: NewsArticle = {
      ...form,
      title: form.title.trim(),
      slug: form.slug.trim(),
      summary: form.summary.trim(),
      content: form.content.trim(),
      imageAlt: form.imageAlt.trim() || form.title.trim(),
      author: form.author.trim(),
      status,
      id: editingId || makeId(),
      createdAt: oldArticle?.createdAt ?? now,
      updatedAt: now,
    }
    const updatedArticles = editingId
      ? articles.map((article) => article.id === editingId ? savedArticle : article)
      : [savedArticle, ...articles]

    try {
      saveNewsArticles(updatedArticles)
      setArticles(updatedArticles)
      setStorageError('')
      setEditingId(savedArticle.id)
      setForm({
        slug: savedArticle.slug,
        title: savedArticle.title,
        category: savedArticle.category,
        date: savedArticle.date,
        summary: savedArticle.summary,
        content: savedArticle.content,
        image: savedArticle.image,
        imageAlt: savedArticle.imageAlt,
        galleryImages: savedArticle.galleryImages,
        author: savedArticle.author,
        status: savedArticle.status,
        featured: savedArticle.featured,
        seoTitle: savedArticle.seoTitle,
        seoDescription: savedArticle.seoDescription,
      })
      onPublicUpdate()
      showToast('success', status === 'published' ? 'समाचार प्रकाशित भयो।' : 'ड्राफ्ट सुरक्षित भयो।')
    } catch {
      showToast('error', 'समाचार सुरक्षित गर्न सकिएन। ब्राउजरको भण्डारण क्षमता पुगेको हुन सक्छ।')
    }
  }

  function deleteArticle(article: NewsArticle) {
    const confirmed = window.confirm(`“${article.title}” समाचार मेटाउने? यो कार्य फिर्ता गर्न सकिँदैन।`)
    if (!confirmed) return

    const updatedArticles = articles.filter((item) => item.id !== article.id)
    try {
      saveNewsArticles(updatedArticles)
      setArticles(updatedArticles)
      setStorageError('')
      onPublicUpdate()
      showToast('success', 'समाचार मेटाइयो।')
      if (editingId === article.id) startNewArticle()
    } catch {
      showToast('error', 'समाचार मेटाउन सकिएन। फेरि प्रयास गर्नुहोस्।')
    }
  }

  function setActiveSection(next: AdminSection) {
    setSection(next)
    setMenuOpen(false)
    if (next === 'editor' && !editingId) {
      setForm({ ...blankForm })
      setSlugTouched(false)
    }
  }

  function renderNewsList() {
    return (
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="admin-eyebrow">सम्पादकीय</span>
            <h2>समाचार व्यवस्थापन</h2>
            <p>समाचार थप्नुहोस्, सम्पादन गर्नुहोस् वा प्रकाशन स्थिति बदल्नुहोस्।</p>
          </div>
          <button className="admin-primary-button" type="button" onClick={startNewArticle}>＋ समाचार थप्नुहोस्</button>
        </div>
        {articles.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>समाचार</th><th>श्रेणी</th><th>मिति</th><th>स्थिति</th><th>कार्य</th></tr></thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td className="admin-news-cell">
                      <img src={article.image} alt="" />
                      <span><strong>{article.title}</strong><small>/{article.slug}</small></span>
                    </td>
                    <td>{article.category}</td>
                    <td>{formatDate(article.date)}</td>
                    <td><span className={`admin-status ${article.status}`}>{article.status === 'published' ? 'प्रकाशित' : 'ड्राफ्ट'}</span></td>
                    <td className="admin-row-actions">
                      <button type="button" onClick={() => editArticle(article)}>सम्पादन</button>
                      <button type="button" className="danger-action" onClick={() => deleteArticle(article)}>मेटाउनुहोस्</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state">
            <span aria-hidden="true">▤</span>
            <h3>अहिलेसम्म समाचार छैन</h3>
            <p>पहिलो समाचार तयार गर्न “समाचार थप्नुहोस्” थिच्नुहोस्।</p>
            <button className="admin-primary-button" type="button" onClick={startNewArticle}>समाचार थप्नुहोस्</button>
          </div>
        )}
      </section>
    )
  }

  function renderEditor() {
    const slugExists = articles.some((article) =>
      article.slug.toLocaleLowerCase() === form.slug.trim().toLocaleLowerCase()
      && article.id !== editingId,
    )
    return (
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="admin-eyebrow">समाचार सम्पादक</span>
            <h2>{editingId ? 'समाचार सम्पादन' : 'नयाँ समाचार'}</h2>
            <p>ताराङ्कित विवरण आवश्यक छन्। नेपाली वा अंग्रेजीमा लेख्न सक्नुहुन्छ।</p>
          </div>
          <button className="admin-secondary-button" type="button" onClick={() => setActiveSection('news')}>समाचार सूची</button>
        </div>
        <form className="news-editor-form" onSubmit={(event) => event.preventDefault()}>
          <div className="editor-main-column">
            <label className="admin-field">
              <span>शीर्षक <b>*</b></span>
              <input
                required
                value={form.title}
                maxLength={180}
                onChange={(event) => {
                  const title = event.target.value
                  setForm((current) => ({
                    ...current,
                    title,
                    slug: slugTouched ? current.slug : createSlug(title),
                  }))
                }}
                placeholder="समाचारको शीर्षक"
              />
            </label>
            <label className="admin-field">
              <span>URL स्लग <b>*</b></span>
              <input
                required
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true)
                  setForm((current) => ({ ...current, slug: createSlug(event.target.value) }))
                }}
                placeholder="news-title"
              />
              <small className={slugExists ? 'field-error' : ''}>
                {slugExists ? 'यो स्लग पहिले नै प्रयोग भएको छ।' : `URL: /news/${form.slug || 'slug'}`}
              </small>
            </label>
            <label className="admin-field">
              <span>छोटो सारांश <b>*</b></span>
              <textarea required rows={3} maxLength={320} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="समाचारको छोटो परिचय" />
              <small>{form.summary.length}/320</small>
            </label>
            <label className="admin-field">
              <span>पूरा समाचार सामग्री <b>*</b></span>
              <textarea required rows={12} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="समाचारको पूरा सामग्री लेख्नुहोस्..." />
            </label>
            <div className="admin-subsection">
              <h3>SEO विवरण <span>ऐच्छिक</span></h3>
              <label className="admin-field">
                <span>SEO शीर्षक</span>
                <input maxLength={70} value={form.seoTitle} onChange={(event) => setForm({ ...form, seoTitle: event.target.value })} placeholder="खोज इन्जिनमा देखिने शीर्षक" />
              </label>
              <label className="admin-field">
                <span>SEO विवरण</span>
                <textarea rows={3} maxLength={180} value={form.seoDescription} onChange={(event) => setForm({ ...form, seoDescription: event.target.value })} placeholder="खोज इन्जिनका लागि छोटो विवरण" />
              </label>
            </div>
          </div>
          <div className="editor-side-column">
            <div className="admin-subsection">
              <h3>प्रकाशन विवरण</h3>
              <label className="admin-field">
                <span>श्रेणी <b>*</b></span>
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label className="admin-field">
                <span>लेखक</span>
                <input value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} placeholder="लेखकको नाम" />
              </label>
              <label className="admin-field">
                <span>प्रकाशन मिति <b>*</b></span>
                <input type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
              </label>
              <label className="admin-checkbox">
                <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} />
                <span>विशेष समाचार बनाउनुहोस्</span>
              </label>
            </div>

            <div className="admin-subsection">
              <h3>मुख्य तस्बिर <span>*</span></h3>
              <div
                className={`image-dropzone${dragging ? ' is-dragging' : ''}`}
                onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                {form.image ? (
                  <div className="image-preview">
                    <img src={form.image} alt="समाचारको मुख्य तस्बिर पूर्वावलोकन" />
                    <button type="button" onClick={() => setForm({ ...form, image: '' })}>तस्बिर हटाउनुहोस्</button>
                  </div>
                ) : (
                  <>
                    <span className="dropzone-icon" aria-hidden="true">⇧</span>
                    <strong>तस्बिर यहाँ तान्नुहोस्</strong>
                    <span>वा तलको बटनबाट छान्नुहोस् · अधिकतम ५ MB</span>
                    <button type="button" onClick={() => fileInputRef.current?.click()}>तस्बिर छान्नुहोस्</button>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(event) => {
                  if (event.target.files) void addFiles(event.target.files)
                  event.target.value = ''
                }} />
              </div>
              <label className="admin-field">
                <span>तस्बिरको वैकल्पिक पाठ</span>
                <input value={form.imageAlt} onChange={(event) => setForm({ ...form, imageAlt: event.target.value })} placeholder="तस्बिरमा के देखिन्छ?" />
              </label>
            </div>

            <div className="admin-subsection">
              <h3>थप ग्यालरी तस्बिर <span>ऐच्छिक</span></h3>
              <button className="admin-secondary-button gallery-upload-button" type="button" onClick={() => galleryInputRef.current?.click()}>
                ＋ धेरै तस्बिर छान्नुहोस्
              </button>
              <input ref={galleryInputRef} type="file" accept="image/*" multiple hidden onChange={(event) => {
                if (event.target.files) void addFiles(event.target.files, true)
                event.target.value = ''
              }} />
              {form.galleryImages.length > 0 && (
                <div className="gallery-preview-grid">
                  {form.galleryImages.map((image, index) => (
                    <div className="gallery-preview" key={`${index}-${image.slice(0, 30)}`}>
                      <img src={image} alt={`ग्यालरी तस्बिर ${index + 1}`} />
                      <button type="button" aria-label={`ग्यालरी तस्बिर ${index + 1} हटाउनुहोस्`} onClick={() => setForm({ ...form, galleryImages: form.galleryImages.filter((_, itemIndex) => itemIndex !== index) })}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {busy && <p className="upload-progress" role="status">तस्बिर लोड हुँदैछ...</p>}
          </div>
          <div className="editor-form-actions">
            <button className="admin-secondary-button" type="button" disabled={busy} onClick={() => saveArticle('draft')}>ड्राफ्ट सुरक्षित गर्नुहोस्</button>
            <button className="admin-primary-button" type="button" disabled={busy} onClick={() => saveArticle('published')}>प्रकाशित गर्नुहोस्</button>
          </div>
        </form>
      </section>
    )
  }

  function renderActivities() {
    return (
      <section className="workspace-section">
        <AdminSectionHeading
          eyebrow="कार्यक्रम व्यवस्थापन"
          title="युवा गतिविधि"
          description="आगामी कार्यक्रम योजना बनाउनुहोस् र सम्पन्न गतिविधिको अभिलेख राख्नुहोस्।"
          action={<button className="admin-primary-button" type="button" onClick={() => setActivityFormOpen(!activityFormOpen)}>{activityFormOpen ? 'रद्द गर्नुहोस्' : '＋ गतिविधि थप्नुहोस्'}</button>}
        />
        {activityFormOpen && (
          <form className="admin-panel activity-form" onSubmit={saveActivity}>
            <h3>नयाँ गतिविधि</h3>
            <div className="admin-form-grid">
              <label className="admin-field"><span>कार्यक्रमको नाम <b>*</b></span><input required value={activityForm.title} onChange={(event) => setActivityForm({ ...activityForm, title: event.target.value })} placeholder="जस्तै: युवा स्वास्थ्य शिविर" /></label>
              <label className="admin-field"><span>श्रेणी</span><select value={activityForm.category} onChange={(event) => setActivityForm({ ...activityForm, category: event.target.value })}>{activityCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
              <label className="admin-field"><span>मिति <b>*</b></span><input required type="date" value={activityForm.date} onChange={(event) => setActivityForm({ ...activityForm, date: event.target.value })} /></label>
              <label className="admin-field"><span>स्थान <b>*</b></span><input required value={activityForm.location} onChange={(event) => setActivityForm({ ...activityForm, location: event.target.value })} placeholder="कार्यक्रम हुने स्थान" /></label>
              <label className="admin-field"><span>अपेक्षित सहभागी</span><input type="number" min="0" value={activityForm.participants} onChange={(event) => setActivityForm({ ...activityForm, participants: Number(event.target.value) })} /></label>
              <label className="admin-field admin-field-wide"><span>कार्यक्रम विवरण <b>*</b></span><textarea required rows={3} value={activityForm.description} onChange={(event) => setActivityForm({ ...activityForm, description: event.target.value })} placeholder="कार्यक्रमको उद्देश्य र गतिविधिबारे लेख्नुहोस्" /></label>
            </div>
            <div className="form-actions"><button className="admin-primary-button" type="submit">गतिविधि सुरक्षित गर्नुहोस्</button></div>
          </form>
        )}
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div><h2>सबै गतिविधि</h2><p>{activities.length} गतिविधि · {activities.filter((item) => item.status === 'upcoming').length} आगामी</p></div>
            <span className="activity-count">{activities.reduce((total, item) => total + item.participants, 0).toLocaleString('ne-NP')} कुल सहभागी</span>
          </div>
          {activities.length ? (
            <div className="activity-list">
              {activities.slice().sort((first, second) => second.date.localeCompare(first.date)).map((activity) => (
                <article className="activity-card" key={activity.id}>
                  <div className="activity-date"><strong>{new Date(`${activity.date}T00:00:00`).toLocaleDateString('ne-NP', { day: 'numeric' })}</strong><span>{new Date(`${activity.date}T00:00:00`).toLocaleDateString('ne-NP', { month: 'short' })}</span></div>
                  <div className="activity-info">
                    <div className="activity-card-title"><h3>{activity.title}</h3><StatusBadge status={activity.status} label={activity.status === 'upcoming' ? 'आगामी' : 'सम्पन्न'} /></div>
                    <p>{activity.description}</p>
                    <div className="activity-meta"><span>⌖ {activity.location}</span><span>♧ {activity.participants} सहभागी</span><span>{activity.category}</span></div>
                  </div>
                  <div className="admin-row-actions activity-actions">
                    <button type="button" onClick={() => toggleActivityStatus(activity)}>{activity.status === 'upcoming' ? 'सम्पन्न गर्नुहोस्' : 'आगामी बनाउनुहोस्'}</button>
                    <button type="button" className="danger-action" onClick={() => deleteActivity(activity)}>मेटाउनुहोस्</button>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="admin-empty-state"><span>♧</span><h3>अहिले कुनै गतिविधि छैन</h3><p>पहिलो गतिविधि थपेर कार्यक्रम तालिका सुरु गर्नुहोस्।</p></div>}
        </section>
      </section>
    )
  }

  function renderPhotos() {
    const shownPhotos = photos.filter((photo) => photoFilter === 'सबै' || photo.category === photoFilter)
    return (
      <section className="workspace-section">
        <AdminSectionHeading
          eyebrow="मिडिया व्यवस्थापन"
          title="तस्बिर ग्यालरी"
          description="क्लबका कार्यक्रम, समुदाय र सांस्कृतिक तस्बिरहरू व्यवस्थापन गर्नुहोस्।"
          action={<button className="admin-primary-button" type="button" onClick={() => photoInputRef.current?.click()} disabled={busy}>＋ तस्बिर अपलोड</button>}
        />
        <input ref={photoInputRef} className="visually-hidden-input" type="file" accept="image/*" multiple onChange={(event) => {
          if (event.target.files) void addPhotoFiles(event.target.files)
          event.target.value = ''
        }} />
        <section className="admin-panel">
          <div className="gallery-toolbar">
            <div className="gallery-filter" aria-label="ग्यालरी श्रेणी छान्नुहोस्">
              {['सबै', ...galleryCategories].map((category) => <button key={category} type="button" className={photoFilter === category ? 'active' : ''} onClick={() => setPhotoFilter(category)}>{category}</button>)}
            </div>
            <div className="gallery-upload-details">
              <label className="gallery-caption-field"><span>अपलोड क्याप्सन</span><input value={photoCaption} onChange={(event) => setPhotoCaption(event.target.value)} placeholder="ऐच्छिक क्याप्सन" /></label>
              <label className="gallery-caption-field"><span>अपलोड श्रेणी</span><select value={photoCategory} onChange={(event) => setPhotoCategory(event.target.value)}>{galleryCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
            </div>
          </div>
          {busy && <p className="upload-progress" role="status">तस्बिर अपलोड हुँदैछ...</p>}
          {shownPhotos.length ? (
            <div className="photo-grid">
              {shownPhotos.map((photo) => (
                <article className="photo-card" key={photo.id}>
                  <div className="photo-image"><img src={photo.src} alt={photo.caption} loading="lazy" /><button type="button" aria-label={`${photo.caption} हटाउनुहोस्`} onClick={() => deletePhoto(photo)}>×</button></div>
                  <div className="photo-card-info"><strong>{photo.caption}</strong><span>{photo.category} <i>·</i> {formatDate(photo.date)}</span></div>
                </article>
              ))}
            </div>
          ) : <div className="admin-empty-state"><span>▧</span><h3>यो श्रेणीमा तस्बिर छैन</h3><p>अर्को श्रेणी छान्नुहोस् वा नयाँ तस्बिर अपलोड गर्नुहोस्।</p></div>}
          <p className="gallery-limit">{photos.length} / ३० तस्बिर · प्रति तस्बिर अधिकतम ५ MB</p>
        </section>
      </section>
    )
  }

  function renderVideos() {
    return (
      <section className="workspace-section">
        <AdminSectionHeading eyebrow="मिडिया व्यवस्थापन" title="भिडियो ग्यालरी" description="YouTube वा Vimeo मा होस्ट गरिएका क्लबका भिडियो लिङ्कहरू थप्नुहोस्।" />
        <form className="admin-panel video-form" onSubmit={addVideo}>
          <h3>भिडियो थप्नुहोस्</h3>
          <div className="admin-form-grid video-form-grid">
            <label className="admin-field"><span>भिडियो शीर्षक <b>*</b></span><input required value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} placeholder="जस्तै: युवा क्लब वार्षिक भेटघाट" /></label>
            <label className="admin-field"><span>YouTube / Vimeo URL <b>*</b></span><input required type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." /></label>
            <label className="admin-field"><span>श्रेणी</span><select value={videoCategory} onChange={(event) => setVideoCategory(event.target.value)}>{['कार्यक्रम', 'परिचय', 'समुदाय', 'संस्कृति'].map((category) => <option key={category}>{category}</option>)}</select></label>
          </div>
          <div className="form-actions"><button className="admin-primary-button" type="submit">भिडियो थप्नुहोस्</button></div>
        </form>
        <div className="video-grid">
          {videos.map((video) => (
            <article className="video-card" key={video.id}>
              <a className="video-preview" href={video.url} target="_blank" rel="noreferrer" aria-label={`${video.title} नयाँ ट्याबमा खोल्नुहोस्`}><span>▶</span><small>नयाँ ट्याबमा हेर्नुहोस्</small></a>
              <div className="video-card-info"><div><StatusBadge status="read" label={video.category} /><time dateTime={video.date}>{formatDate(video.date)}</time></div><h3>{video.title}</h3><a href={video.url} target="_blank" rel="noreferrer">भिडियो खोल्नुहोस् ↗</a><button type="button" className="admin-row-delete" onClick={() => deleteVideo(video)}>हटाउनुहोस्</button></div>
            </article>
          ))}
          {!videos.length && <div className="admin-panel admin-empty-state"><span>▷</span><h3>अहिले भिडियो छैन</h3><p>पहिलो भिडियो लिङ्क थपेर संग्रह सुरु गर्नुहोस्।</p></div>}
        </div>
        <p className="inline-note">नोट: भिडियो फाइलहरू यस ब्राउजरमा अपलोड हुँदैनन्। बाह्य प्लेटफर्मको HTTPS लिङ्क मात्र सुरक्षित हुन्छ।</p>
      </section>
    )
  }

  function renderMessages() {
    const visibleMessages = messages
      .filter((message) => !unreadOnly || message.status === 'unread')
      .slice()
      .sort((first, second) => second.date.localeCompare(first.date))
    const selectedMessage = messages.find((message) => message.id === selectedMessageId)
    return (
      <section className="workspace-section">
        <AdminSectionHeading eyebrow="समुदायसँग जोडिनुहोस्" title="सम्पर्क सन्देश" description="आगन्तुकका जिज्ञासा पढ्नुहोस् र जवाफको स्थानीय अभिलेख राख्नुहोस्." action={<span className="inbox-counter">{counts.unreadMessages} नयाँ</span>} />
        <div className="inbox-layout">
          <section className="admin-panel inbox-list-panel">
            <div className="inbox-toolbar"><strong>इनबक्स <span>{messages.length}</span></strong><button type="button" className={unreadOnly ? 'active' : ''} onClick={() => setUnreadOnly(!unreadOnly)}>{unreadOnly ? 'सबै सन्देश' : 'नपढिएका मात्र'}</button></div>
            <div className="inbox-list">
              {visibleMessages.map((message) => (
                <button type="button" key={message.id} className={`inbox-message${selectedMessageId === message.id ? ' selected' : ''}${message.status === 'unread' ? ' is-unread' : ''}`} onClick={() => selectMessage(message)}>
                  <span className="message-avatar">{message.name.slice(0, 1)}</span><span className="message-preview"><strong>{message.name}</strong><small>{message.subject}</small><span>{message.message}</span><time dateTime={message.date}>{formatDateTime(message.date)}</time></span>
                  {message.status === 'unread' && <i className="unread-dot" aria-label="नपढिएको" />}
                </button>
              ))}
              {!visibleMessages.length && <div className="inbox-empty">देखाउनका लागि सन्देश छैन।</div>}
            </div>
          </section>
          <section className="admin-panel message-detail">
            {selectedMessage ? (
              <>
                <div className="message-detail-heading"><div><span className="admin-eyebrow">सन्देश विवरण</span><h2>{selectedMessage.subject}</h2></div><StatusBadge status={selectedMessage.status} label={selectedMessage.status === 'unread' ? 'नयाँ' : selectedMessage.status === 'replied' ? 'जवाफ पठाइयो' : 'पढिएको'} /></div>
                <div className="sender-details"><span className="message-avatar">{selectedMessage.name.slice(0, 1)}</span><div><strong>{selectedMessage.name}</strong><a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a></div><time dateTime={selectedMessage.date}>{formatDateTime(selectedMessage.date)}</time></div>
                <p className="message-body">{selectedMessage.message}</p>
                {selectedMessage.reply && <div className="saved-reply"><strong>स्थानीय जवाफ अभिलेख</strong><p>{selectedMessage.reply}</p></div>}
                <label className="admin-field reply-field"><span>जवाफको मस्यौदा</span><textarea rows={5} value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} placeholder="जवाफ यहाँ लेख्नुहोस्..." /></label>
                <div className="message-actions"><button type="button" className="admin-row-delete" onClick={() => deleteMessage(selectedMessage)}>सन्देश मेटाउनुहोस्</button><button type="button" className="admin-primary-button" onClick={sendMessageReply}>जवाफ सुरक्षित गर्नुहोस्</button></div>
              </>
            ) : <div className="admin-empty-state"><span>✉</span><h3>सन्देश छान्नुहोस्</h3><p>विवरण र जवाफ लेख्न इनबक्सबाट सन्देश छान्नुहोस्।</p></div>}
          </section>
        </div>
        <p className="inline-note">सन्देशहरू नमुना डाटा हुन्। जवाफ यहाँ सुरक्षित हुन्छ, तर इमेल पठाइँदैन।</p>
      </section>
    )
  }

  function renderSettings() {
    return (
      <section className="workspace-section">
        <AdminSectionHeading eyebrow="प्रणाली प्राथमिकता" title="सेटिङ" description="साइटको सार्वजनिक सम्पर्क विवरण र स्थानीय ड्यासबोर्ड प्राथमिकता व्यवस्थापन गर्नुहोस्।" />
        <form className="admin-panel settings-form" onSubmit={saveSettings}>
          <div className="settings-section-title"><div><h3>सार्वजनिक साइट विवरण</h3><p>यी विवरणहरू साइट सेटिङमा सुरक्षित हुन्छन्; प्रकाशित पृष्ठसँग अझै backend जोडिएको छैन।</p></div></div>
          <div className="admin-form-grid settings-grid">
            <label className="admin-field"><span>क्लबको नाम</span><input required value={settings.siteName} onChange={(event) => setSettings({ ...settings, siteName: event.target.value })} /></label>
            <label className="admin-field"><span>सम्पर्क इमेल</span><input required type="email" value={settings.email} onChange={(event) => setSettings({ ...settings, email: event.target.value })} /></label>
            <label className="admin-field"><span>फोन नम्बर</span><input value={settings.phone} onChange={(event) => setSettings({ ...settings, phone: event.target.value })} /></label>
            <label className="admin-field"><span>ठेगाना</span><input value={settings.address} onChange={(event) => setSettings({ ...settings, address: event.target.value })} /></label>
            <label className="admin-field admin-field-wide"><span>छोटो परिचय</span><textarea rows={3} maxLength={240} value={settings.description} onChange={(event) => setSettings({ ...settings, description: event.target.value })} /><small>{settings.description.length}/240</small></label>
          </div>
          <div className="settings-section-title settings-preferences"><div><h3>ड्यासबोर्ड प्राथमिकता</h3><p>प्रोटोटाइपमा देखाइने सूचना र साइटको अवस्थाको विकल्प।</p></div></div>
          <div className="settings-toggles">
            <label><span><strong>इमेल सूचना</strong><small>नयाँ सम्पर्क सन्देशको सूचना प्राथमिकता</small></span><input type="checkbox" checked={settings.emailAlerts} onChange={(event) => setSettings({ ...settings, emailAlerts: event.target.checked })} /></label>
            <label><span><strong>साप्ताहिक सारांश</strong><small>साप्ताहिक गतिविधि रिपोर्ट प्राथमिकता</small></span><input type="checkbox" checked={settings.weeklyReport} onChange={(event) => setSettings({ ...settings, weeklyReport: event.target.checked })} /></label>
            <label className="maintenance-toggle"><span><strong>मर्मत अवस्था</strong><small>यो विकल्प नमुना सेटिङ मात्र हो, सार्वजनिक साइटमा लागू हुँदैन</small></span><input type="checkbox" checked={settings.maintenanceMode} onChange={(event) => setSettings({ ...settings, maintenanceMode: event.target.checked })} /></label>
          </div>
          <div className="form-actions settings-actions"><button className="admin-secondary-button" type="button" onClick={resetSettings}>पूर्वनिर्धारितमा फर्काउनुहोस्</button><button className="admin-primary-button" type="submit">परिवर्तन सुरक्षित गर्नुहोस्</button></div>
        </form>
      </section>
    )
  }

  function renderDashboard() {
    const stats = [
      { label: 'कुल समाचार', value: counts.totalNews, icon: '▤', tone: 'green', section: 'news' as AdminSection },
      { label: 'प्रकाशित', value: counts.published, icon: '✓', tone: 'blue', section: 'news' as AdminSection },
      { label: 'ड्राफ्ट', value: counts.drafts, icon: '✎', tone: 'amber', section: 'news' as AdminSection },
      { label: 'गतिविधि', value: counts.activities, icon: '♧', tone: 'violet', section: 'activities' as AdminSection },
      { label: 'ग्यालरी तस्बिर', value: photos.length, icon: '▧', tone: 'rose', section: 'photos' as AdminSection },
      { label: 'नयाँ सन्देश', value: counts.unreadMessages, icon: '✉', tone: 'blue', section: 'messages' as AdminSection },
    ]
    const recentActivities = activities.slice().sort((first, second) => second.date.localeCompare(first.date)).slice(0, 3)
    const chartBars = [
      { label: 'सोम', value: 32 },
      { label: 'मङ्गल', value: 54 },
      { label: 'बुध', value: 41 },
      { label: 'बिही', value: 76 },
      { label: 'शुक्र', value: 61 },
      { label: 'शनि', value: 92 },
      { label: 'आइत', value: 48 },
    ]
    return (
      <>
        <section className="dashboard-hero">
          <div className="dashboard-hero-copy">
            <span className="admin-eyebrow">{dashboardDate.toLocaleDateString('ne-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <h2>नमस्कार, सम्पादक 👋</h2>
            <p>राना युथ क्लबको गतिविधि र वेबसाइट सामग्रीको एकै ठाउँबाट व्यवस्थापन गर्नुहोस्।</p>
            <div className="hero-actions"><button className="admin-primary-button" type="button" onClick={startNewArticle}>＋ नयाँ समाचार</button><button className="hero-secondary-action" type="button" onClick={() => setActiveSection('activities')}>गतिविधि हेर्नुहोस् <span>→</span></button></div>
          </div>
          <div className="hero-illustration" aria-hidden="true"><span>राना</span><i>युवा · समुदाय · सहकार्य</i><b>✳</b><em>♡</em></div>
        </section>
        <section className="admin-stat-grid dashboard-stats" aria-label="ड्यासबोर्ड तथ्याङ्क">
          {stats.map((stat) => (
            <button className="admin-stat-card" key={stat.label} type="button" onClick={() => setActiveSection(stat.section)}>
              <span className={`stat-icon ${stat.tone}`} aria-hidden="true">{stat.icon}</span>
              <div><span>{stat.label}</span><strong>{stat.value.toLocaleString('ne-NP')}</strong><small>हेर्नुहोस् <b>↗</b></small></div>
            </button>
          ))}
        </section>
        <div className="dashboard-main-grid">
          <section className="admin-panel engagement-panel">
            <div className="admin-panel-heading"><div><h2>समुदाय सहभागिता</h2><p>यस हप्ताका कार्यक्रमहरूमा सहभागिताको झलक</p></div><span className="chart-period">यो हप्ता⌄</span></div>
            <div className="engagement-summary"><strong>{activities.reduce((total, item) => total + item.participants, 0).toLocaleString('ne-NP')}</strong><span>दर्ता भएका सहभागी</span><span className="engagement-trend">↗ सक्रिय समुदाय</span></div>
            <div className="engagement-chart" role="img" aria-label="हप्ताका दिनअनुसार समुदाय सहभागिता">
              {chartBars.map((bar) => <div className="chart-column" key={bar.label}><div className="chart-track"><span style={{ height: `${bar.value}%` }} /></div><small>{bar.label}</small></div>)}
            </div>
          </section>
          <section className="admin-panel quick-actions-panel">
            <div className="admin-panel-heading"><div><h2>छिटो पहुँच</h2><p>बारम्बार प्रयोग हुने कार्यहरू</p></div></div>
            <div className="quick-actions">
              <button type="button" onClick={startNewArticle}><span className="quick-action-icon red">＋</span><span><strong>समाचार लेख्नुहोस्</strong><small>नयाँ पोस्ट तयार गर्नुहोस्</small></span><b>→</b></button>
              <button type="button" onClick={() => { setActivityFormOpen(true); setActiveSection('activities') }}><span className="quick-action-icon gold">♧</span><span><strong>गतिविधि थप्नुहोस्</strong><small>आगामी कार्यक्रम योजना</small></span><b>→</b></button>
              <button type="button" onClick={() => setActiveSection('photos')}><span className="quick-action-icon blue">▧</span><span><strong>तस्बिर अपलोड</strong><small>ग्यालरी अपडेट गर्नुहोस्</small></span><b>→</b></button>
            </div>
          </section>
          <section className="admin-panel recent-panel">
            <div className="admin-panel-heading"><div><h2>हालका समाचार</h2><p>साइटमा भएका पछिल्ला सामग्री</p></div><button className="admin-secondary-button" type="button" onClick={() => setActiveSection('news')}>सबै हेर्नुहोस् →</button></div>
            {articles.length ? (
              <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>समाचार</th><th>श्रेणी</th><th>स्थिति</th><th>मिति</th></tr></thead>
                <tbody>{articles.slice(0, 4).map((article) => <tr key={article.id} onClick={() => editArticle(article)} className="clickable-row"><td className="admin-news-cell"><img src={article.image} alt="" /><span><strong>{article.title}</strong><small>/{article.slug}</small></span></td><td>{article.category}</td><td><StatusBadge status={article.status} label={article.status === 'published' ? 'प्रकाशित' : 'ड्राफ्ट'} /></td><td>{formatDate(article.date)}</td></tr>)}</tbody>
              </table></div>
            ) : <div className="admin-empty-state compact"><span>▤</span><h3>अहिलेसम्म समाचार छैन</h3><p>तपाईंले थपेका समाचार यहाँ देखिनेछन्।</p></div>}
          </section>
          <section className="admin-panel upcoming-panel">
            <div className="admin-panel-heading"><div><h2>गतिविधि झलक</h2><p>हालसालका कार्यक्रम र आगामी योजना</p></div><button className="admin-secondary-button" type="button" onClick={() => setActiveSection('activities')}>सबै हेर्नुहोस् →</button></div>
            <div className="dashboard-activity-list">{recentActivities.map((activity) => <button type="button" key={activity.id} onClick={() => setActiveSection('activities')}><span className={`activity-mini-icon ${activity.status}`}>♧</span><span><strong>{activity.title}</strong><small>{formatDate(activity.date)} · {activity.location}</small></span><StatusBadge status={activity.status} label={activity.status === 'upcoming' ? 'आगामी' : 'सम्पन्न'} /></button>)}</div>
          </section>
          <section className="admin-panel dashboard-inbox-panel">
            <div className="admin-panel-heading"><div><h2>नयाँ सन्देश</h2><p>समुदायबाट आएका जिज्ञासा</p></div><button className="admin-secondary-button" type="button" onClick={() => setActiveSection('messages')}>इनबक्स →</button></div>
            <div className="dashboard-message-list">{messages.filter((message) => message.status === 'unread').slice(0, 3).map((message) => <button type="button" key={message.id} onClick={() => { selectMessage(message); setActiveSection('messages') }}><span className="message-avatar">{message.name.slice(0, 1)}</span><span><strong>{message.name}</strong><small>{message.subject}</small></span><time>{formatDate(message.date.slice(0, 10))}</time></button>)}</div>
            {!counts.unreadMessages && <div className="no-new-messages">अहिले नयाँ सन्देश छैन।</div>}
          </section>
          <div className="dashboard-footer-note"><span>✦</span> स्थानीय डेमो डाटा · परिवर्तनहरू यही ब्राउजरमा सुरक्षित हुन्छन्</div>
        </div>
      </>
    )
  }

  function saveProfile() {
    if (profile.committeeMembers.some((member) => !member.name.trim() || !member.role.trim() || !member.bio.trim())) {
      showToast('error', 'समिति सदस्यका नाम, पद र परिचय पूरा गर्नुहोस् वा खाली सदस्य हटाउनुहोस्।')
      return
    }
    try {
      saveClubProfile({
        ...profile,
        introduction: profile.introduction.trim(),
        mission: profile.mission.trim(),
        vision: profile.vision.trim(),
        committeeMembers: profile.committeeMembers.map((member) => ({
          ...member,
          name: member.name.trim(),
          role: member.role.trim(),
          bio: member.bio.trim(),
          image: member.image?.trim() || undefined,
        })),
      })
      showToast('success', 'क्लब परिचय र टोली विवरण सुरक्षित भयो।')
    } catch {
      showToast('error', 'प्रोफाइल सुरक्षित गर्न सकिएन। ब्राउजरको भण्डारण क्षमता जाँच गर्नुहोस्।')
    }
  }

  function renderProfileEditor() {
    return (
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="admin-eyebrow">सार्वजनिक प्रोफाइल</span>
            <h2>हाम्रो बारेमा / टोली</h2>
            <p>क्लब परिचय, मिशन, दृष्टि र पुष्टि भएका समिति सदस्य सम्पादन गर्नुहोस्।</p>
          </div>
          <button className="admin-primary-button" type="button" onClick={saveProfile}>परिवर्तन सुरक्षित गर्नुहोस्</button>
        </div>
        <div className="profile-editor-grid">
          <label className="admin-field">
            <span>क्लब परिचय</span>
            <textarea rows={4} value={profile.introduction} onChange={(event) => setProfile({ ...profile, introduction: event.target.value })} />
          </label>
          <label className="admin-field">
            <span>मिशन</span>
            <textarea rows={4} value={profile.mission} onChange={(event) => setProfile({ ...profile, mission: event.target.value })} />
          </label>
          <label className="admin-field">
            <span>दृष्टि (भिजन)</span>
            <textarea rows={4} value={profile.vision} onChange={(event) => setProfile({ ...profile, vision: event.target.value })} />
          </label>
        </div>
        <div className="profile-goal-editor">
          <div className="admin-panel-heading">
            <div><h3>क्लबका लक्ष्यहरू</h3><p>सार्वजनिक प्रोफाइलमा देखिने लक्ष्य सम्पादन गर्नुहोस्।</p></div>
            <button className="admin-secondary-button" type="button" onClick={() => setProfile({
              ...profile,
              goals: [...profile.goals, { title: '', description: '' }],
            })}>＋ लक्ष्य थप्नुहोस्</button>
          </div>
          {profile.goals.map((goal, index) => (
            <div className="profile-goal-row" key={`goal-${index}`}>
              <label className="admin-field">
                <span>लक्ष्य शीर्षक</span>
                <input value={goal.title} onChange={(event) => setProfile({
                  ...profile,
                  goals: profile.goals.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item),
                })} />
              </label>
              <label className="admin-field">
                <span>विवरण</span>
                <textarea rows={2} value={goal.description} onChange={(event) => setProfile({
                  ...profile,
                  goals: profile.goals.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item),
                })} />
              </label>
              <button className="admin-row-delete" type="button" onClick={() => setProfile({
                ...profile,
                goals: profile.goals.filter((_, itemIndex) => itemIndex !== index),
              })}>हटाउनुहोस्</button>
            </div>
          ))}
        </div>
        <div className="profile-impact-editor">
          <div className="admin-panel-heading">
            <div><h3>समुदायमा योगदानका लक्ष्यहरू</h3><p>यी लक्ष्य हुन्, सम्पन्न गतिविधि वा प्राप्त नतिजा होइनन्।</p></div>
            <button className="admin-secondary-button" type="button" onClick={() => setProfile({
              ...profile,
              communityImpact: [...profile.communityImpact, ''],
            })}>＋ योगदान थप्नुहोस्</button>
          </div>
          {profile.communityImpact.map((impact, index) => (
            <div className="profile-impact-row" key={`impact-${index}`}>
              <label className="admin-field">
                <span>लक्ष्य विवरण</span>
                <input value={impact} onChange={(event) => setProfile({
                  ...profile,
                  communityImpact: profile.communityImpact.map((item, itemIndex) => itemIndex === index ? event.target.value : item),
                })} />
              </label>
              <button className="admin-row-delete" type="button" onClick={() => setProfile({
                ...profile,
                communityImpact: profile.communityImpact.filter((_, itemIndex) => itemIndex !== index),
              })}>हटाउनुहोस्</button>
            </div>
          ))}
        </div>
        <div className="profile-team-editor">
          <div className="admin-panel-heading">
            <div><h3>समिति सदस्य</h3><p>नाम, पद, परिचय र ऐच्छिक तस्बिर थप्नुहोस्।</p></div>
            <button
              className="admin-secondary-button"
              type="button"
              onClick={() => setProfile({
                ...profile,
                committeeMembers: [...profile.committeeMembers, { name: '', role: '', bio: '' }],
              })}
            >
              ＋ सदस्य थप्नुहोस्
            </button>
          </div>
          {profile.committeeMembers.length ? profile.committeeMembers.map((member, index) => (
            <div className="profile-member-editor" key={`member-${index}`}>
              <label className="admin-field">
                <span>नाम</span>
                <input value={member.name} onChange={(event) => setProfile({
                  ...profile,
                  committeeMembers: profile.committeeMembers.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item),
                })} />
              </label>
              <label className="admin-field">
                <span>जिम्मेवारी / पद</span>
                <input value={member.role} onChange={(event) => setProfile({
                  ...profile,
                  committeeMembers: profile.committeeMembers.map((item, itemIndex) => itemIndex === index ? { ...item, role: event.target.value } : item),
                })} />
              </label>
              <label className="admin-field">
                <span>छोटो परिचय</span>
                <textarea rows={2} value={member.bio} onChange={(event) => setProfile({
                  ...profile,
                  committeeMembers: profile.committeeMembers.map((item, itemIndex) => itemIndex === index ? { ...item, bio: event.target.value } : item),
                })} />
              </label>
              <label className="admin-field">
                <span>तस्बिर URL (ऐच्छिक)</span>
                <input value={member.image ?? ''} onChange={(event) => setProfile({
                  ...profile,
                  committeeMembers: profile.committeeMembers.map((item, itemIndex) => itemIndex === index ? { ...item, image: event.target.value } : item),
                })} />
              </label>
              <button className="admin-row-delete" type="button" onClick={() => setProfile({
                ...profile,
                committeeMembers: profile.committeeMembers.filter((_, itemIndex) => itemIndex !== index),
              })}>सदस्य हटाउनुहोस्</button>
            </div>
          )) : (
            <p className="profile-team-empty">पुष्टि भएका सदस्य विवरण थप्न “सदस्य थप्नुहोस्” थिच्नुहोस्।</p>
          )}
        </div>
        <div className="profile-save-bottom">
          <button className="admin-primary-button" type="button" onClick={saveProfile}>परिवर्तन सुरक्षित गर्नुहोस्</button>
        </div>
      </section>
    )
  }

  function renderPlaceholder() {
    if (section === 'dashboard' || section === 'news' || section === 'editor') return null
    if (section === 'activities') return renderActivities()
    if (section === 'photos') return renderPhotos()
    if (section === 'videos') return renderVideos()
    if (section === 'about') return renderProfileEditor()
    if (section === 'messages') return renderMessages()
    return renderSettings()
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar${menuOpen ? ' is-open' : ''}`}>
        <a className="admin-brand" href="/">
          <img src={clubLogo} alt="" />
          <span><strong>राना युथ क्लब</strong><small>व्यवस्थापन</small></span>
        </a>
        <div className="sidebar-label">मुख्य मेनु</div>
        <nav aria-label="प्रशासक नेभिगेसन">
          {sections.map((item) => (
            <button type="button" key={item.id} className={`sidebar-item${section === item.id ? ' active' : ''}`} onClick={() => setActiveSection(item.id)}>
              <span aria-hidden="true">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <button className="sidebar-item sidebar-logout" type="button" onClick={onExit}>
          <span aria-hidden="true">↪</span> लगआउट / साइटमा फर्कनुहोस्
        </button>
        <div className="sidebar-location">राजपुर, नेपाल</div>
      </aside>
      {menuOpen && <button className="admin-sidebar-backdrop" aria-label="मेनु बन्द गर्नुहोस्" onClick={() => setMenuOpen(false)} />}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-toggle" type="button" aria-label="प्रशासक मेनु खोल्नुहोस्" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <div className="admin-breadcrumb">व्यवस्थापन <span>/</span> {sections.find((item) => item.id === section)?.label}</div>
          <a href="/" className="view-site-link">साइट हेर्नुहोस् ↗</a>
        </header>
        <main className="admin-content">
          <div className="admin-local-warning" role="note">
            <strong>स्थानीय डेमो:</strong> व्यवस्थापनका परिवर्तनहरू यो ब्राउजरमा मात्र सुरक्षित हुन्छन्। प्रयोगकर्ताको प्रमाणीकरण र साझा भण्डारणका लागि सुरक्षित backend आवश्यक छ।
          </div>
          {storageError && <div className="admin-toast error" role="alert">{storageError}</div>}
          {toast && <div className={`admin-toast ${toast.type}`} role="status">{toast.message}</div>}
          {section === 'dashboard' && renderDashboard()}
          {section === 'news' && renderNewsList()}
          {section === 'editor' && renderEditor()}
          {section !== 'dashboard' && section !== 'news' && section !== 'editor' && renderPlaceholder()}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
