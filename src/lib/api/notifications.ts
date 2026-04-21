import apiClient from './client'

export interface NotificationResponse {
  id: string; type: string; title: string; message: string
  read: boolean; createdAt: string; relatedEntityId?: string
}

export interface NotificationPreference {
  type: string; emailEnabled: boolean; pushEnabled: boolean; inAppEnabled: boolean
}

export const notificationsApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/api/v1/notifications', { params }).then(r => r.data),
  markAsRead: (id: string) => apiClient.patch(`/api/v1/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/api/v1/notifications/read-all'),
  getPreferences: () => apiClient.get<NotificationPreference[]>('/api/v1/notifications/preferences').then(r => r.data),
  updatePreferences: (data: unknown) => apiClient.put('/api/v1/notifications/preferences', data).then(r => r.data),
  registerPushToken: (data: unknown) => apiClient.post('/api/v1/notifications/push/register', data),
  // Admin
  broadcast: (data: unknown) => apiClient.post('/api/v1/admin/notifications/broadcast', data).then(r => r.data),
  listTemplates: () => apiClient.get('/api/v1/admin/notifications/templates').then(r => r.data),
  updateTemplate: (key: string, data: unknown) => apiClient.put(`/api/v1/admin/notifications/templates/${key}`, data).then(r => r.data),
}
