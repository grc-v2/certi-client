"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "../hooks/use-auth";

export function DashboardView() {
  const { data, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-destructive text-sm">Không thể tải thông tin người dùng.</p>
      </main>
    );
  }

  const { user, permissions } = data;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Xin chào, {user.fullName || user.username}
        </h1>
        <p className="text-muted-foreground text-sm">
          Tiếp tục hành trình luyện thi chứng chỉ của bạn.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="border-border bg-card rounded-2xl border p-6">
          <h2 className="text-muted-foreground text-sm font-medium">Trạng thái tài khoản</h2>
          <p className="mt-2 text-lg font-semibold">
            {user.emailVerified ? "Đã xác thực email" : "Chưa xác thực email"}
          </p>
          {!user.emailVerified ? (
            <p className="text-muted-foreground mt-1 text-xs">
              Kiểm tra hộp thư để xác thực email của bạn.
            </p>
          ) : null}
        </article>

        <article className="border-border bg-card rounded-2xl border p-6">
          <h2 className="text-muted-foreground text-sm font-medium">Vai trò</h2>
          <p className="mt-2 text-lg font-semibold">
            {user.roles?.map((r) => r.name).join(", ") || "—"}
          </p>
        </article>

        <article className="border-border bg-card rounded-2xl border p-6">
          <h2 className="text-muted-foreground text-sm font-medium">Quyền</h2>
          <p className="mt-2 text-lg font-semibold">{permissions.length} quyền</p>
        </article>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <Button render={<Link href="/profile" />}>Quản lý hồ sơ</Button>
        <Button variant="outline" render={<Link href="/certifications" />}>
          Khám phá chứng chỉ
        </Button>
      </section>
    </main>
  );
}
