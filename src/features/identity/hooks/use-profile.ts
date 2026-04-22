"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as profileApi from "../api/profile";
import type { UpdateProfileInput } from "../schemas/profile";
import type { ProfileResponse } from "../types/profile";

export const PROFILE_QUERY_KEY = ["identity", "profile", "me"] as const;

export function useMyProfile(options?: { enabled?: boolean }) {
  return useQuery<ProfileResponse>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: profileApi.getMyProfile,
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation<ProfileResponse, Error, UpdateProfileInput>({
    mutationFn: profileApi.updateMyProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation<{ avatarUrl: string }, Error, File>({
    mutationFn: profileApi.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
    },
  });
}
