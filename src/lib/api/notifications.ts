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

export const notificationsApi = {
  getAll: (params?: NotificationListParams) => {
    return Promise.resolve({
      content: [
        {
          id: 'notif-1',
          type: 'INFO',
          title: 'Chào mừng bạn đến với CertiMaster!',
          message: 'Hệ thống ôn thi chứng chỉ chuẩn quốc tế của bạn đã sẵn sàng. Hãy chọn một chứng chỉ và bắt đầu làm bài thi thử ngay!',
          read: false,
          createdAt: new Date().toISOString(),
        }
      ] as NotificationResponse[],
      totalElements: 1,
      totalPages: 1,
      pageNumber: 0,
      pageSize: 20,
      last: true,
      first: true,
      empty: false
    })
  },
  markAsRead: (id: string) => Promise.resolve(),
  markAllAsRead: () => Promise.resolve(),
  getPreferences: () => Promise.resolve([] as NotificationPreference[]),
  updatePreferences: (data: NotificationPreferenceRequest) => Promise.resolve([] as NotificationPreference[]),
  registerPushToken: (data: PushTokenRequest) => Promise.resolve(),
  // Admin
  broadcast: (data: BroadcastNotificationRequest) => Promise.resolve({} as any),
  listTemplates: () => Promise.resolve([] as NotificationTemplateResponse[]),
  updateTemplate: (key: string, data: NotificationTemplateRequest) => Promise.resolve({} as any),
}


