export interface AuditLogEntry {
  id: number;
  actorId?: number | null;
  actorUsername?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  httpMethod?: string | null;
  httpPath?: string | null;
  queryString?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  statusCode?: number | null;
  durationMs?: number | null;
  serviceName?: string | null;
  occurredAt: string;
}

export interface AuditFilter {
  actorId?: number;
  resourceType?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}
