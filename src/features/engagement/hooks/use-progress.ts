"use client";

import { useQuery } from "@tanstack/react-query";

import * as progressApi from "../api/progress";
import type { ActivityFeedParams } from "../api/progress";
import type { ActivityFeedItem, DashboardResponse, StreakResponse } from "../types/progress";

export const PROGRESS_QUERY_KEYS = {
  all: ["engagement", "progress"] as const,
  dashboard: (certificationId: number) =>
    [...PROGRESS_QUERY_KEYS.all, "dashboard", certificationId] as const,
  streaks: (certificationId: number) =>
    [...PROGRESS_QUERY_KEYS.all, "streaks", certificationId] as const,
  activityFeed: (params: ActivityFeedParams) =>
    [...PROGRESS_QUERY_KEYS.all, "activity-feed", params] as const,
};

export function useDashboard(certificationId: number | undefined) {
  return useQuery<DashboardResponse>({
    queryKey: PROGRESS_QUERY_KEYS.dashboard(certificationId ?? 0),
    queryFn: () => progressApi.getDashboard(certificationId as number),
    enabled: typeof certificationId === "number" && certificationId > 0,
    staleTime: 30_000,
  });
}

export function useStreaks(certificationId: number | undefined) {
  return useQuery<StreakResponse[]>({
    queryKey: PROGRESS_QUERY_KEYS.streaks(certificationId ?? 0),
    queryFn: () => progressApi.getStreaks(certificationId as number),
    enabled: typeof certificationId === "number" && certificationId > 0,
    staleTime: 30_000,
  });
}

export function useActivityFeed(params: ActivityFeedParams | undefined) {
  return useQuery<ActivityFeedItem[]>({
    queryKey: PROGRESS_QUERY_KEYS.activityFeed(params ?? { certificationId: 0 }),
    queryFn: () => progressApi.getActivityFeed(params as ActivityFeedParams),
    enabled: Boolean(params && params.certificationId > 0),
    staleTime: 30_000,
  });
}
