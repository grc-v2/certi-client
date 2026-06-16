import apiClient from './client'

export interface CertificationResponse {
  id: number
  name: string
  code: string
  slug: string
  provider: string
  level: string
  status: string
  description?: string
  durationMinutes?: number
  totalQuestions?: number
  passingScore?: number
  price?: number
}

export interface CertificationDomainResponse {
  id: number
  name: string
  code: string
  description?: string
  weightPercentage: number
  displayOrder: number
  certificationId: number
}

export interface ExamResponse {
  id: number
  title: string
  type: string
  description?: string
  durationMinutes: number
  totalQuestions: number
  passingScore: number
  status: string
  certificationId: number
  certificationName: string
}

export interface CertificationDetailResponse extends CertificationResponse {
  domains: CertificationDomainResponse[]
  exams: ExamResponse[]
}

export interface PageDto<T> {
  content: T[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
  last: boolean
  first: boolean
  empty: boolean
}

export interface CertificationSearchParams {
  keyword?: string
  provider?: string
  level?: string
  difficultyLevel?: string
  status?: string
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}

export interface CertificationRequest {
  name: string
  provider: string
  level: string
  description?: string
  passingScore?: number
  totalQuestions?: number
  durationMinutes?: number
  price?: number
}

export interface CertificationDomainRequest {
  name: string
  code: string
  description?: string
  weightPercentage: number
  displayOrder: number
}

export const certificationsApi = {
  search: (params?: CertificationSearchParams) =>
    apiClient.get<PageDto<CertificationResponse>>('/api/v1/certifications', { params }).then(r => r.data),
  getBySlug: (slug: string) =>
    apiClient.get<CertificationDetailResponse>(`/api/v1/certifications/${slug}`).then(r => r.data),
  getById: (id: string | number) =>
    apiClient.get<CertificationDetailResponse>(`/api/v1/certifications/${id}`).then(r => r.data),
  getDomains: (slug: string) =>
    apiClient.get<CertificationDomainResponse[]>(`/api/v1/certifications/${slug}/domains`).then(r => r.data),
  // Admin
  create: (data: CertificationRequest) => apiClient.post<CertificationResponse>('/api/v1/admin/certifications', data).then(r => r.data),
  update: (id: string | number, data: CertificationRequest) => apiClient.put<CertificationResponse>(`/api/v1/admin/certifications/${id}`, data).then(r => r.data),
  delete: (id: string | number) => apiClient.delete(`/api/v1/admin/certifications/${id}`),
  updateStatus: (id: string | number, status: string) =>
    apiClient.patch(`/api/v1/admin/certifications/${id}/status`, null, { params: { status } }),
  createDomain: (certificationId: string | number, data: CertificationDomainRequest) =>
    apiClient.post<CertificationDomainResponse>(`/api/v1/admin/certifications/${certificationId}/domains`, data).then(r => r.data),
  updateDomain: (id: string | number, data: CertificationDomainRequest) => apiClient.put<CertificationDomainResponse>(`/api/v1/admin/domains/${id}`, data).then(r => r.data),
  deleteDomain: (id: string | number) => apiClient.delete(`/api/v1/admin/domains/${id}`),
}
