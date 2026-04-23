"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/identity/hooks/use-auth";
import { useMyStudyPlans } from "@/features/learning/hooks/use-study-plans";
import type { StudyPlanListItem } from "@/features/learning/types/study-plan";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

import { useDashboard, useStreaks } from "../hooks/use-progress";

import { ActivityFeed } from "./activity-feed";
import { DomainProgressList } from "./domain-progress-list";
import { StreakCard } from "./streak-card";

function formatPercent(value: string | null): string {
  if (!value) return "0%";
  const num = Number(value);
  return Number.isFinite(num) ? `${num.toFixed(0)}%` : "0%";
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border-border bg-card flex flex-col gap-1 rounded-xl border p-4">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}

function pickDefaultPlan(items: StudyPlanListItem[]): StudyPlanListItem | null {
  if (items.length === 0) return null;
  return items.find((item) => item.status === "ACTIVE") ?? items[0];
}

export function DashboardView() {
  const { data: userData } = useCurrentUser();
  const { data: plansData, isLoading: plansLoading } = useMyStudyPlans({
    page: 0,
    size: 20,
  });

  const items = useMemo(() => plansData?.items ?? [], [plansData]);
  const defaultPlan = useMemo(() => pickDefaultPlan(items), [items]);
  const [selectedCertId, setSelectedCertId] = useState<number | null>(null);
  const activeCertId = selectedCertId ?? defaultPlan?.certification.id ?? null;

  const dashboardQuery = useDashboard(activeCertId ?? undefined);
  const streaksQuery = useStreaks(activeCertId ?? undefined);

  const greeting = userData?.user.fullName || userData?.user.username || "bạn";

  if (plansLoading && items.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-muted-foreground text-sm">Đang tải bảng điều khiển...</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Xin chào, {greeting}</h1>
        <p className="text-muted-foreground text-sm">
          Bạn chưa có kế hoạch ôn thi nào. Tạo kế hoạch đầu tiên để bắt đầu theo dõi tiến độ.
        </p>
        <div className="flex gap-3">
          <Button render={<Link href="/my-prep/new" />}>Tạo kế hoạch</Button>
          <Button variant="outline" render={<Link href="/certifications" />}>
            Khám phá chứng chỉ
          </Button>
        </div>
      </main>
    );
  }

  const dashboard = dashboardQuery.data;
  const streaks = streaksQuery.data ?? dashboard?.streaks ?? [];
  const error = dashboardQuery.error;
  const loading = dashboardQuery.isLoading;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">Xin chào, {greeting}</h1>
          <p className="text-muted-foreground text-sm">Tổng quan tiến độ ôn thi của bạn.</p>
        </div>
        {items.length > 1 ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Chứng chỉ
            </span>
            <select
              className="border-border bg-background rounded-md border px-3 py-2 text-sm"
              value={activeCertId ?? ""}
              onChange={(e) => setSelectedCertId(Number(e.target.value))}
            >
              {items.map((item) => (
                <option key={item.id} value={item.certification.id}>
                  {item.certification.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </header>

      {loading ? (
        <p className="text-muted-foreground text-sm">Đang tải dữ liệu...</p>
      ) : error ? (
        <div className="border-destructive/40 bg-destructive/5 text-destructive rounded-xl border p-4 text-sm">
          {error instanceof ApiError
            ? (error.problem.detail ?? error.problem.title)
            : error instanceof Error
              ? error.message
              : "Không tải được bảng điều khiển."}
        </div>
      ) : dashboard ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Tiến độ kế hoạch" value={formatPercent(dashboard.planCompletionPct)} />
            <Stat label="Độ sẵn sàng" value={formatPercent(dashboard.readinessScore)} />
            <Stat
              label="Ngày còn lại"
              value={
                typeof dashboard.daysUntilExam === "number" ? `${dashboard.daysUntilExam}` : "—"
              }
              hint="Đến ngày thi"
            />
            <Stat
              label="Tổng ngày học"
              value={
                typeof dashboard.totalStudyDays === "number" ? `${dashboard.totalStudyDays}` : "—"
              }
            />
          </section>

          {streaks.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Chuỗi hoạt động</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {streaks.map((streak) => (
                  <StreakCard key={streak.streakType} streak={streak} />
                ))}
              </div>
            </section>
          ) : null}

          {dashboard.mockSummary ? (
            <section className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-6">
              <h2 className="text-lg font-semibold">Thi thử</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Số lần thi" value={`${dashboard.mockSummary.totalAttempts ?? 0}`} />
                <Stat
                  label="Điểm gần nhất"
                  value={formatPercent(dashboard.mockSummary.latestScore)}
                />
                <Stat
                  label="Điểm cao nhất"
                  value={formatPercent(dashboard.mockSummary.bestScore)}
                />
                <Stat
                  label="Điểm trung bình"
                  value={formatPercent(dashboard.mockSummary.averageScore)}
                  hint={dashboard.mockSummary.trend ?? undefined}
                />
              </div>
            </section>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-6">
              <h2 className="text-lg font-semibold">Tiến độ theo domain</h2>
              <DomainProgressList domains={dashboard.domainProgress ?? []} />
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Hoạt động hôm nay</h2>
              <ActivityFeed
                items={dashboard.todayActivity ?? []}
                emptyLabel="Hôm nay bạn chưa có hoạt động nào."
              />
              <h2
                className={cn(
                  "text-lg font-semibold",
                  (dashboard.recentActivities ?? []).length === 0 && "text-muted-foreground",
                )}
              >
                Hoạt động gần đây
              </h2>
              <ActivityFeed items={dashboard.recentActivities ?? []} />
            </section>
          </div>
        </>
      ) : null}
    </main>
  );
}
