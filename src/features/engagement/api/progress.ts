import { api } from "@/lib/api";

import type { ActivityFeedItem, DashboardResponse, StreakResponse } from "../types/progress";

export interface ActivityFeedParams {
  certificationId: number;
  page?: number;
  size?: number;
}

export async function getDashboard(certificationId: number): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>("/api/v1/progress/dashboard", {
    params: { certificationId },
  });
  return data;
}

export async function getStreaks(certificationId: number): Promise<StreakResponse[]> {
  const { data } = await api.get<StreakResponse[]>("/api/v1/progress/streaks", {
    params: { certificationId },
  });
  return data;
}

export async function getActivityFeed(params: ActivityFeedParams): Promise<ActivityFeedItem[]> {
  const { certificationId, page = 0, size = 20 } = params;
  const { data } = await api.get<ActivityFeedItem[]>("/api/v1/progress/activity-feed", {
    params: { certificationId, page, size },
  });
  return data;
}
