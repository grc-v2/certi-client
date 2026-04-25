"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PageResponse } from "@/lib/api";

import * as questionApi from "../api/admin-questions";
import type {
  AdminQuestionDetail,
  AdminQuestionSearchParams,
  AdminQuestionSummary,
  AdminQuestionUpsertInput,
} from "../types/question";

export const ADMIN_QUESTION_QUERY_KEYS = {
  all: ["admin", "questions"] as const,
  list: (params: AdminQuestionSearchParams) =>
    [...ADMIN_QUESTION_QUERY_KEYS.all, "list", params] as const,
  detail: (id: number | undefined) =>
    [...ADMIN_QUESTION_QUERY_KEYS.all, "detail", id ?? 0] as const,
};

export function useAdminQuestions(params: AdminQuestionSearchParams) {
  return useQuery<PageResponse<AdminQuestionSummary>>({
    queryKey: ADMIN_QUESTION_QUERY_KEYS.list(params),
    queryFn: () => questionApi.listAdminQuestions(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useAdminQuestion(id: number | undefined) {
  return useQuery<AdminQuestionDetail>({
    queryKey: ADMIN_QUESTION_QUERY_KEYS.detail(id),
    queryFn: () => questionApi.getAdminQuestion(id as number),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation<AdminQuestionDetail, Error, AdminQuestionUpsertInput>({
    mutationFn: questionApi.createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUESTION_QUERY_KEYS.all });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation<AdminQuestionDetail, Error, { id: number; payload: AdminQuestionUpsertInput }>(
    {
      mutationFn: ({ id, payload }) => questionApi.updateQuestion(id, payload),
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ADMIN_QUESTION_QUERY_KEYS.all });
        queryClient.invalidateQueries({
          queryKey: ADMIN_QUESTION_QUERY_KEYS.detail(variables.id),
        });
      },
    },
  );
}

export function useUpdateQuestionStatus() {
  const queryClient = useQueryClient();
  return useMutation<AdminQuestionDetail, Error, { id: number; status: string }>({
    mutationFn: ({ id, status }) => questionApi.updateQuestionStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUESTION_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUESTION_QUERY_KEYS.detail(variables.id),
      });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: questionApi.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUESTION_QUERY_KEYS.all });
    },
  });
}
