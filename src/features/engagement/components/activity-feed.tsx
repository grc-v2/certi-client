"use client";

import type { ActivityFeedItem } from "../types/progress";

const ACTIVITY_TYPE_LABEL: Record<string, string> = {
  STUDY_SESSION: "Phiên học",
  LESSON_COMPLETED: "Hoàn thành bài học",
  TASK_COMPLETED: "Hoàn thành nhiệm vụ",
  MOCK_EXAM: "Thi thử",
  PRACTICE: "Luyện tập",
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d}/${m}` : value;
}

export function ActivityFeed({
  items,
  emptyLabel = "Chưa có hoạt động nào.",
}: {
  items: ActivityFeedItem[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-xs">{emptyLabel}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, idx) => {
        const typeLabel = ACTIVITY_TYPE_LABEL[item.activityType] ?? item.activityType;
        return (
          <li
            key={`${item.activityDate}-${idx}`}
            className="border-border bg-card flex items-start justify-between gap-3 rounded-lg border p-3 text-sm"
          >
            <div className="flex flex-col gap-0.5">
              <p className="text-muted-foreground text-[0.7rem] font-medium tracking-wide uppercase">
                {typeLabel}
              </p>
              <p className="font-medium">{item.description}</p>
              <p className="text-muted-foreground flex flex-wrap gap-x-3 text-xs">
                <span>{formatDate(item.activityDate)}</span>
                {item.domainName ? <span>{item.domainName}</span> : null}
                {item.durationMinutes ? <span>{item.durationMinutes} phút</span> : null}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
