"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as tasksApi from "../api/study-plan-tasks";
import type { CompleteTaskPayload } from "../api/study-plan-tasks";
import type { DailyTaskDetail } from "../types/study-plan";

import { STUDY_PLAN_QUERY_KEYS } from "./use-study-plans";

export const TASK_QUERY_KEYS = {
  detail: (planId: number, taskId: number) =>
    [...STUDY_PLAN_QUERY_KEYS.all, "task", planId, taskId] as const,
};

export function useTaskDetail(planId: number | undefined, taskId: number | undefined) {
  return useQuery<DailyTaskDetail>({
    queryKey: TASK_QUERY_KEYS.detail(planId ?? 0, taskId ?? 0),
    queryFn: () => tasksApi.getTaskDetail(planId as number, taskId as number),
    enabled: typeof planId === "number" && planId > 0 && typeof taskId === "number" && taskId > 0,
    staleTime: 30_000,
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, CompleteTaskPayload>({
    mutationFn: tasksApi.completeTask,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: STUDY_PLAN_QUERY_KEYS.detail(variables.planId),
      });
      queryClient.invalidateQueries({
        queryKey: TASK_QUERY_KEYS.detail(variables.planId, variables.taskId),
      });
      queryClient.invalidateQueries({ queryKey: STUDY_PLAN_QUERY_KEYS.all });
    },
  });
}
