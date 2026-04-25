"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

import { useAdminCertifications } from "../hooks/use-admin-certifications";
import { CERTIFICATION_STATUSES } from "../types/certification";

import { CertificationStatusBadge } from "./certification-status-badge";

const PAGE_SIZE = 20;

function parsePage(raw: string | null): number {
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export function AdminCertificationsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const keyword = searchParams.get("keyword") ?? "";
  const provider = searchParams.get("provider") ?? "";
  const level = searchParams.get("level") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = parsePage(searchParams.get("page"));

  const [keywordDraft, setKeywordDraft] = useState(keyword);
  const [providerDraft, setProviderDraft] = useState(provider);

  const params = useMemo(
    () => ({
      keyword: keyword || undefined,
      provider: provider || undefined,
      level: level || undefined,
      status: status || undefined,
      page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      sortDirection: "DESC" as const,
    }),
    [keyword, provider, level, status, page],
  );

  const { data, isLoading, isFetching, error } = useAdminCertifications(params);

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
        router.replace(qs ? `/admin/certifications?${qs}` : "/admin/certifications");
      });
    },
    [router, searchParams],
  );

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParams({ keyword: keywordDraft.trim(), provider: providerDraft.trim() });
  }

  function handleReset() {
    setKeywordDraft("");
    setProviderDraft("");
    startTransition(() => router.replace("/admin/certifications"));
  }

  const certifications = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const apiMessage =
    error instanceof ApiError
      ? (error.problem.detail ?? error.problem.title)
      : error instanceof Error
        ? error.message
        : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chứng chỉ</h1>
          <p className="text-muted-foreground text-sm">
            Quản lý danh sách chứng chỉ, trạng thái xuất bản và cấu hình domain.
          </p>
        </div>
        <Link href="/admin/certifications/new" className={buttonVariants()}>
          Tạo chứng chỉ
        </Link>
      </header>

      <form
        onSubmit={handleSearch}
        className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1 lg:col-span-2">
            <label className="text-muted-foreground text-xs font-medium" htmlFor="cert-keyword">
              Từ khoá
            </label>
            <Input
              id="cert-keyword"
              value={keywordDraft}
              onChange={(e) => setKeywordDraft(e.target.value)}
              placeholder="Tên chứng chỉ, mã..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-xs font-medium" htmlFor="cert-provider">
              Nhà cung cấp
            </label>
            <Input
              id="cert-provider"
              value={providerDraft}
              onChange={(e) => setProviderDraft(e.target.value)}
              placeholder="AWS, Azure..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-xs font-medium" htmlFor="cert-status">
              Trạng thái
            </label>
            <Select
              id="cert-status"
              value={status}
              onChange={(e) => updateParams({ status: e.target.value })}
            >
              <option value="">Tất cả</option>
              {CERTIFICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex items-end gap-2 lg:justify-end">
          <Button type="submit" disabled={isFetching}>
            {isFetching ? "Đang tìm..." : "Tìm kiếm"}
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
              <TableHead>Chứng chỉ</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Nhà cung cấp</TableHead>
              <TableHead>Cấp độ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-10 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : certifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-10 text-center">
                  Không có chứng chỉ phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              certifications.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{cert.name}</span>
                      {cert.tagline ? (
                        <span className="text-muted-foreground max-w-md truncate text-xs">
                          {cert.tagline}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{cert.code}</TableCell>
                  <TableCell>{cert.provider ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {cert.level ?? "—"}
                  </TableCell>
                  <TableCell>
                    <CertificationStatusBadge status={cert.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {cert.price ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/certifications/${cert.slug}`}
                      className="text-primary text-xs font-medium hover:underline"
                    >
                      Chỉnh sửa
                    </Link>
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
