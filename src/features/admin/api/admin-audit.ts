import { api } from "@/lib/api";
import type { PageResponse } from "@/lib/api";

import type { AuditFilter, AuditLogEntry } from "../types/audit";

const BASE = "/api/v1/admin/audit";

export async function listAudit(filter: AuditFilter = {}): Promise<PageResponse<AuditLogEntry>> {
  const { data } = await api.get<PageResponse<AuditLogEntry>>(BASE, { params: filter });
  return data;
}

export async function getAuditEntry(id: number): Promise<AuditLogEntry> {
  const { data } = await api.get<AuditLogEntry>(`${BASE}/${id}`);
  return data;
}
