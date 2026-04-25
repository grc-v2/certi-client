"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

import {
  useAdminUsers,
  useBulkActivateUsers,
  useBulkDeactivateUsers,
} from "../hooks/use-admin-users";
import type { UserFilter, UserStatus } from "../types/user";

import { UserStatusBadge } from "./user-status-badge";

const PAGE_SIZE = 20;
const STATUS_OPTIONS: { value: UserStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Ngưng hoạt động" },
  { value: "SUSPENDED", label: "Tạm khoá" },
  { value: "LOCKED", label: "Đã khoá" },
];

function parsePage(raw: string | null): number {
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function AdminUsersView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const search = searchParams.get("search") ?? "";
  const status = (searchParams.get("status") ?? "") as UserStatus | "";
  const roleCode = searchParams.get("roleCode") ?? "";
  const sort = searchParams.get("sort") ?? "registrationDate,DESC";
  const page = parsePage(searchParams.get("page"));

  const [searchDraft, setSearchDraft] = useState(search);
  const [roleDraft, setRoleDraft] = useState(roleCode);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const filter = useMemo<UserFilter>(
    () => ({
      search: search || undefined,
      status: status || undefined,
      roleCode: roleCode || undefined,
      sort,
      page,
      size: PAGE_SIZE,
    }),
    [search, status, roleCode, sort, page],
  );

  const { data, isLoading, isFetching, error } = useAdminUsers(filter);
  const bulkActivate = useBulkActivateUsers();
  const bulkDeactivate = useBulkDeactivateUsers();

  const users = data?.content ?? [];
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
        router.replace(qs ? `/admin/users?${qs}` : "/admin/users");
      });
      setSelectedIds(new Set());
    },
    [router, searchParams],
  );

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParams({ search: searchDraft.trim(), roleCode: roleDraft.trim() });
  }

  function handleReset() {
    setSearchDraft("");
    setRoleDraft("");
    startTransition(() => router.replace("/admin/users"));
    setSelectedIds(new Set());
  }

  function toggleAll(checked: boolean) {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(users.map((u) => u.id)));
  }

  function toggleOne(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function runBulk(action: "activate" | "deactivate") {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const mutation = action === "activate" ? bulkActivate : bulkDeactivate;
    try {
      const result = await mutation.mutateAsync(ids);
      const label = action === "activate" ? "kích hoạt" : "vô hiệu hoá";
      toast.success(
        `Đã ${label} ${result.successCount}/${ids.length} người dùng${
          result.failedCount > 0 ? ` · Lỗi: ${result.failedCount}` : ""
        }`,
      );
      setSelectedIds(new Set());
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? (err.problem.detail ?? err.problem.title)
          : "Không thực hiện được";
      toast.error(msg);
    }
  }

  const apiMessage =
    error instanceof ApiError
      ? (error.problem.detail ?? error.problem.title)
      : error instanceof Error
        ? error.message
        : null;

  const allSelected = users.length > 0 && selectedIds.size === users.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < users.length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Người dùng</h1>
        <p className="text-muted-foreground text-sm">
          Quản lý tài khoản, trạng thái, phân quyền và phiên đăng nhập.
        </p>
      </header>

      <form
        onSubmit={handleSearch}
        className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1 lg:col-span-2">
            <label className="text-muted-foreground text-xs font-medium" htmlFor="filter-search">
              Tìm kiếm
            </label>
            <Input
              id="filter-search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Email, họ tên, username..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-xs font-medium" htmlFor="filter-role">
              Vai trò
            </label>
            <Input
              id="filter-role"
              value={roleDraft}
              onChange={(e) => setRoleDraft(e.target.value)}
              placeholder="ADMIN, STUDENT..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-xs font-medium" htmlFor="filter-status">
              Trạng thái
            </label>
            <Select
              id="filter-status"
              value={status}
              onChange={(e) => updateParams({ status: e.target.value })}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Đã chọn</span>
            <span className="font-semibold">{selectedIds.size}</span>
            <span className="text-muted-foreground">/ {totalElements}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <label className="text-muted-foreground text-xs" htmlFor="sort-select">
                Sắp xếp
              </label>
              <Select
                id="sort-select"
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="h-8 w-auto min-w-[180px]"
              >
                <option value="registrationDate,DESC">Mới đăng ký</option>
                <option value="registrationDate,ASC">Cũ nhất</option>
                <option value="lastLoginDate,DESC">Đăng nhập gần đây</option>
                <option value="email,ASC">Email A→Z</option>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedIds.size === 0 || bulkActivate.isPending}
              onClick={() => runBulk("activate")}
            >
              Kích hoạt
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={selectedIds.size === 0 || bulkDeactivate.isPending}
              onClick={() => runBulk("deactivate")}
            >
              Vô hiệu hoá
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Chọn tất cả"
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(c) => toggleAll(c === true)}
                />
              </TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Đăng ký</TableHead>
              <TableHead>Đăng nhập gần nhất</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground py-10 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground py-10 text-center">
                  Không có người dùng phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const checked = selectedIds.has(user.id);
                return (
                  <TableRow key={user.id} data-state={checked ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        aria-label={`Chọn ${user.email}`}
                        checked={checked}
                        onCheckedChange={(c) => toggleOne(user.id, c === true)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.fullName || user.username}</span>
                        <span className="text-muted-foreground text-xs">@{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roleCodes.length === 0 ? (
                          <span className="text-muted-foreground text-xs">—</span>
                        ) : (
                          user.roleCodes.map((code) => (
                            <span
                              key={code}
                              className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs"
                            >
                              {code}
                            </span>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <UserStatusBadge status={user.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(user.registrationDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(user.lastLoginDate)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-primary text-xs font-medium hover:underline"
                      >
                        Chi tiết
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
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
