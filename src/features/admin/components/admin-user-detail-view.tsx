"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ApiError } from "@/lib/api";

import {
  useActivateAdminUser,
  useAdminUser,
  useDeactivateAdminUser,
  useDeleteAdminUser,
  useUpdateAdminUser,
} from "../hooks/use-admin-users";
import type { UpdateUserInput, UserStatus } from "../types/user";

import { UserSessionsPanel } from "./user-sessions-panel";
import { UserStatusBadge } from "./user-status-badge";

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Ngưng hoạt động" },
  { value: "SUSPENDED", label: "Tạm khoá" },
  { value: "LOCKED", label: "Đã khoá" },
];

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
  });
}

export function AdminUserDetailView({ userId }: { userId: number }) {
  const router = useRouter();
  const { data: user, isLoading, error } = useAdminUser(userId);
  const updateUser = useUpdateAdminUser();
  const activate = useActivateAdminUser();
  const deactivate = useDeactivateAdminUser();
  const deleteUser = useDeleteAdminUser();

  const [form, setForm] = useState<UpdateUserInput>({});
  const [syncedUserId, setSyncedUserId] = useState<number | null>(null);

  if (user && syncedUserId !== user.id) {
    setSyncedUserId(user.id);
    setForm({
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? "",
      roleCode: user.roleCodes[0] ?? "",
      status: user.status,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateUser.mutateAsync({ id: userId, payload: form });
      toast.success("Đã cập nhật người dùng");
    } catch (err) {
      const msg = err instanceof ApiError ? (err.problem.detail ?? err.problem.title) : "Lỗi";
      toast.error(msg);
    }
  }

  async function handleActivate() {
    try {
      await activate.mutateAsync(userId);
      toast.success("Đã kích hoạt tài khoản");
    } catch (err) {
      const msg = err instanceof ApiError ? (err.problem.detail ?? err.problem.title) : "Lỗi";
      toast.error(msg);
    }
  }

  async function handleDeactivate() {
    try {
      await deactivate.mutateAsync(userId);
      toast.success("Đã vô hiệu hoá tài khoản");
    } catch (err) {
      const msg = err instanceof ApiError ? (err.problem.detail ?? err.problem.title) : "Lỗi";
      toast.error(msg);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Xác nhận xoá người dùng này? Thao tác không thể hoàn tác.")) return;
    try {
      await deleteUser.mutateAsync(userId);
      toast.success("Đã xoá người dùng");
      router.replace("/admin/users");
    } catch (err) {
      const msg = err instanceof ApiError ? (err.problem.detail ?? err.problem.title) : "Lỗi";
      toast.error(msg);
    }
  }

  const apiMessage =
    error instanceof ApiError
      ? (error.problem.detail ?? error.problem.title)
      : error instanceof Error
        ? error.message
        : null;

  if (isLoading) {
    return <p className="text-muted-foreground py-10 text-center text-sm">Đang tải...</p>;
  }

  if (apiMessage) {
    return (
      <div
        role="alert"
        className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
      >
        {apiMessage}
      </div>
    );
  }

  if (!user) {
    return <p className="text-muted-foreground py-10 text-center text-sm">Không tìm thấy.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href="/admin/users" className="text-muted-foreground text-xs hover:underline">
            ← Quay lại danh sách
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {user.fullName || user.username}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{user.email}</span>
            <UserStatusBadge status={user.status} />
            {user.emailVerified ? (
              <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Đã xác minh email
              </span>
            ) : (
              <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                Chưa xác minh
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.status === "ACTIVE" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deactivate.isPending}
              onClick={handleDeactivate}
            >
              Vô hiệu hoá
            </Button>
          ) : (
            <Button type="button" size="sm" disabled={activate.isPending} onClick={handleActivate}>
              Kích hoạt
            </Button>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleteUser.isPending}
            onClick={handleDelete}
          >
            Xoá
          </Button>
        </div>
      </div>

      <section className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Username</span>
            <span className="text-sm font-medium">@{user.username}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Vai trò</span>
            <span className="text-sm">
              {user.roleCodes.length > 0 ? user.roleCodes.join(", ") : "—"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Đăng ký</span>
            <span className="text-sm">{formatDateTime(user.registrationDate)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Đăng nhập gần nhất</span>
            <span className="text-sm">{formatDateTime(user.lastLoginDate)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Đổi mật khẩu gần nhất</span>
            <span className="text-sm">{formatDateTime(user.lastPasswordChangeDate)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Quyền</span>
            <span className="text-sm">{(user.permissions ?? []).length} quyền</span>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5"
      >
        <div>
          <h2 className="text-base font-semibold">Cập nhật thông tin</h2>
          <p className="text-muted-foreground text-xs">
            Thay đổi sẽ được ghi lại trong nhật ký hoạt động.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="edit-fullname">Họ tên</Label>
            <Input
              id="edit-fullname"
              value={form.fullName ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="edit-phone">Số điện thoại</Label>
            <Input
              id="edit-phone"
              value={form.phone ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="edit-role">Vai trò</Label>
            <Input
              id="edit-role"
              value={form.roleCode ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, roleCode: e.target.value }))}
              placeholder="ADMIN, STUDENT..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="edit-status">Trạng thái</Label>
            <Select
              id="edit-status"
              value={form.status ?? "ACTIVE"}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as UserStatus }))}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button type="submit" disabled={updateUser.isPending}>
            {updateUser.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>

      <UserSessionsPanel userId={userId} />
    </div>
  );
}
