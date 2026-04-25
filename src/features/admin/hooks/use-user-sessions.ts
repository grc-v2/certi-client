"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as usersApi from "../api/admin-users";
import type { UserSession } from "../types/user";

export const USER_SESSION_QUERY_KEYS = {
  all: ["admin", "user-sessions"] as const,
  list: (userId: number) => [...USER_SESSION_QUERY_KEYS.all, userId] as const,
};

export function useUserSessions(userId: number | undefined) {
  return useQuery<UserSession[]>({
    queryKey: USER_SESSION_QUERY_KEYS.list(userId ?? 0),
    queryFn: () => usersApi.getActiveSessions(userId as number),
    enabled: typeof userId === "number" && userId > 0,
    staleTime: 15_000,
  });
}

export function useForceLogoutSession() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { userId: number; sessionId: string }>({
    mutationFn: ({ userId, sessionId }) => usersApi.forceLogoutSession(userId, sessionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_SESSION_QUERY_KEYS.list(variables.userId) });
    },
  });
}

export function useForceLogoutAllSessions() {
  const queryClient = useQueryClient();
  return useMutation<{ count: number }, Error, number>({
    mutationFn: (userId) => usersApi.forceLogoutAllSessions(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: USER_SESSION_QUERY_KEYS.list(userId) });
    },
  });
}
