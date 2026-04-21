import apiClient from './client'

// ── Result detail ─────────────────────────────────────────────────────────────

export interface ResultSummary {
  totalQuestions: number
  answeredQuestions: number
  unansweredQuestions: number
  correctAnswers: number
  wrongAnswers: number
  score: number
  percentage: number
  passingScore: number
  status: 'PASSED' | 'FAILED'
  totalTimeSpent: number
  averageTimePerQuestion: number
}

export interface TopicPerformance {
  topicId: number
  topicName: string
  weight: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  percentage: number
  status: string
  recommendations: string[]
}

export interface DifficultyBreakdown {
  total: number
  correct: number
  percentage: number
}

export interface DifficultyAnalysis {
  easy: DifficultyBreakdown
  medium: DifficultyBreakdown
  hard: DifficultyBreakdown
}

export interface ResultBadge {
  type: string
  name: string
  description: string
  icon: string
}

export interface ResultDetailResponse {
  id: number
  sessionId: number
  userId: number
  examId: number
  examTitle: string
  certificationId: number
  certificationName: string
  examType: string
  completedAt: string
  summary: ResultSummary
  topicPerformance: TopicPerformance[]
  difficultyAnalysis: DifficultyAnalysis
  strengths: string[]
  weaknesses: string[]
  nextSteps: string[]
  badges: ResultBadge[]
  createdAt: string
}

// ── History ───────────────────────────────────────────────────────────────────

export interface HistoryResultItem {
  resultId: number
  examId: number
  examTitle: string
  examType: string
  certificationId: number
  certificationName: string
  score: number
  percentage: number
  status: 'PASSED' | 'FAILED'
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  completedAt: string
  attemptNumber: number
}

export interface HistoryStatCertification {
  certificationId: number
  name: string
  exams: number
  averageScore: number
}

export interface HistoryStatistics {
  totalExams: number
  totalPassed: number
  totalFailed: number
  passRate: number
  averageScore: number
  bestScore: number
  totalTimeSpent: number
  averageTimePerExam: number
  certifications: HistoryStatCertification[]
}

export interface HistoryPagination {
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  empty: boolean
}

export interface UserHistoryResponse {
  userId: number
  results: HistoryResultItem[]
  statistics: HistoryStatistics
  pagination: HistoryPagination
}

export interface HistoryParams {
  certificationId?: number
  examId?: number
  status?: 'PASSED' | 'FAILED'
  startDate?: string
  endDate?: string
  page?: number
  size?: number
  sort?: string
}

// ── Question report ───────────────────────────────────────────────────────────

export interface QuestionUserAnswer {
  selectedOptionIds: number[]
  selectedOptions: string[]
  isCorrect: boolean | null
  timeSpent: number
}

export interface QuestionCorrectAnswer {
  correctOptionIds: number[]
  correctOptions: string[]
}

export interface QuestionReportItem {
  questionId: number
  questionNumber: number
  topicId: number
  topicName: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  type: string | null
  content: string
  userAnswer: QuestionUserAnswer
  correctAnswer: QuestionCorrectAnswer
  explanation: string
  referenceLinks: string[]
  wasFlagged: boolean
  wasReviewed: boolean
}

export interface QuestionReportSummary {
  totalQuestions: number
  correct: number
  wrong: number
  flagged: number
  reviewed: number
}

export interface QuestionReportPagination {
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  empty: boolean
}

export interface QuestionReportResponse {
  resultId: number
  questions: QuestionReportItem[]
  summary: QuestionReportSummary
  pagination: QuestionReportPagination
}

export interface QuestionReportParams {
  page?: number
  size?: number
  filter?: 'correct' | 'wrong' | 'skipped' | 'flagged'
}

// ── API ───────────────────────────────────────────────────────────────────────

export const resultsApi = {
  getResult: (resultId: number | string) =>
    apiClient.get<ResultDetailResponse>(`/api/v1/results/${resultId}`).then(r => r.data),
  getHistory: (userId: number | string, params?: HistoryParams) =>
    apiClient.get<UserHistoryResponse>(`/api/v1/results/user/${userId}/history`, { params }).then(r => r.data),
  getQuestions: (resultId: number | string, params?: QuestionReportParams) =>
    apiClient.get<QuestionReportResponse>(`/api/v1/results/${resultId}/questions`, { params }).then(r => r.data),
}
