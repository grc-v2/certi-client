"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PageResponse } from "@/lib/api";

import * as usersApi from "../api/admin-users";
import type {
  BulkOperationResult,
  UpdateUserInput,
  UserDetail,
  UserFilter,
  UserSummary,
} from "../types/user";

export const ADMIN_USER_QUERY_KEYS = {
  all: ["admin", "users"] as const,
  list: (filter: UserFilter) => [...ADMIN_USER_QUERY_KEYS.all, "list", filter] as const,
  detail: (id: number) => [...ADMIN_USER_QUERY_KEYS.all, "detail", id] as const,
};

export function useAdminUsers(filter: UserFilter) {
  return useQuery<PageResponse<UserSummary>>({
    queryKey: ADMIN_USER_QUERY_KEYS.list(filter),
    queryFn: () => usersApi.listUsers(filter),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAdminUser(id: number | undefined) {
  return useQuery<UserDetail>({
    queryKey: ADMIN_USER_QUERY_KEYS.detail(id ?? 0),
    queryFn: () => usersApi.getUser(id as number),
    enabled: typeof id === "number" && id > 0,
    staleTime: 30_000,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation<UserDetail, Error, { id: number; payload: UpdateUserInput }>({
    mutationFn: ({ id, payload }) => usersApi.updateUser(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(ADMIN_USER_QUERY_KEYS.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.all });
    },
  });
}

export function useActivateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => usersApi.activateUser(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.all });
    },
  });
}

export function useDeactivateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => usersApi.deactivateUser(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.all });
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.all });
    },
  });
}

export function useBulkActivateUsers() {
  const queryClient = useQueryClient();
  return useMutation<BulkOperationResult, Error, number[]>({
    mutationFn: usersApi.bulkActivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.all });
    },
  });
}

export function useBulkDeactivateUsers() {
  const queryClient = useQueryClient();
  return useMutation<BulkOperationResult, Error, number[]>({
    mutationFn: usersApi.bulkDeactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USER_QUERY_KEYS.all });
    },
  });
}
