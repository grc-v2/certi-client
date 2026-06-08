import apiClient from './client'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface StreakInfo {
  streakType: string
  currentStreak: number
  longestStreak: number
  lastActivityDate: string
  frozen: boolean
}

export interface MockSummary {
  totalAttempts: number
  latestScore: number
  bestScore: number
  averageScore: number
  trend: 'UP' | 'DOWN' | 'STABLE'
}

export interface DomainProgress {
  domainId: number
  domainName: string
  currentScore: number
  questionsAttempted: number
  accuracy: number
}

export interface DashboardActivity {
  activityType: string
  description: string
  durationMinutes: number
  activityDate: string
  domainName: string | null
}

export interface DashboardResponse {
  planCompletionPct: number
  readinessScore: number
  totalStudyDays: number
  streaks: StreakInfo[]
  mockSummary: MockSummary
  daysUntilExam: number
  domainProgress: DomainProgress[]
  todayActivity: DashboardActivity[]
  recentActivities: DashboardActivity[]
}

export type IntensityLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'

export interface HeatmapEntry {
  date: string
  activityCount: number
  studyMinutes: number
  intensityLevel: IntensityLevel
}

export interface ReadinessTrendEntry {
  date: string
  value: number
}

export interface WeeklyReport {
  id: number
  weekStartDate: string
  weekEndDate: string
  totalStudyMinutes: number
  totalPracticeQuestions: number
  summary: string
}

export interface WeeklyReportPage {
  content: WeeklyReport[]
  totalPages: number
  totalElements: number
  first: boolean
  last: boolean
  number: number
}

// ── API ────────────────────────────────────────────────────────────────────────

export const progressApi = {
  getDashboard: (certificationId: number) => Promise.resolve({
    planCompletionPct: 0,
    readinessScore: 0,
    totalStudyDays: 0,
    streaks: [],
    mockSummary: { totalAttempts: 0, latestScore: 0, bestScore: 0, averageScore: 0, trend: 'STABLE' },
    daysUntilExam: 0,
    domainProgress: [],
    todayActivity: [],
    recentActivities: []
  } as DashboardResponse),
  getHeatmap: (certificationId: number, startDate?: string, endDate?: string) => Promise.resolve([] as HeatmapEntry[]),
  getStreaks: (certificationId: number) => Promise.resolve([] as StreakInfo[]),
  getReadinessTrend: (certificationId: number, days = 30) => Promise.resolve([] as ReadinessTrendEntry[]),
  getWeeklyReports: (certificationId: number, page = 0, size = 10) => Promise.resolve({ content: [], totalPages: 0, totalElements: 0, first: true, last: true, number: 0 } as WeeklyReportPage),
  getActivityFeed: (certificationId: number, page = 0, size = 20) => Promise.resolve([] as DashboardActivity[]),
}


