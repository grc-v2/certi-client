"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/features/learning/components/pagination-controls";
import { ApiError } from "@/lib/api";

import { useAdminAudit } from "../hooks/use-admin-audit";
import type { AuditFilter } from "../types/audit";

const PAGE_SIZE = 20;

function parsePage(raw: string | null): number {
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function parseNumber(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function statusBadgeVariant(status: number | null | undefined) {
  if (!status) return "muted" as const;
  if (status >= 500) return "destructive" as const;
  if (status >= 400) return "warning" as const;
  if (status >= 200 && status < 300) return "success" as const;
  return "muted" as const;
}

export function AdminAuditView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const actorIdParam = searchParams.get("actorId") ?? "";
  const resourceType = searchParams.get("resourceType") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const page = parsePage(searchParams.get("page"));

  const [actorDraft, setActorDraft] = useState(actorIdParam);
  const [resourceDraft, setResourceDraft] = useState(resourceType);
  const [fromDraft, setFromDraft] = useState(from);
  const [toDraft, setToDraft] = useState(to);

  const filter = useMemo<AuditFilter>(
    () => ({
      actorId: parseNumber(actorIdParam),
      resourceType: resourceType || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      size: PAGE_SIZE,
    }),
    [actorIdParam, resourceType, from, to, page],
  );

  const { data, isLoading, isFetching, error } = useAdminAudit(filter);
  const entries = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value && value.length > 0) next.set(key, value);
        else next.delete(key);
      }
      if (resetPage) next.delete("page");
      startTransition(() => {
        const qs = next.toString();
        router.replace(qs ? `/admin/audit?${qs}` : "/admin/audit");
      });
    },
    [router, searchParams],
  );

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParams({
      actorId: actorDraft.trim(),
      resourceType: resourceDraft.trim(),
      from: fromDraft ? new Date(fromDraft).toISOString() : "",
      to: toDraft ? new Date(toDraft).toISOString() : "",
    });
  }

  function handleReset() {
    setActorDraft("");
    setResourceDraft("");
    setFromDraft("");
    setToDraft("");
    startTransition(() => router.replace("/admin/audit"));
  }

  const apiMessage =
    error instanceof ApiError
      ? (error.problem.detail ?? error.problem.title)
      : error instanceof Error
        ? error.message
        : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Nhật ký hoạt động</h1>
        <p className="text-muted-foreground text-sm">
          Ghi lại mọi thao tác của quản trị viên trên hệ thống.
        </p>
      </header>

      <form
        onSubmit={handleSearch}
        className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-xs font-medium" htmlFor="audit-actor">
              Actor ID
            </label>
            <Input
              id="audit-actor"
              value={actorDraft}
              onChange={(e) => setActorDraft(e.target.value)}
              placeholder="123"
              inputMode="numeric"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-xs font-medium" htmlFor="audit-resource">
              Loại tài nguyên
            </label>
            <Input
              id="audit-resource"
              value={resourceDraft}
              onChange={(e) => setResourceDraft(e.target.value)}
              placeholder="User, Certification..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-xs font-medium" htmlFor="audit-from">
              Từ
            </label>
            <Input
              id="audit-from"
              type="datetime-local"
              value={fromDraft}
              onChange={(e) => setFromDraft(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-xs font-medium" htmlFor="audit-to">
              Đến
            </label>
            <Input
              id="audit-to"
              type="datetime-local"
              value={toDraft}
              onChange={(e) => setToDraft(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-end gap-2 lg:justify-end">
          <Button type="submit" disabled={isFetching}>
            {isFetching ? "Đang tìm..." : "Lọc"}
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            Đặt lại
          </Button>
        </div>
      </form>

      {apiMessage ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {apiMessage}
        </div>
      ) : null}

      <div className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời điểm</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Tài nguyên</TableHead>
              <TableHead>HTTP</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Thời lượng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground py-10 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground py-10 text-center">
                  Chưa có bản ghi phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-xs">
                    {formatDateTime(entry.occurredAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{entry.actorUsername ?? "—"}</span>
                      <span className="text-muted-foreground text-xs">
                        {entry.actorId ? `#${entry.actorId}` : "anonymous"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{entry.action}</TableCell>
                  <TableCell>
                    {entry.resourceType ? (
                      <div className="flex flex-col">
                        <span className="text-sm">{entry.resourceType}</span>
                        {entry.resourceId ? (
                          <span className="text-muted-foreground text-xs">#{entry.resourceId}</span>
                        ) : null}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {entry.httpMethod} {entry.httpPath}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(entry.statusCode)}>
                      {entry.statusCode ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{entry.ipAddress ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {entry.durationMs != null ? `${entry.durationMs} ms` : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => updateParams({ page: String(p) }, false)}
        />
      </div>
    </div>
  );
}
