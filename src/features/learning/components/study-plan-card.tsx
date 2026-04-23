import Link from "next/link";

import { cn } from "@/lib/utils";

import type { StudyPlanListItem } from "../types/study-plan";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang học",
  PAUSED: "Tạm dừng",
  COMPLETED: "Hoàn thành",
  ABANDONED: "Đã huỷ",
};

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: "bg-primary/10 text-primary",
  PAUSED: "bg-muted text-muted-foreground",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ABANDONED: "bg-destructive/10 text-destructive",
};

function formatPercent(value: string | null | undefined): number {
  if (!value) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? Math.max(0, Math.min(100, num)) : 0;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d}/${m}/${y}` : value;
}

export function StudyPlanCard({ plan }: { plan: StudyPlanListItem }) {
  const progress = formatPercent(plan.progress.percent);
  const statusLabel = STATUS_LABELS[plan.status] ?? plan.status;
  const statusClass = STATUS_CLASSES[plan.status] ?? "bg-muted text-muted-foreground";
  const daysToExam = plan.schedule.daysToExam;
  const overdue = typeof daysToExam === "number" && daysToExam < 0;

  return (
    <Link
      href={`/my-prep/${plan.id}`}
      className="border-border bg-card hover:border-primary/40 flex flex-col gap-3 rounded-2xl border p-5 transition-colors hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {plan.certification.code}
          </p>
          <h3 className="text-base leading-tight font-semibold">{plan.certification.name}</h3>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
            statusClass,
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>Tiến độ</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-[0.7rem] uppercase">Ngày thi</p>
          <p className={cn("text-foreground font-medium", overdue && "text-destructive")}>
            {formatDate(plan.schedule.examDate)}
          </p>
        </div>
        <div>
          <p className="text-[0.7rem] uppercase">Còn lại</p>
          <p className={cn("text-foreground font-medium", overdue && "text-destructive")}>
            {typeof daysToExam === "number"
              ? overdue
                ? `Quá ${Math.abs(daysToExam)} ngày`
                : `${daysToExam} ngày`
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-[0.7rem] uppercase">Tuần hiện tại</p>
          <p className="text-foreground font-medium">
            {plan.schedule.currentWeek ?? "—"}/{plan.schedule.totalWeeks ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-[0.7rem] uppercase">Cột mốc</p>
          <p className="text-foreground font-medium">
            {plan.milestones.achieved}/{plan.milestones.total}
          </p>
        </div>
      </div>
    </Link>
  );
}
