"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as planApi from "../api/study-plans";
import type { CreateStudyPlanPayload, StudyPlanListParams } from "../api/study-plans";
import type { StudyPlanDetail, StudyPlanListResponse } from "../types/study-plan";

export const STUDY_PLAN_QUERY_KEYS = {
  all: ["learning", "study-plans"] as const,
  list: (params: StudyPlanListParams) => [...STUDY_PLAN_QUERY_KEYS.all, "list", params] as const,
  detail: (planId: number) => [...STUDY_PLAN_QUERY_KEYS.all, "detail", planId] as const,
  active: (certificationId: number) =>
    [...STUDY_PLAN_QUERY_KEYS.all, "active", certificationId] as const,
};

export function useMyStudyPlans(params: StudyPlanListParams = {}) {
  return useQuery<StudyPlanListResponse>({
    queryKey: STUDY_PLAN_QUERY_KEYS.list(params),
    queryFn: () => planApi.listMyStudyPlans(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useStudyPlan(planId: number | undefined) {
  return useQuery<StudyPlanDetail>({
    queryKey: STUDY_PLAN_QUERY_KEYS.detail(planId ?? 0),
    queryFn: () => planApi.getStudyPlan(planId as number),
    enabled: typeof planId === "number" && planId > 0,
    staleTime: 30_000,
  });
}

export function useCreateStudyPlan() {
  const queryClient = useQueryClient();
  return useMutation<StudyPlanDetail, Error, CreateStudyPlanPayload>({
    mutationFn: planApi.createStudyPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDY_PLAN_QUERY_KEYS.all });
    },
  });
}
