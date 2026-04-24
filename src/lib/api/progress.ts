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
  getDashboard: (certificationId: number) =>
    apiClient.get<DashboardResponse>('/api/v1/progress/dashboard', {
      params: { certificationId },
    }).then(r => r.data),

  getHeatmap: (certificationId: number, startDate?: string, endDate?: string) =>
    apiClient.get<HeatmapEntry[]>('/api/v1/progress/heatmap', {
      params: { certificationId, startDate, endDate },
    }).then(r => r.data),

  getStreaks: (certificationId: number) =>
    apiClient.get<StreakInfo[]>('/api/v1/progress/streaks', {
      params: { certificationId },
    }).then(r => r.data),

  getReadinessTrend: (certificationId: number, days = 30) =>
    apiClient.get<ReadinessTrendEntry[]>('/api/v1/progress/trends/readiness', {
      params: { certificationId, days },
    }).then(r => r.data),

  getWeeklyReports: (certificationId: number, page = 0, size = 10) =>
    apiClient.get<WeeklyReportPage>('/api/v1/progress/weekly-reports', {
      params: { certificationId, page, size },
    }).then(r => r.data),

  getActivityFeed: (certificationId: number, page = 0, size = 20) =>
    apiClient.get<DashboardActivity[]>('/api/v1/progress/activity-feed', {
      params: { certificationId, page, size },
    }).then(r => r.data),
}
