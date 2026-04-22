"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { tokenStore } from "@/lib/api";
import { authStore } from "@/lib/auth/user-store";

import * as authApi from "../api/auth";
import type { LoginPayload } from "../api/auth";
import type { CurrentUserResponse, LoginResponse } from "../types/auth";

export const AUTH_QUERY_KEY = ["auth", "current-user"] as const;

export function useCurrentUser(options?: { enabled?: boolean }) {
  return useQuery<CurrentUserResponse>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.getCurrentUser,
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      tokenStore.set(data.tokens.accessToken);
      authStore.setSession(data.user, Array.from(data.permissions ?? []));
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}

export function useRegister() {
  return useMutation({ mutationFn: authApi.register });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: authApi.logout,
    onSettled: () => {
      tokenStore.clear();
      authStore.clear();
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation<void, Error, string>({
    mutationFn: (email) => authApi.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation<void, Error, { token: string; newPassword: string }>({
    mutationFn: ({ token, newPassword }) => authApi.resetPassword(token, newPassword),
  });
}

export function useVerifyEmail() {
  return useMutation<void, Error, string>({
    mutationFn: (token) => authApi.verifyEmail(token),
  });
}
