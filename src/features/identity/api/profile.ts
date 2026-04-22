import { api } from "@/lib/api";

import type { UpdateProfileInput } from "../schemas/profile";
import type { ProfileResponse } from "../types/profile";

export async function getMyProfile(): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>("/api/v1/profile/me");
  return data;
}

export async function updateMyProfile(input: UpdateProfileInput): Promise<ProfileResponse> {
  const { data } = await api.put<ProfileResponse>("/api/v1/profile/me", input);
  return data;
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<{ avatarUrl: string }>("/api/v1/profile/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
