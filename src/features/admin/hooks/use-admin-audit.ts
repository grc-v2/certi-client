"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { PageResponse } from "@/lib/api";

import * as auditApi from "../api/admin-audit";
import type { AuditFilter, AuditLogEntry } from "../types/audit";

export const ADMIN_AUDIT_QUERY_KEYS = {
  all: ["admin", "audit"] as const,
  list: (filter: AuditFilter) => [...ADMIN_AUDIT_QUERY_KEYS.all, "list", filter] as const,
  detail: (id: number) => [...ADMIN_AUDIT_QUERY_KEYS.all, "detail", id] as const,
};

export function useAdminAudit(filter: AuditFilter) {
  return useQuery<PageResponse<AuditLogEntry>>({
    queryKey: ADMIN_AUDIT_QUERY_KEYS.list(filter),
    queryFn: () => auditApi.listAudit(filter),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useAdminAuditEntry(id: number | undefined) {
  return useQuery<AuditLogEntry>({
    queryKey: ADMIN_AUDIT_QUERY_KEYS.detail(id ?? 0),
    queryFn: () => auditApi.getAuditEntry(id as number),
    enabled: typeof id === "number" && id > 0,
    staleTime: 60_000,
  });
}
