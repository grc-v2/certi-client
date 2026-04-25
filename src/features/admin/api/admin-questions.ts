import { api } from "@/lib/api";
import type { PageResponse } from "@/lib/api";

import type {
  AdminQuestionDetail,
  AdminQuestionSearchParams,
  AdminQuestionSummary,
  AdminQuestionUpsertInput,
} from "../types/question";

const BASE = "/api/v1/admin/questions";

export async function listAdminQuestions(
  params: AdminQuestionSearchParams = {},
): Promise<PageResponse<AdminQuestionSummary>> {
  const cleaned: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    cleaned[k] = v as string | number;
  }
  const { data } = await api.get<PageResponse<AdminQuestionSummary>>(BASE, { params: cleaned });
  return data;
}

export async function getAdminQuestion(id: number): Promise<AdminQuestionDetail> {
  const { data } = await api.get<AdminQuestionDetail>(`${BASE}/${id}`);
  return data;
}

export async function createQuestion(
  payload: AdminQuestionUpsertInput,
): Promise<AdminQuestionDetail> {
  const { data } = await api.post<AdminQuestionDetail>(BASE, payload);
  return data;
}

export async function updateQuestion(
  id: number,
  payload: AdminQuestionUpsertInput,
): Promise<AdminQuestionDetail> {
  const { data } = await api.put<AdminQuestionDetail>(`${BASE}/${id}`, payload);
  return data;
}

export async function updateQuestionStatus(
  id: number,
  status: string,
): Promise<AdminQuestionDetail> {
  const { data } = await api.patch<AdminQuestionDetail>(`${BASE}/${id}/status`, null, {
    params: { status },
  });
  return data;
}

export async function deleteQuestion(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}
