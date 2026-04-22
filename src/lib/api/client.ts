import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { clientEnv } from "@/config/env";

import { tokenStore } from "./token-store";
import { ApiError, type ApiResponse, type ProblemDetail } from "./types";

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _skipAuth?: boolean;
  _skipUnwrap?: boolean;
}

function isApiResponse<T>(body: unknown): body is ApiResponse<T> {
  return (
    typeof body === "object" &&
    body !== null &&
    "data" in body &&
    "metadata" in body &&
    typeof (body as { metadata?: unknown }).metadata === "object"
  );
}

function toProblemDetail(error: AxiosError): ProblemDetail {
  const body = error.response?.data as Partial<ProblemDetail> | undefined;
  if (body && typeof body === "object" && "title" in body && "status" in body) {
    return body as ProblemDetail;
  }
  return {
    title: error.response?.statusText ?? "Network error",
    status: error.response?.status ?? 0,
    detail: error.message,
  };
}

export const api: AxiosInstance = axios.create({
  baseURL: clientEnv.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const typed = config as RetryableConfig;
  if (!typed._skipAuth) {
    const token = tokenStore.get();
    if (token) {
      typed.headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return typed;
});

let refreshInflight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInflight) return refreshInflight;

  refreshInflight = (async () => {
    try {
      const response = await axios.post<ApiResponse<{ accessToken: string }>>(
        "/api/v1/auth/refresh",
        {},
        {
          baseURL: clientEnv.NEXT_PUBLIC_API_BASE_URL,
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );
      const next = response.data.data.accessToken;
      tokenStore.set(next);
      return next;
    } catch {
      tokenStore.clear();
      return null;
    } finally {
      refreshInflight = null;
    }
  })();

  return refreshInflight;
}

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as RetryableConfig;
    if (config._skipUnwrap) return response;
    if (response.status === 204) return response;
    if (isApiResponse(response.data)) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    if (error.response?.status === 401 && config && !config._retry && !config._skipAuth) {
      config._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        config.headers.set("Authorization", `Bearer ${newToken}`);
        return api.request(config);
      }
    }

    throw new ApiError(toProblemDetail(error));
  },
);

export type { ApiResponse, ProblemDetail } from "./types";
