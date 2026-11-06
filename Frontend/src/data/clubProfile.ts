export type CommitteeMember = {
  name: string
  role: string
  bio: string
  image?: string
}

export type ClubProfile = {
  introduction: string
  mission: string
  vision: string
  goals: { title: string; description: string }[]
  communityImpact: string[]
  committeeMembers: CommitteeMember[]
}

export const clubProfile: ClubProfile = {
  introduction:
    'राना युथ क्लब राजपुरका युवाहरू र समुदायलाई जोड्ने साझा पहल हो। स्थानीय आवाज, विचार र सहभागिताका लागि खुला मञ्चका रूपमा क्लबले आफ्नो समुदायसँगै अघि बढ्ने लक्ष्य राख्छ।',
  mission:
    'युवाको सक्रिय सहभागितालाई प्रोत्साहन गर्दै राजपुरमा सहकार्य, समावेशिता र समुदाय सेवाको भावना बलियो बनाउनु।',
  vision:
    'सहभागी, सचेत र सहयोगी समुदाय निर्माणमा योगदान गर्ने युवामैत्री क्लब बन्नु।',
  goals: [
    {
      title: 'युवा नेतृत्व',
      description: 'युवालाई सिक्ने, विचार राख्ने र समुदायमा जिम्मेवारी लिने अवसरका लागि प्रोत्साहित गर्नु।',
    },
    {
      title: 'समुदायसँग सहकार्य',
      description: 'स्थानीय आवश्यकता र प्राथमिकताबारे समुदायसँग संवाद तथा सहकार्यलाई अघि बढाउनु।',
    },
    {
      title: 'समावेशी सहभागिता',
      description: 'विभिन्न पृष्ठभूमिका मानिसहरूको आवाज र सहभागितालाई सम्मान गर्ने वातावरण बनाउनु।',
    },
  ],
  communityImpact: [
    'युवाको सहभागिता र नेतृत्व क्षमतामा योगदान',
    'समुदायका आवश्यकता र आवाजलाई साझा मञ्चमा जोड्ने',
    'सहकार्य र सेवामुखी पहललाई प्रोत्साहन',
  ],
  committeeMembers: [] as CommitteeMember[],
}

const storageKey = 'rana-youth-club-profile'
const updateEvent = 'rana-youth-club-profile-updated'

function isClubProfile(value: unknown): value is ClubProfile {
  if (typeof value !== 'object' || value === null) return false
  const profile = value as Record<string, unknown>
  return typeof profile.introduction === 'string'
    && typeof profile.mission === 'string'
    && typeof profile.vision === 'string'
    && Array.isArray(profile.goals)
    && profile.goals.every((goal) => typeof goal === 'object'
      && goal !== null
      && typeof (goal as Record<string, unknown>).title === 'string'
      && typeof (goal as Record<string, unknown>).description === 'string')
    && Array.isArray(profile.communityImpact)
    && profile.communityImpact.every((impact) => typeof impact === 'string')
    && Array.isArray(profile.committeeMembers)
    && profile.committeeMembers.every((member) => typeof member === 'object'
      && member !== null
      && typeof (member as Record<string, unknown>).name === 'string'
      && typeof (member as Record<string, unknown>).role === 'string'
      && typeof (member as Record<string, unknown>).bio === 'string'
      && ((member as Record<string, unknown>).image === undefined
        || typeof (member as Record<string, unknown>).image === 'string'))
}

export function getClubProfile(): ClubProfile {
  const stored = window.localStorage.getItem(storageKey)
  if (!stored) return clubProfile

  const profile: unknown = JSON.parse(stored)
  if (!isClubProfile(profile)) throw new Error('क्लब प्रोफाइल सही ढाँचामा छैन।')
  return profile
}

export function saveClubProfile(profile: ClubProfile): void {
  window.localStorage.setItem(storageKey, JSON.stringify(profile))
  window.dispatchEvent(new CustomEvent(updateEvent))
}

export function addClubProfileUpdateListener(listener: () => void): () => void {
  window.addEventListener(updateEvent, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(updateEvent, listener)
    window.removeEventListener('storage', listener)
  }
}
