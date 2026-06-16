import apiClient from './client'
import type { PageDto } from './certifications'

export interface NotificationResponse {
  id: string; type: string; title: string; message: string
  read: boolean; createdAt: string; relatedEntityId?: string
}

export interface NotificationPreference {
  type: string; emailEnabled: boolean; pushEnabled: boolean; inAppEnabled: boolean
}

export interface NotificationListParams {
  page?: number
  size?: number
  unreadOnly?: boolean
  type?: string
}

export type NotificationPreferenceRequest = NotificationPreference[]

export interface PushTokenRequest {
  token: string
  platform?: 'web' | 'ios' | 'android'
  deviceId?: string
}

export interface BroadcastNotificationRequest {
  title: string
  message: string
  type: string
  targetRole?: string
}

export interface NotificationTemplateResponse {
  key: string
  name: string
  subject: string
  body?: string
  type: string
  emailEnabled?: boolean
  pushEnabled?: boolean
  inAppEnabled?: boolean
}

export interface NotificationTemplateRequest {
  subject: string
  body: string
}

interface NotificationPage {
  content: NotificationResponse[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
  last: boolean
  first: boolean
  empty: boolean
}

export const notificationsApi = {
  getAll: (params?: NotificationListParams) =>
    apiClient.get<NotificationPage>('/api/v1/notifications', {
      params: {
        unreadOnly: params?.unreadOnly ?? false,
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    }).then(r => r.data),
  markAsRead: (id: string | number) =>
    apiClient.patch(`/api/v1/notifications/${id}/read`).then(r => r.data),
  markAllAsRead: () =>
    apiClient.post('/api/v1/notifications/read-all').then(r => r.data),
  // Preferences / push tokens are not yet backed by the API.
  getPreferences: () => Promise.resolve([] as NotificationPreference[]),
  updatePreferences: (_data: NotificationPreferenceRequest) => Promise.resolve([] as NotificationPreference[]),
  registerPushToken: (_data: PushTokenRequest) => Promise.resolve(),
  // Admin broadcast — fans out one in-app notification per recipient asynchronously.
  // Recipients are resolved by the identity module via shared domain events.
  broadcast: (data: BroadcastNotificationRequest) =>
    apiClient.post('/api/v1/admin/notifications/broadcast', {
      title: data.title,
      message: data.message,
      type: data.type,
      targetRole: data.targetRole || undefined,
    }).then(r => r.data),
  // Templates are not yet backed by the API (no consumer in the notification pipeline yet).
  listTemplates: () => Promise.resolve([] as NotificationTemplateResponse[]),
  updateTemplate: (_key: string, _data: NotificationTemplateRequest) => Promise.resolve({} as any),
}


