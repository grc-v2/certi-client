import { api } from "@/lib/api";

import type {
  CurrentUserResponse,
  LoginResponse,
  OAuthAuthorizeResponse,
  RegisterResponse,
} from "../types/auth";

export interface LoginPayload {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  fullName: string;
  phone?: string;
  acceptTerms: true;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/v1/auth/login", payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/api/v1/auth/register", payload);
  return data;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const { data } = await api.get<CurrentUserResponse>("/api/v1/auth/current");
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/api/v1/auth/logout");
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/api/v1/auth/forgot-password", { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post("/api/v1/auth/reset-password", { token, newPassword });
}

export async function verifyEmail(token: string): Promise<void> {
  await api.get("/api/v1/auth/verify-email", { params: { token } });
}

export async function getOauthAuthorizeUrl(
  provider: "google" | "github",
  redirectUri: string,
): Promise<OAuthAuthorizeResponse> {
  const { data } = await api.get<OAuthAuthorizeResponse>(
    `/api/v1/auth/oauth/authorize/${provider}`,
    { params: { redirectUri } },
  );
  return data;
}
