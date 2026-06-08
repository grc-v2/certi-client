import apiClient from './client'

export type CourseLessonType = 'VIDEO' | 'ARTICLE' | 'QUIZ'
export type CourseEnrollmentStatus = 'IN_PROGRESS' | 'COMPLETED'

export interface CourseLessonSummary {
  id: number
  title: string
  orderIndex: number
  durationMinutes: number
  type: CourseLessonType
  isCompleted: boolean
}

export interface CourseModuleResponse {
  id: number
  title: string
  description?: string
  orderIndex: number
  lessonsCount: number
  lessons: CourseLessonSummary[]
}

export interface CourseLessonDetailResponse {
  id: number
  courseId: number
  moduleId: number
  title: string
  description?: string
  content: string
  videoUrl?: string
  orderIndex: number
  durationMinutes: number
  type: CourseLessonType
  isCompleted: boolean
  nextLessonId?: number
  prevLessonId?: number
}

export interface CourseResponse {
  id: number
  certificationId: number
  certificationName: string
  name: string
  description?: string
  instructor: string
  thumbnailUrl?: string
  totalModules: number
  totalLessons: number
  durationMinutes: number
  enrolledCount: number
  published?: boolean
  modules: CourseModuleResponse[]
}

export interface CourseEnrollmentResponse {
  id: number
  courseId: number
  userId: number
  status: CourseEnrollmentStatus
  progressPercentage: number
  lastAccessedAt: string
  enrolledAt: string
  course: CourseResponse
}

export interface CompleteLessonResponse {
  message: string
  newProgressPercentage: number
}

interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  empty: boolean
}

export interface SearchCoursesParams {
  certificationId?: number
  search?: string
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}

export const coursesApi = {
  getAvailableCourses: (params: SearchCoursesParams = {}): Promise<CourseResponse[]> =>
    apiClient
      .get<PageResponse<CourseResponse>>('/api/v1/courses', { params })
      .then(r => r.data.content),

  searchCourses: (params: SearchCoursesParams = {}): Promise<PageResponse<CourseResponse>> =>
    apiClient
      .get<PageResponse<CourseResponse>>('/api/v1/courses', { params })
      .then(r => r.data),

  getCourseById: (id: number): Promise<CourseResponse> =>
    apiClient.get<CourseResponse>(`/api/v1/courses/${id}`).then(r => r.data),

  getMyEnrollments: (): Promise<CourseEnrollmentResponse[]> =>
    apiClient
      .get<CourseEnrollmentResponse[]>('/api/v1/users/me/enrollments')
      .then(r => r.data),

  enrollCourse: (courseId: number): Promise<CourseEnrollmentResponse> =>
    apiClient
      .post<CourseEnrollmentResponse>(`/api/v1/courses/${courseId}/enroll`)
      .then(r => r.data),

  getCourseLesson: (courseId: number, lessonId: number): Promise<CourseLessonDetailResponse> =>
    apiClient
      .get<CourseLessonDetailResponse>(`/api/v1/courses/${courseId}/lessons/${lessonId}`)
      .then(r => r.data),

  markLessonComplete: (courseId: number, lessonId: number): Promise<CompleteLessonResponse> =>
    apiClient
      .post<CompleteLessonResponse>(`/api/v1/courses/${courseId}/lessons/${lessonId}/complete`)
      .then(r => r.data),
}
