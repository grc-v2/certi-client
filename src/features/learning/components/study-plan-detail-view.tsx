"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";

import { useStudyPlan } from "../hooks/use-study-plans";

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

export function StudyPlanDetailView({ planId }: { planId: number }) {
  const { data, isLoading, error } = useStudyPlan(planId);

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
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {data.status}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{data.certificationName}</h1>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Ngày thi" value={formatDate(data.examDate)} />
          <Stat label="Tiến độ" value={formatPercent(data.progress)} />
          <Stat label="Sẵn sàng" value={formatPercent(data.readiness)} />
          <Stat label="Tổng tuần" value={String(data.totalWeeks)} />
        </div>
      </header>

      {domains.length > 0 ? (
        <section className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Phân bổ theo domain</h2>
          <ul className="flex flex-col gap-2">
            {domains.map((domain, index) => (
              <li
                key={domain.id ?? index}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span>{domain.domainName ?? "Domain"}</span>
                <span className="text-muted-foreground">
                  {domain.weightPercentage ? `${domain.weightPercentage}%` : "—"} ·{" "}
                  {domain.allocatedHours ?? "—"}h
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {milestones.length > 0 ? (
        <section className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Cột mốc</h2>
          <ul className="flex flex-col gap-2">
            {milestones.map((milestone, index) => (
              <li
                key={milestone.id ?? index}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div>
                  <p className="font-medium">{milestone.title ?? "Cột mốc"}</p>
                  {milestone.description ? (
                    <p className="text-muted-foreground text-xs">{milestone.description}</p>
                  ) : null}
                </div>
                <span
                  className={
                    milestone.achieved
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }
                >
                  {milestone.achieved ? "Hoàn thành" : formatDate(milestone.dueDate)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {weeks.length > 0 ? (
        <section className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Lộ trình theo tuần</h2>
          <ul className="flex flex-col gap-3">
            {weeks.map((week) => (
              <li
                key={week.id ?? week.weekNumber}
                className="border-border flex flex-col gap-1 rounded-xl border p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">Tuần {week.weekNumber}</p>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(week.startDate)} – {formatDate(week.endDate)}
                  </span>
                </div>
                {week.focusArea ? (
                  <p className="text-muted-foreground text-xs">{week.focusArea}</p>
                ) : null}
                {week.tasks && week.tasks.length > 0 ? (
                  <p className="text-muted-foreground text-xs">{week.tasks.length} nhiệm vụ</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
