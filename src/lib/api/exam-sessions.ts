import apiClient from './client'

// ── Shared ────────────────────────────────────────────────────────────────────

export interface OptionResponse {
  id: number
  content: string
  orderIndex: number
}

export interface QuestionResponse {
  id: number
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE'
  content: string
  difficulty: string
  points: number
  timeLimitSeconds: number
  domainId: number
  options: OptionResponse[]
}

// ── Start session ─────────────────────────────────────────────────────────────

export interface StartSessionResponse {
  id: number
  examId: number
  examTitle: string
  certificationId: number
  certificationName: string
  mode: string
  status: string
  startTime: string
  endTime?: string | null
  deadline?: string | null
  durationMinutes: number
  passingScore: number
  totalQuestions: number
  currentQuestionIndex: number
  questions: QuestionResponse[]
}

// ── Active sessions ───────────────────────────────────────────────────────────

export interface ActiveSessionResponse {
  id: number
  userId: number
  examId: number
  certificationId: number
  certificationName: string
  startTime: string
  endTime?: string | null
  deadline?: string | null
  status: string
  mode: string
  examTitle: string
  totalQuestions: number
  durationMinutes: number
  answeredCount: number
  correctCount: number
  wrongCount: number
  unansweredCount: number
  flaggedCount: number
  timeSpentSeconds: number
}

// ── Resume session ────────────────────────────────────────────────────────────

export interface ResumeQuestionItem {
  question: QuestionResponse
  selectedOptionIds: number[] | null
  isFlagged: boolean
  isCorrect: boolean | null
}

export interface ResumeSessionResponse {
  id: number
  examId: number
  examTitle: string
  certificationId: number
  certificationName: string
  mode: string
  status: string
  startTime: string
  deadline?: string | null
  durationMinutes: number
  totalQuestions: number
  answeredCount: number
  unansweredCount: number
  flaggedCount: number
  timeSpentSeconds: number
  questions: ResumeQuestionItem[]
}

// ── sessionStorage keys ───────────────────────────────────────────────────────

export const EXAM_SESSION_KEY = (id: string | number) => `exam-session-${id}`
export const EXAM_INIT_KEY    = (id: string | number) => `exam-init-${id}`

// ── Normalise resume → StartSessionResponse + init state ─────────────────────

export interface ExamInitState {
  answers: Record<number, number[]>
  flagged: Record<number, boolean>
  timeLeftSeconds: number
}

export function normaliseResumeSession(resume: ResumeSessionResponse): {
  session: StartSessionResponse
  init: ExamInitState
} {
  const answers: Record<number, number[]> = {}
  const flagged: Record<number, boolean>  = {}

  for (const item of resume.questions) {
    if (item.selectedOptionIds?.length) answers[item.question.id] = item.selectedOptionIds
    if (item.isFlagged)                 flagged[item.question.id]  = true
  }

  // Prefer server-truth deadline → derives remaining time vs wall clock.
  // Fall back to (duration - spent) only when no deadline is provided (e.g. Practice without timer).
  let timeLeftSeconds = 0
  if (resume.deadline) {
    timeLeftSeconds = Math.max(0, Math.floor((new Date(resume.deadline).getTime() - Date.now()) / 1000))
  } else if (resume.durationMinutes) {
    timeLeftSeconds = Math.max(0, resume.durationMinutes * 60 - resume.timeSpentSeconds)
  }

  return {
    session: {
      id:                   resume.id,
      examId:               resume.examId,
      examTitle:            resume.examTitle,
      certificationId:      resume.certificationId,
      certificationName:    resume.certificationName,
      mode:                 resume.mode,
      status:               resume.status,
      startTime:            resume.startTime,
      deadline:             resume.deadline ?? null,
      durationMinutes:      resume.durationMinutes,
      passingScore:         0,
      totalQuestions:       resume.totalQuestions,
      currentQuestionIndex: 0,
      questions:            resume.questions.map(i => i.question),
    },
    init: {
      answers,
      flagged,
      timeLeftSeconds,
    },
  }
}

// ── Answer submission ─────────────────────────────────────────────────────────

export interface AnswerRequest {
  questionId: number
  selectedOptionIds: number[]
  timeSpentSeconds?: number
  isFlagged?: boolean
}

