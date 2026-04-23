import { api } from "@/lib/api";

import type { DailyTaskDetail } from "../types/study-plan";

export interface CompleteTaskPayload {
  planId: number;
  taskId: number;
  actualMinutes: number;
}

export async function getTaskDetail(planId: number, taskId: number): Promise<DailyTaskDetail> {
  const { data } = await api.get<DailyTaskDetail>(`/api/v1/study-plans/${planId}/tasks/${taskId}`);
  return data;
}

export async function completeTask(payload: CompleteTaskPayload): Promise<void> {
  const { planId, taskId, actualMinutes } = payload;
  await api.put(`/api/v1/study-plans/${planId}/tasks/${taskId}/complete`, { actualMinutes });
}
