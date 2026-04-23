"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as notifApi from "../api/notifications";
import type { NotificationListParams } from "../api/notifications";
import type {
  MarkAllReadResponse,
  NotificationPage,
  NotificationPreferenceDto,
  UnreadCountResponse,
  UpdatePreferencesPayload,
} from "../types/notification";

export const NOTIFICATION_QUERY_KEYS = {
  all: ["notifications"] as const,
  list: (params: NotificationListParams) =>
    [...NOTIFICATION_QUERY_KEYS.all, "list", params] as const,
  unreadCount: () => [...NOTIFICATION_QUERY_KEYS.all, "unread-count"] as const,
  preferences: () => [...NOTIFICATION_QUERY_KEYS.all, "preferences"] as const,
};

const UNREAD_POLL_MS = 60_000;

export function useNotifications(params: NotificationListParams = {}) {
  return useQuery<NotificationPage>({
    queryKey: NOTIFICATION_QUERY_KEYS.list(params),
    queryFn: () => notifApi.listNotifications(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useUnreadCount() {
  return useQuery<UnreadCountResponse>({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
    queryFn: notifApi.getUnreadCount,
    staleTime: UNREAD_POLL_MS,
    refetchInterval: UNREAD_POLL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: notifApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation<MarkAllReadResponse, Error, void>({
    mutationFn: notifApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}

export function useDismissNotification() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: notifApi.dismissNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery<NotificationPreferenceDto>({
    queryKey: NOTIFICATION_QUERY_KEYS.preferences(),
    queryFn: notifApi.getPreferences,
    staleTime: 60_000,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation<NotificationPreferenceDto, Error, UpdatePreferencesPayload>({
    mutationFn: notifApi.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.preferences() });
    },
  });
}
