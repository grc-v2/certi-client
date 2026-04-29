import apiClient from './client'
import type { PageDto } from './certifications'

export interface QuestionOptionResponse {
  id: number
  content: string
  orderIndex: number
  isCorrect?: boolean
}

export interface AdminQuestionResponse {
  id: number
  type: string
  content: string
  explanation?: string
  difficulty: string
  points?: number
  timeLimitSeconds?: number
  referenceUrl?: string
  domainId?: number
  domainName?: string
  certificationId?: number
  certificationCode?: string
  status: string
  questionCode?: string
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
  options: QuestionOptionResponse[]
}

export interface QuestionOptionRequest {
  content: string
  isCorrect: boolean
  orderIndex: number
}

export interface QuestionCreateRequest {
  domainId: number
  type: string
  content: string
  explanation?: string
  difficulty: string
  points?: number
  timeLimitSeconds?: number
  referenceUrl?: string
  options: QuestionOptionRequest[]
}

export interface QuestionSearchParams {
  keyword?: string
  domainId?: number
  certificationId?: number
  type?: string
  difficulty?: string
  status?: string
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: string
}

export const adminQuestionsApi = {
  search: (params: QuestionSearchParams) =>
    apiClient.get<PageDto<AdminQuestionResponse>>('/api/v1/admin/questions', { params }).then(r => r.data),
  getById: (id: number) =>
    apiClient.get<AdminQuestionResponse>(`/api/v1/admin/questions/${id}`).then(r => r.data),
  create: (data: QuestionCreateRequest) =>
    apiClient.post<AdminQuestionResponse>('/api/v1/admin/questions', data).then(r => r.data),
  update: (id: number, data: QuestionCreateRequest) =>
    apiClient.put<AdminQuestionResponse>(`/api/v1/admin/questions/${id}`, data).then(r => r.data),
  updateStatus: (id: number, status: string) =>
    apiClient.patch<AdminQuestionResponse>(`/api/v1/admin/questions/${id}/status`, null, { params: { status } }).then(r => r.data),
  delete: (id: number) =>
    apiClient.delete(`/api/v1/admin/questions/${id}`),
}
