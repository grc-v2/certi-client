export type StreakType = "STUDY" | "LESSON_COMPLETION" | "PRACTICE" | string;

export interface StreakResponse {
  streakType: StreakType;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  frozen: boolean;
}

export interface ActivityFeedItem {
  activityType: string;
  description: string;
  durationMinutes: number | null;
  activityDate: string;
  domainName: string | null;
}

export interface DomainProgressResponse {
  domainId: number;
  domainName: string;
  currentScore: string | null;
  questionsAttempted: number | null;
  accuracy: string | null;
}

export interface MockExamSummaryResponse {
  totalAttempts: number | null;
  latestScore: string | null;
  bestScore: string | null;
  averageScore: string | null;
  trend: string | null;
}

export interface DashboardResponse {
  planCompletionPct: string | null;
  readinessScore: string | null;
  totalStudyDays: number | null;
  streaks: StreakResponse[] | null;
  mockSummary: MockExamSummaryResponse | null;
  daysUntilExam: number | null;
  domainProgress: DomainProgressResponse[] | null;
  todayActivity: ActivityFeedItem[] | null;
  recentActivities: ActivityFeedItem[] | null;
}
