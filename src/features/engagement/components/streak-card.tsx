"use client";

import { cn } from "@/lib/utils";

import type { StreakResponse } from "../types/progress";

const STREAK_TYPE_LABEL: Record<string, string> = {
  STUDY: "Học tập",
  LESSON_COMPLETION: "Hoàn thành bài học",
  PRACTICE: "Luyện tập",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d}/${m}/${y}` : value;
}

export function StreakCard({ streak }: { streak: StreakResponse }) {
  const label = STREAK_TYPE_LABEL[streak.streakType] ?? streak.streakType;
  const active = streak.currentStreak > 0;
  return (
    <div
      className={cn(
        "border-border bg-card flex flex-col gap-1 rounded-xl border p-4",
        streak.frozen && "border-sky-500/40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
        {streak.frozen ? (
          <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[0.65rem] font-medium text-sky-600 dark:text-sky-400">
            Tạm dừng
          </span>
        ) : null}
      </div>
      <p className="flex items-baseline gap-1 text-2xl font-semibold">
        {streak.currentStreak}
        <span className="text-muted-foreground text-xs font-normal">ngày</span>
      </p>
      <p className="text-muted-foreground text-xs">
        Kỷ lục: {streak.longestStreak} ngày
        {active && streak.lastActivityDate
          ? ` · Gần nhất ${formatDate(streak.lastActivityDate)}`
          : null}
      </p>
    </div>
  );
}
