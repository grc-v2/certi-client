import apiClient from './client'
import type { CourseResponse } from './courses'

export interface AdminCourseRequest {
  certificationId: number
  name: string
  description?: string
  instructor?: string
  thumbnailUrl?: string
  durationMinutes?: number
}

export interface AdminCourseModuleRequest {
  title: string
  description?: string
  orderIndex?: number
}

export type AdminCourseLessonType = 'VIDEO' | 'ARTICLE' | 'QUIZ'

export interface AdminCourseLessonRequest {
  title: string
  description?: string
  content?: string
  videoUrl?: string
  durationMinutes?: number
  orderIndex?: number
  lessonType: AdminCourseLessonType
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

export interface AdminSearchCoursesParams {
  certificationId?: number
  search?: string
  published?: boolean
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}

const BASE = '/api/v1/admin/courses'

export const adminCoursesApi = {
  search: (params: AdminSearchCoursesParams = {}): Promise<PageResponse<CourseResponse>> =>
    apiClient.get<PageResponse<CourseResponse>>(BASE, { params }).then(r => r.data),

  getDetail: (id: number): Promise<CourseResponse> =>
    apiClient.get<CourseResponse>(`${BASE}/${id}`).then(r => r.data),

  create: (payload: AdminCourseRequest): Promise<CourseResponse> =>
    apiClient.post<CourseResponse>(BASE, payload).then(r => r.data),

  update: (id: number, payload: AdminCourseRequest): Promise<CourseResponse> =>
    apiClient.put<CourseResponse>(`${BASE}/${id}`, payload).then(r => r.data),

  remove: (id: number): Promise<void> =>
    apiClient.delete(`${BASE}/${id}`).then(() => undefined),

  publish: (id: number): Promise<CourseResponse> =>
    apiClient.post<CourseResponse>(`${BASE}/${id}/publish`).then(r => r.data),

  unpublish: (id: number): Promise<CourseResponse> =>
    apiClient.post<CourseResponse>(`${BASE}/${id}/unpublish`).then(r => r.data),

  createModule: (courseId: number, payload: AdminCourseModuleRequest): Promise<CourseResponse> =>
    apiClient.post<CourseResponse>(`${BASE}/${courseId}/modules`, payload).then(r => r.data),

  updateModule: (
    courseId: number,
    moduleId: number,
    payload: AdminCourseModuleRequest
  ): Promise<CourseResponse> =>
    apiClient
      .put<CourseResponse>(`${BASE}/${courseId}/modules/${moduleId}`, payload)
      .then(r => r.data),

  deleteModule: (courseId: number, moduleId: number): Promise<CourseResponse> =>
    apiClient
      .delete<CourseResponse>(`${BASE}/${courseId}/modules/${moduleId}`)
      .then(r => r.data),

  createLesson: (
    courseId: number,
    moduleId: number,
    payload: AdminCourseLessonRequest
  ): Promise<CourseResponse> =>
    apiClient
      .post<CourseResponse>(`${BASE}/${courseId}/modules/${moduleId}/lessons`, payload)
      .then(r => r.data),

  updateLesson: (
    courseId: number,
    moduleId: number,
    lessonId: number,
    payload: AdminCourseLessonRequest
  ): Promise<CourseResponse> =>
    apiClient
      .put<CourseResponse>(
        `${BASE}/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        payload
      )
      .then(r => r.data),

  deleteLesson: (
    courseId: number,
    moduleId: number,
    lessonId: number
  ): Promise<CourseResponse> =>
    apiClient
      .delete<CourseResponse>(`${BASE}/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
      .then(r => r.data),
}
