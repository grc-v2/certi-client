import apiClient from './client'
import type { PageDto } from './certifications'

export interface UserSummaryResponse {
  id: string; email: string; fullName: string; status: string
  roleCode: string; registrationDate: string; lastLogin?: string
}

export interface UserDetailResponse extends UserSummaryResponse {
  bio?: string; avatar?: string; avatarUrl?: string; postCount: number
  certificationCount: number; sessions: UserSessionResponse[]
}

export interface UserSessionResponse {
  id: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  lastAccessedAt?: string
  expiresAt?: string
}

export interface AdminUserListParams {
  search?: string
  status?: string
  role?: string
  sort?: string
  page?: number
  size?: number
}

export interface AdminUserUpdateRequest {
  fullName?: string
  bio?: string
  status?: string
  roleCode?: string
}

export interface AuditLogParams {
  actor?: string
  action?: string
  resourceType?: string
  statusCode?: number
  from?: string
  to?: string
  page?: number
  size?: number
}

export const adminApi = {
  // Users
  listUsers: (params?: AdminUserListParams) =>
    apiClient.get<PageDto<UserSummaryResponse>>('/api/v1/admin/users', { params }).then(r => r.data),
  getUserById: (id: string) =>
    apiClient.get<UserDetailResponse>(`/api/v1/admin/users/${id}`).then(r => r.data),
  updateUser: (id: string, data: AdminUserUpdateRequest) =>
    apiClient.put<UserDetailResponse>(`/api/v1/admin/users/${id}`, data).then(r => r.data),
  deleteUser: (id: string) => apiClient.delete(`/api/v1/admin/users/${id}`),
  activateUser: (id: string) => apiClient.patch(`/api/v1/admin/users/${id}/activate`),
  deactivateUser: (id: string) => apiClient.patch(`/api/v1/admin/users/${id}/deactivate`),
  bulkActivate: (userIds: string[]) => apiClient.post('/api/v1/admin/users/bulk/activate', { userIds }).then(r => r.data),
  bulkDeactivate: (userIds: string[]) => apiClient.post('/api/v1/admin/users/bulk/deactivate', { userIds }).then(r => r.data),
  getActiveSessions: (userId: string) =>
    apiClient.get<UserSessionResponse[]>(`/api/v1/admin/users/${userId}/sessions/active`).then(r => r.data),
  forceLogoutAllSessions: (userId: string) =>
    apiClient.delete(`/api/v1/admin/users/${userId}/sessions`).then(r => r.data),
  forceLogoutSession: (userId: string, sessionId: string) =>
    apiClient.delete(`/api/v1/admin/users/${userId}/sessions/${sessionId}`),
  // Audit
  getAuditLogs: (params?: AuditLogParams) =>
    apiClient.get<PageDto<AuditLogResponse>>('/api/v1/admin/audit', { params }).then(r => r.data),
  getAuditLogById: (id: number) =>
    apiClient.get<AuditLogResponse>(`/api/v1/admin/audit/${id}`).then(r => r.data),
}

export interface AuditLogResponse {
  id: number
  actorId?: number
  actorUsername?: string
  action: string
  resourceType?: string
  resourceId?: string
  httpMethod?: string
  httpPath?: string
  queryString?: string
  ipAddress?: string
  userAgent?: string
  statusCode?: number
  durationMs?: number
  serviceName?: string
  occurredAt: string
}
