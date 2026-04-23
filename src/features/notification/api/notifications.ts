import { api } from "@/lib/api";

import type {
  MarkAllReadResponse,
  NotificationDto,
  NotificationListParams,
  NotificationPage,
  NotificationPreferenceDto,
  UnreadCountResponse,
  UpdatePreferencesPayload,
} from "../types/notification";

export async function listNotifications(
  params: NotificationListParams = {},
): Promise<NotificationPage> {
  const { data } = await api.get<NotificationPage>("/api/v1/notifications", { params });
  return data;
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const { data } = await api.get<UnreadCountResponse>("/api/v1/notifications/unread-count");
  return data;
}

export async function markAsRead(id: number): Promise<void> {
  await api.patch(`/api/v1/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<MarkAllReadResponse> {
  const { data } = await api.patch<MarkAllReadResponse>("/api/v1/notifications/read-all");
  return data;
}

export async function dismissNotification(id: number): Promise<void> {
  await api.delete(`/api/v1/notifications/${id}`);
}

export async function getPreferences(): Promise<NotificationPreferenceDto> {
  const { data } = await api.get<NotificationPreferenceDto>("/api/v1/notification-preferences");
  return data;
}

export async function updatePreferences(
  payload: UpdatePreferencesPayload,
): Promise<NotificationPreferenceDto> {
  const { data } = await api.put<NotificationPreferenceDto>(
    "/api/v1/notification-preferences",
    payload,
  );
  return data;
}

export type { NotificationDto, NotificationListParams };
