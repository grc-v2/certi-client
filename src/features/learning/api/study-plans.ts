import { api } from "@/lib/api";

import type { CreateStudyPlanInput } from "../schemas/study-plan";
import type { StudyPlanDetail, StudyPlanListResponse } from "../types/study-plan";

export interface StudyPlanListParams {
  page?: number;
  size?: number;
  status?: string;
}

export interface CreateStudyPlanPayload {
  certificationId: number;
  examDate: string;
  dailyStudyMinutes: number;
  studyDaysPerWeek?: number;
  preferredStudyDays?: string[];
  experienceLevel: string;
  domainProficiencies?: Record<number, string>;
}

export async function listMyStudyPlans(
  params: StudyPlanListParams = {},
): Promise<StudyPlanListResponse> {
  const { data } = await api.get<StudyPlanListResponse>("/api/v1/study-plans", { params });
  return data;
}

export async function getStudyPlan(planId: number): Promise<StudyPlanDetail> {
  const { data } = await api.get<StudyPlanDetail>(`/api/v1/study-plans/${planId}`);
  return data;
}

export async function getActiveStudyPlan(certificationId: number): Promise<StudyPlanDetail> {
  const { data } = await api.get<StudyPlanDetail>("/api/v1/study-plans/active", {
    params: { certificationId },
  });
  return data;
}

export async function createStudyPlan(payload: CreateStudyPlanPayload): Promise<StudyPlanDetail> {
  const { data } = await api.post<StudyPlanDetail>("/api/v1/study-plans", payload);
  return data;
}

export function toCreatePayload(input: CreateStudyPlanInput): CreateStudyPlanPayload {
  return {
    certificationId: input.certificationId,
    examDate: input.examDate,
    dailyStudyMinutes: input.dailyStudyMinutes,
    studyDaysPerWeek: input.studyDaysPerWeek,
    preferredStudyDays:
      input.preferredStudyDays && input.preferredStudyDays.length > 0
        ? input.preferredStudyDays
        : undefined,
    experienceLevel: input.experienceLevel,
  };
}
