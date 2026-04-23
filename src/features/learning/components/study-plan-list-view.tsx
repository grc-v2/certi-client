"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

import { useMyStudyPlans } from "../hooks/use-study-plans";
import type { StudyPlanSummary } from "../types/study-plan";

import { StudyPlanCard } from "./study-plan-card";

const PAGE_SIZE = 12;

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "ACTIVE", label: "Đang học" },
  { value: "PAUSED", label: "Tạm dừng" },
  { value: "COMPLETED", label: "Hoàn thành" },
];

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "warn" | "danger" | "success";
}) {
  return (
    <div
      className={cn(
        "border-border bg-card flex flex-col gap-1 rounded-2xl border p-4",
        tone === "warn" && "border-amber-500/30 bg-amber-500/5",
        tone === "danger" && "border-destructive/30 bg-destructive/5",
        tone === "success" && "border-emerald-500/30 bg-emerald-500/5",
      )}
    >
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function SummarySection({ summary }: { summary: StudyPlanSummary }) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <SummaryCard label="Đang học" value={summary.active} tone="success" />
      <SummaryCard label="Tạm dừng" value={summary.paused} />
      <SummaryCard label="Hoàn thành" value={summary.completed} />
      <SummaryCard label="Sắp đến hạn (7 ngày)" value={summary.dueIn7Days} tone="warn" />
      <SummaryCard label="Quá hạn" value={summary.overdue} tone="danger" />
    </section>
  );
}

export function StudyPlanListView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const status = searchParams.get("status") ?? "";
  const page = Number(searchParams.get("page") ?? "0") || 0;

  const { data, isLoading, error } = useMyStudyPlans({
    page,
    size: PAGE_SIZE,
    status: status || undefined,
  });

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v && v.length > 0) next.set(k, v);
        else next.delete(k);
      }
      if (resetPage) next.delete("page");
      startTransition(() => {
        const qs = next.toString();
        router.replace(qs ? `/my-prep?${qs}` : "/my-prep");
      });
    },
    [router, searchParams],
  );

  const apiMessage =
    error instanceof ApiError
      ? (error.problem.detail ?? error.problem.title)
      : error instanceof Error
        ? error.message
        : null;

  const items = data?.items ?? [];
  const summary = data?.summary;
  const pageInfo = data?.page;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">Kế hoạch ôn thi</h1>
          <p className="text-muted-foreground text-sm">
            Theo dõi tiến độ và quản lý các kế hoạch ôn thi cá nhân.
          </p>
        </div>
        <Button render={<Link href="/my-prep/new" />}>Tạo kế hoạch mới</Button>
      </header>

      {summary ? <SummarySection summary={summary} /> : null}

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((opt) => {
          const active = status === opt.value;
          return (
            <button
              key={opt.value || "all"}
              type="button"
              onClick={() => updateParams({ status: opt.value || undefined })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/40 hover:text-foreground text-muted-foreground",
              )}
            >
              {opt.label}
            </button>
          );
        })}
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
        <p className="text-muted-foreground py-12 text-center text-sm">Đang tải kế hoạch...</p>
      ) : items.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center gap-3 rounded-2xl border p-10 text-center">
          <p className="font-medium">Bạn chưa có kế hoạch ôn thi nào</p>
          <p className="text-muted-foreground text-sm">
            Hãy tạo kế hoạch đầu tiên để bắt đầu hành trình chinh phục chứng chỉ.
          </p>
          <Button render={<Link href="/my-prep/new" />}>Tạo kế hoạch</Button>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((plan) => (
              <StudyPlanCard key={plan.id} plan={plan} />
            ))}
          </section>
          {pageInfo && pageInfo.totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-muted-foreground text-xs">
                Trang {pageInfo.number + 1} / {pageInfo.totalPages} — tổng {pageInfo.totalElements}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => updateParams({ page: String(Math.max(0, page - 1)) }, false)}
                  disabled={!pageInfo.hasPrevious}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => updateParams({ page: String(page + 1) }, false)}
                  disabled={!pageInfo.hasNext}
                >
                  Sau
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