export interface AnswerFeedbackResponse {
  questionId: number
  answered: boolean
  isCorrect: boolean | null
  correctOptionIds: number[] | null
  explanation: string | null
  referenceLinks: string[] | null
}

// ── Review session ────────────────────────────────────────────────────────────

export interface ReviewQuestionItem {
  question: QuestionResponse
  selectedOptionIds: number[]
  correctOptionIds: number[]
  isCorrect: boolean | null
  explanation: string | null
  referenceLinks: string[] | null
}

export interface ReviewSessionResponse {
  id: number
  examId: number | null
  examTitle: string | null
  certificationId: number | null
  certificationName: string | null
  mode: string
  status: string
  startTime: string
  endTime: string | null
  totalQuestions: number
  correctCount: number
  wrongCount: number
  scorePercentage: number | null
  passed: boolean | null
  timeSpentSeconds: number
  questions: ReviewQuestionItem[]
}

// ── Exam result ───────────────────────────────────────────────────────────────

export interface TopicPerformance {
  topicId: number
  topicName: string
  totalQuestions: number
  correctAnswers: number
  percentage: number
}

export interface QuestionResult {
  questionId: number
  questionText: string
  userAnswerIds: number[]
  correctAnswerIds: number[]
  isCorrect: boolean
  timeSpentSeconds: number
  explanation: string | null
  reference: string | null
}

export interface ExamResultResponse {
  resultId: number
  sessionId: number
  userId: number
  examId: number
  examTitle: string
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  unanswered: number
  score: number
  percentage: number
  passStatus: 'PASSED' | 'FAILED'
  mode: string
  passingScore: number
  timeTakenSeconds: number
  completedAt: string
  topicPerformances: TopicPerformance[]
  questionResults: QuestionResult[]
  success: boolean
  errorMessage: string | null
}

// ── API ───────────────────────────────────────────────────────────────────────

export const examSessionsApi = {
  // Server forces mode = EXAM; the payload is kept empty for forward-compat options.
  startExam: (examId: number) =>
    apiClient.post<StartSessionResponse>(`/api/v1/exam-sessions/exam/${examId}/start`, {}).then(r => r.data),
  startPractice: (data: { certificationId: number; questionCount?: number; domainIds?: number[]; difficulties?: string[] }) =>
    apiClient.post<StartSessionResponse>('/api/v1/exam-sessions/practice/start', data).then(r => r.data),
  getActive: () =>
    apiClient.get<ActiveSessionResponse[]>('/api/v1/exam-sessions/active').then(r => r.data),
  resumeSession: (sessionId: number) =>
    apiClient.get<ResumeSessionResponse>(`/api/v1/exam-sessions/${sessionId}/resume`).then(r => r.data),
  reviewSession: (sessionId: string | number) =>
    apiClient.get<ReviewSessionResponse>(`/api/v1/exam-sessions/${sessionId}/review`).then(r => r.data),
  submitAnswer: (sessionId: string | number, data: AnswerRequest) =>
    apiClient.post<AnswerFeedbackResponse>(`/api/v1/exam-sessions/${sessionId}/answer`, data).then(r => r.data),
  completeSession: (sessionId: string | number) =>
    apiClient.post<ExamResultResponse>(`/api/v1/exam-sessions/${sessionId}/complete`).then(r => r.data),
  pauseSession: (sessionId: string | number, data?: { timeSpentSeconds?: number }) =>
    apiClient.post(`/api/v1/exam-sessions/${sessionId}/pause`, data ?? {}),
  resumePlay: (sessionId: string | number) =>
    apiClient.post(`/api/v1/exam-sessions/${sessionId}/resume-play`),
  abandonSession: (sessionId: string | number) =>
    apiClient.post(`/api/v1/exam-sessions/${sessionId}/abandon`),
  timeoutSession: (sessionId: string | number) =>
    apiClient.post<ExamResultResponse>(`/api/v1/exam-sessions/${sessionId}/timeout`).then(r => r.data),
  getResult: (sessionId: string | number) =>
    apiClient.get(`/api/v1/exam-sessions/${sessionId}/result`).then(r => r.data),
}


