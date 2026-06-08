export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  // Client
  HOME: '/dashboard',
  CERTIFICATIONS: '/certifications',
  LEARN: '/learn',
  COMMUNITY: '/community',
  BOOKMARKS: '/bookmarks',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  // Exam
  EXAM: '/exam',
  // Admin
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_POSTS: '/admin/posts',
  ADMIN_CERTIFICATIONS: '/admin/certifications',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
} as const

export const QUERY_KEYS = {
  CERTIFICATIONS: ['certifications'],
  CERTIFICATION: (slug: string) => ['certifications', slug],
  POSTS: ['posts'],
  POST: (slug: string) => ['posts', slug],
  PROFILE: ['profile'],
  DASHBOARD: ['dashboard'],
  NOTIFICATIONS: ['notifications'],
  STUDY_PLANS: ['study-plans'],
  EXAM_SESSIONS: ['exam-sessions'],
  TAGS: ['tags'],
  BOOKMARKS: ['bookmarks'],
  STREAKS: ['streaks'],
  HEATMAP: ['heatmap'],
} as const
