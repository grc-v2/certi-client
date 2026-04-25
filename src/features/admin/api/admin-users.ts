import { api } from "@/lib/api";
import type { PageResponse } from "@/lib/api";

import type {
  BulkOperationResult,
  UpdateUserInput,
  UserDetail,
  UserFilter,
  UserSession,
  UserSummary,
} from "../types/user";

const BASE = "/api/v1/admin/users";

export async function listUsers(filter: UserFilter = {}): Promise<PageResponse<UserSummary>> {
  const { data } = await api.get<PageResponse<UserSummary>>(BASE, { params: filter });
  return data;
}

export async function getUser(id: number): Promise<UserDetail> {
  const { data } = await api.get<UserDetail>(`${BASE}/${id}`);
  return data;
}

export async function updateUser(id: number, payload: UpdateUserInput): Promise<UserDetail> {
  const { data } = await api.put<UserDetail>(`${BASE}/${id}`, payload);
  return data;
}

export async function activateUser(id: number): Promise<void> {
  await api.patch(`${BASE}/${id}/activate`);
}

export async function deactivateUser(id: number): Promise<void> {
  await api.patch(`${BASE}/${id}/deactivate`);
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}

export async function bulkActivate(userIds: number[]): Promise<BulkOperationResult> {
  const { data } = await api.post<BulkOperationResult>(`${BASE}/bulk/activate`, { userIds });
  return data;
}

export async function bulkDeactivate(userIds: number[]): Promise<BulkOperationResult> {
  const { data } = await api.post<BulkOperationResult>(`${BASE}/bulk/deactivate`, { userIds });
  return data;
}

export async function getActiveSessions(id: number): Promise<UserSession[]> {
  const { data } = await api.get<UserSession[]>(`${BASE}/${id}/sessions/active`);
  return data;
}

export async function forceLogoutSession(userId: number, sessionId: string): Promise<void> {
  await api.delete(`${BASE}/${userId}/sessions/${sessionId}`);
}

export async function forceLogoutAllSessions(userId: number): Promise<{ count: number }> {
  const { data } = await api.delete<{ count: number }>(`${BASE}/${userId}/sessions`);
  return data;
}
