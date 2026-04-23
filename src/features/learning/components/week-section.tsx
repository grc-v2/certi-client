"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import type { DailyTask, StudyPlanWeek } from "../types/study-plan";

const TASK_STATUS_LABEL: Record<string, string> = {
  PENDING: "Chưa làm",
  IN_PROGRESS: "Đang làm",
  COMPLETED: "Xong",
  SKIPPED: "Bỏ qua",
};

const TASK_STATUS_CLASS: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  IN_PROGRESS: "bg-primary/10 text-primary",
  PENDING: "bg-muted text-muted-foreground",
  SKIPPED: "bg-muted text-muted-foreground",
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d}/${m}` : value;
}

function TaskRow({ task, onOpen }: { task: DailyTask; onOpen: (task: DailyTask) => void }) {
  const completed = task.status === "COMPLETED";
  return (
    <button
      type="button"
      onClick={() => onOpen(task)}
      className={cn(
        "border-border hover:border-primary/40 hover:bg-muted/30 flex w-full flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
        completed && "opacity-75",
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">{formatDate(task.scheduledDate)}</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[0.7rem] font-medium whitespace-nowrap",
            TASK_STATUS_CLASS[task.status] ?? "bg-muted text-muted-foreground",
          )}
        >
          {TASK_STATUS_LABEL[task.status] ?? task.status}
        </span>
      </div>
      <p className={cn("text-sm font-medium", completed && "line-through")}>{task.title}</p>
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
        {task.domainName ? <span>{task.domainName}</span> : null}
        {task.estimatedMinutes ? <span>{task.estimatedMinutes} phút</span> : null}
        {task.taskType ? <span>{task.taskType}</span> : null}
      </div>
    </button>
  );
}

export function WeekSection({
  week,
  defaultOpen = false,
  onOpenTask,
}: {
  week: StudyPlanWeek;
  defaultOpen?: boolean;
  onOpenTask: (task: DailyTask) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const tasks = week.dailyTasks ?? [];
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="border-border bg-card rounded-xl border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Tuần {week.weekNumber}
            </span>
            {week.phase ? (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[0.7rem] font-medium">
                {week.phase}
              </span>
            ) : null}
          </div>
          <h3 className="text-sm leading-tight font-semibold">{week.theme ?? "Kế hoạch tuần"}</h3>
          <p className="text-muted-foreground text-xs">
            {formatDate(week.startDate)} – {formatDate(week.endDate)} · {completedCount}/
            {totalCount} nhiệm vụ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-muted relative h-2 w-20 overflow-hidden rounded-full">
            <div
              className="bg-primary absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-muted-foreground text-xs">{open ? "▾" : "▸"}</span>
        </div>
      </button>

      {open ? (
        <div className="border-border flex flex-col gap-2 border-t p-4">
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-xs">Chưa có nhiệm vụ cho tuần này.</p>
          ) : (
            tasks.map((task) => <TaskRow key={task.id} task={task} onOpen={onOpenTask} />)
          )}
        </div>
      ) : null}
    </div>
  );
}
