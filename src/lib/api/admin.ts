import apiClient from './client'
import type { PageDto } from './certifications'

export interface UserSummaryResponse {
  id: string; email: string; fullName: string; status: string
  roleCode: string; registrationDate: string; lastLogin?: string
}

export interface UserDetailResponse extends UserSummaryResponse {
  bio?: string; avatar?: string; avatarUrl?: string; postCount: number
  certificationCount: number; sessions: unknown[]
}

export const adminApi = {
  // Users
  listUsers: (params?: Record<string, unknown>) =>
    apiClient.get<PageDto<UserSummaryResponse>>('/api/v1/admin/users', { params }).then(r => r.data),
  getUserById: (id: string) =>
    apiClient.get<UserDetailResponse>(`/api/v1/admin/users/${id}`).then(r => r.data),
  updateUser: (id: string, data: unknown) =>
    apiClient.put<UserDetailResponse>(`/api/v1/admin/users/${id}`, data).then(r => r.data),
  deleteUser: (id: string) => apiClient.delete(`/api/v1/admin/users/${id}`),
  activateUser: (id: string) => apiClient.patch(`/api/v1/admin/users/${id}/activate`),
  deactivateUser: (id: string) => apiClient.patch(`/api/v1/admin/users/${id}/deactivate`),
  bulkActivate: (userIds: string[]) => apiClient.post('/api/v1/admin/users/bulk/activate', { userIds }).then(r => r.data),
  bulkDeactivate: (userIds: string[]) => apiClient.post('/api/v1/admin/users/bulk/deactivate', { userIds }).then(r => r.data),
  getActiveSessions: (userId: string) =>
    apiClient.get(`/api/v1/admin/users/${userId}/sessions/active`).then(r => r.data),
  forceLogoutAllSessions: (userId: string) =>
    apiClient.delete(`/api/v1/admin/users/${userId}/sessions`).then(r => r.data),
  forceLogoutSession: (userId: string, sessionId: string) =>
    apiClient.delete(`/api/v1/admin/users/${userId}/sessions/${sessionId}`),
}
