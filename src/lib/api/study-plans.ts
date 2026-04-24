import apiClient from './client'

// ── Request types ─────────────────────────────────────────────────────────────

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
export type DomainProficiency = 'BEGINNER' | 'DEVELOPING' | 'COMPETENT' | 'PROFICIENT' | 'EXPERT'
export type StudyDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

export interface StudyPlanCreateRequest {
  certificationId: number
  examDate: string                          // yyyy-MM-dd, must be future
  dailyStudyMinutes: number                 // 15..480
  studyDaysPerWeek?: number                 // 1..7, default 5
  preferredStudyDays?: StudyDay[]
  experienceLevel: ExperienceLevel
  domainProficiencies?: Record<string, DomainProficiency>
}

// ── Response types ────────────────────────────────────────────────────────────

export interface DomainAllocation {
  id: number
  domainId: number
  domainName: string
  domainCode: string
  weightPercentage: number
  allocatedHours: number
  completedHours: number
  proficiencyLevel: string
  displayOrder: number
}

export type DailyTaskType = 'STUDY' | 'PRACTICE' | 'REVIEW' | 'MOCK_EXAM'
export type DailyTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'

export interface DailyTask {
  id: number
  scheduledDate: string
  taskType: DailyTaskType
  title: string
  description?: string | null
  estimatedMinutes: number
  actualMinutes?: number | null
  status: DailyTaskStatus
  displayOrder: number
  domainName: string | null
  domainCode?: string | null
}

export interface DailyTaskDetail extends DailyTask {
  keyKnowledge: string[]
  learningObjectives: string[]
  examTips: string[]
}

export interface StudyWeek {
  id: number
  weekNumber: number
  phase: string
  theme: string
  startDate: string
  endDate: string
  plannedHours: number
  completedHours: number
  status: 'IN_PROGRESS' | 'UPCOMING' | 'COMPLETED'
  dailyTasks: DailyTask[]
}

export interface MilestoneResponse {
  id: number
  milestoneType: string
  title: string
  description?: string
  targetValue: number
  achievedValue: number
  targetDate?: string | null
  achievedDate?: string | null
  status: 'PENDING' | 'ACHIEVED'
}

export interface StudyPlanListItem {
  id: number
  status: string
  certification: {
    id: number
    name: string
    code: string
    slug: string
  }
  progress: {
    percent: number
    completedHours: number
    totalHours: number
  }
  schedule: {
    startDate: string
    examDate: string
    daysToExam: number
    dailyStudyMinutes: number
    studyDaysPerWeek: number
    currentWeek: number
    totalWeeks: number
    nextTaskDate: string
  }
  milestones: {
    achieved: number
    total: number
  }
  timestamps: {
    createdAt: string
    updatedAt: string
  }
}

export interface StudyPlanListResponse {
  items: StudyPlanListItem[]
  page: {
    number: number
    size: number
    totalElements: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
  summary: {
    total: number
    active: number
    paused: number
    completed: number
    dueIn7Days: number
    overdue: number
  }
}

// Keep for backward compat
export type StudyPlanResponse = StudyPlanListItem

export interface StudyPlanDetailResponse {
  id: number
  certificationId: number
  certificationName: string
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
  examDate: string
  dailyStudyMinutes: number
  studyDaysPerWeek: number
  preferredStudyDays: StudyDay[]
  experienceLevel: ExperienceLevel
  totalStudyHours: number
  completedHours: number
  progress: number
  readiness: number
  startDate: string
  endDate: string
  totalWeeks: number
  createdAt: string
  domainAllocations: DomainAllocation[]
  weeks: StudyWeek[]
  milestones: MilestoneResponse[]
}

// ── Lesson types ──────────────────────────────────────────────────────────────

export type LessonStatus = 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED'
export type LessonResourceType = 'POST' | 'QUESTION_SET' | 'EXAM' | 'DOC'

export interface LessonResource {
  id: number
  type: LessonResourceType
  refId: number | null
  url: string | null
  orderIndex: number
  mandatory: boolean
}

export interface StudyPlanLessonResponse {
  id: number
  planId: number
  domainAllocationId: number
  lessonTemplateId: number
  lessonTitle: string
  lessonSummary: string
  level: string
  estimatedMinutes: number
  orderIndex: number
  outcomes: string[]
  status: LessonStatus
  progress: number
  scheduledWeek: number
  completedAt: string | null
  resources: LessonResource[]
}

// ── API ───────────────────────────────────────────────────────────────────────

export const studyPlansApi = {
  getAll: () =>
    apiClient.get<StudyPlanListResponse>('/api/v1/study-plans').then(r => r.data),
  getById: (id: string | number) =>
    apiClient.get<StudyPlanDetailResponse>(`/api/v1/study-plans/${id}`).then(r => r.data),
  getActive: (certificationId: number) =>
    apiClient.get<StudyPlanDetailResponse>('/api/v1/study-plans/active', { params: { certificationId } }).then(r => r.data),
  create: (data: StudyPlanCreateRequest) =>
    apiClient.post<StudyPlanDetailResponse>('/api/v1/study-plans', data).then(r => r.data),
  update: (id: string, data: unknown) =>
    apiClient.put<StudyPlanDetailResponse>(`/api/v1/study-plans/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiClient.delete(`/api/v1/study-plans/${id}`),
  getTaskDetail: (planId: string | number, taskId: number) =>
    apiClient.get<DailyTaskDetail>(`/api/v1/study-plans/${planId}/tasks/${taskId}`).then(r => r.data),
  completeTask: (planId: string | number, taskId: number, actualMinutes: number) =>
    apiClient.put(`/api/v1/study-plans/${planId}/tasks/${taskId}/complete`, { actualMinutes }),
  getMilestones: (planId: string) =>
    apiClient.get<MilestoneResponse[]>(`/api/v1/study-plans/${planId}/milestones`).then(r => r.data),
  getDomainLessons: (planId: string | number, domainId: number) =>
    apiClient.get<StudyPlanLessonResponse[]>(`/api/v1/study-plans/${planId}/domains/${domainId}/lessons`).then(r => r.data),
  getLessonDetail: (planId: string | number, lessonId: number) =>
    apiClient.get<StudyPlanLessonResponse>(`/api/v1/study-plans/${planId}/lessons/${lessonId}`).then(r => r.data),
  completeLesson: (planId: string | number, lessonId: number) =>
    apiClient.put<StudyPlanLessonResponse>(`/api/v1/study-plans/${planId}/lessons/${lessonId}/complete`).then(r => r.data),
}
