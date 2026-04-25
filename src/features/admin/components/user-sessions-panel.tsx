"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";

import {
  useForceLogoutAllSessions,
  useForceLogoutSession,
  useUserSessions,
} from "../hooks/use-user-sessions";

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

export function UserSessionsPanel({ userId }: { userId: number }) {
  const { data, isLoading, error, refetch } = useUserSessions(userId);
  const forceLogoutOne = useForceLogoutSession();
  const forceLogoutAll = useForceLogoutAllSessions();

  const sessions = data ?? [];
  const apiMessage =
    error instanceof ApiError
      ? (error.problem.detail ?? error.problem.title)
      : error instanceof Error
        ? error.message
        : null;

  async function revokeOne(sessionId: string) {
    try {
      await forceLogoutOne.mutateAsync({ userId, sessionId });
      toast.success("Đã đóng phiên đăng nhập");
    } catch (err) {
      const msg = err instanceof ApiError ? (err.problem.detail ?? err.problem.title) : "Lỗi";
      toast.error(msg);
    }
  }

  async function revokeAll() {
    try {
      const result = await forceLogoutAll.mutateAsync(userId);
      toast.success(`Đã đóng ${result.count} phiên`);
    } catch (err) {
      const msg = err instanceof ApiError ? (err.problem.detail ?? err.problem.title) : "Lỗi";
      toast.error(msg);
    }
  }

  return (
    <section className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Phiên đăng nhập đang hoạt động</h2>
          <p className="text-muted-foreground text-xs">
            {sessions.length} phiên đang mở cho người dùng này.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={sessions.length === 0 || forceLogoutAll.isPending}
            onClick={revokeAll}
          >
            Đóng tất cả
          </Button>
        </div>
      </div>

      {apiMessage ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {apiMessage}
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-muted-foreground py-6 text-center text-sm">Đang tải...</p>
      ) : sessions.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">Không có phiên nào.</p>
      ) : (
        <ul className="divide-border flex flex-col divide-y">
          {sessions.map((session) => (
            <li
              key={session.sessionId}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{session.ipAddress ?? "Unknown IP"}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {session.userAgent ?? "Unknown device"}
                </span>
                <span className="text-muted-foreground text-xs">
                  Tạo: {formatDateTime(session.createdAt)} · Gần nhất:{" "}
                  {formatDateTime(session.lastAccessedAt)}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={forceLogoutOne.isPending}
                onClick={() => revokeOne(session.sessionId)}
              >
                Đóng phiên
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
