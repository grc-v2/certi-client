"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

import { useStudyPlan } from "../hooks/use-study-plans";
import type { DailyTask } from "../types/study-plan";

import { TaskDetailPanel } from "./task-detail-panel";
import { WeekSection } from "./week-section";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d}/${m}/${y}` : value;
}

function formatPercent(value: string | null | undefined): string {
  if (!value) return "0%";
  const num = Number(value);
  return Number.isFinite(num) ? `${num.toFixed(0)}%` : "0%";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-card flex flex-col gap-1 rounded-xl border p-4">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang học",
  PAUSED: "Tạm dừng",
  COMPLETED: "Hoàn thành",
  ABANDONED: "Đã huỷ",
};

export function StudyPlanDetailView({ planId }: { planId: number }) {
  const { data, isLoading, error } = useStudyPlan(planId);
  const [openTask, setOpenTask] = useState<DailyTask | null>(null);

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-muted-foreground text-sm">Đang tải kế hoạch...</p>
      </main>
    );
  }

  if (error || !data) {
    const detail =
      error instanceof ApiError
        ? (error.problem.detail ?? error.problem.title)
        : "Không tìm thấy kế hoạch.";
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Không tải được kế hoạch</h1>
        <p className="text-muted-foreground text-sm">{detail}</p>
        <Button variant="outline" render={<Link href="/my-prep" />}>
          Quay lại danh sách
        </Button>
      </main>
    );
  }

  const weeks = data.weeks ?? [];
  const milestones = data.milestones ?? [];
  const domains = data.domainAllocations ?? [];
  const currentWeekNumber = weeks.find((w) => w.status === "IN_PROGRESS")?.weekNumber;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <nav className="text-muted-foreground flex items-center gap-2 text-xs">
        <Link href="/my-prep" className="hover:text-foreground">
          Kế hoạch ôn thi
        </Link>
        <span>/</span>
        <span className="text-foreground">#{data.id}</span>
      </nav>

      <header className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-6">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {STATUS_LABELS[data.status] ?? data.status}
          </span>
          <h1 className="text-3xl font-semibold tracking-tight">{data.certificationName}</h1>
          <p className="text-muted-foreground text-sm">
            {formatDate(data.startDate)} → {formatDate(data.endDate)} · {data.totalWeeks} tuần
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Ngày thi" value={formatDate(data.examDate)} />
          <Stat label="Tiến độ" value={formatPercent(data.progress)} />
          <Stat label="Sẵn sàng" value={formatPercent(data.readiness)} />
          <Stat label="Phút/ngày" value={`${data.dailyStudyMinutes}`} />
        </div>
      </header>

      {domains.length > 0 ? (
        <section className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Phân bổ theo domain</h2>
          <ul className="flex flex-col gap-2">
            {domains.map((domain) => {
              const allocated = Number(domain.allocatedHours ?? "0");
              const completed = Number(domain.completedHours ?? "0");
              const pct =
                Number.isFinite(allocated) && allocated > 0
                  ? Math.min(100, Math.round((completed / allocated) * 100))
                  : 0;
              return (
                <li key={domain.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{domain.domainName}</span>
                    <span className="text-muted-foreground text-xs">
                      {domain.weightPercentage ?? "—"}% · {completed}/{allocated || "—"}h
                    </span>
                  </div>
                  <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {weeks.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Lộ trình theo tuần</h2>
          <div className="flex flex-col gap-2">
            {weeks.map((week) => (
              <WeekSection
                key={week.id}
                week={week}
                defaultOpen={week.weekNumber === currentWeekNumber}
                onOpenTask={setOpenTask}
              />
            ))}
          </div>
        </section>
      ) : null}

      {milestones.length > 0 ? (
        <section className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Cột mốc</h2>
          <ul className="flex flex-col gap-2">
            {milestones.map((milestone) => {
              const achieved = milestone.status === "ACHIEVED" || Boolean(milestone.achievedDate);
              return (
                <li key={milestone.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="flex flex-col">
                    <p className="font-medium">{milestone.title}</p>
                    {milestone.description ? (
                      <p className="text-muted-foreground text-xs">{milestone.description}</p>
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      "text-xs whitespace-nowrap",
                      achieved ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
                    )}
                  >
                    {achieved ? "Hoàn thành" : formatDate(milestone.targetDate)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {openTask ? (
        <TaskDetailPanel
          planId={planId}
          taskId={openTask.id}
          defaultActualMinutes={openTask.estimatedMinutes ?? undefined}
          onClose={() => setOpenTask(null)}
        />
      ) : null}
    </main>
  );
}
