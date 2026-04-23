"use client";

import type { DomainProgressResponse } from "../types/progress";

function toPercent(value: string | null): number {
  if (!value) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? Math.min(100, Math.max(0, num)) : 0;
}

function formatScore(value: string | null): string {
  if (!value) return "—";
  const num = Number(value);
  return Number.isFinite(num) ? `${num.toFixed(0)}%` : value;
}

export function DomainProgressList({ domains }: { domains: DomainProgressResponse[] }) {
  if (domains.length === 0) {
    return <p className="text-muted-foreground text-xs">Chưa có dữ liệu tiến độ theo domain.</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {domains.map((domain) => {
        const pct = toPercent(domain.currentScore);
        return (
          <li key={domain.domainId} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{domain.domainName}</span>
              <span className="text-muted-foreground text-xs">
                {formatScore(domain.currentScore)}
                {domain.questionsAttempted ? ` · ${domain.questionsAttempted} câu` : null}
                {domain.accuracy ? ` · độ chính xác ${formatScore(domain.accuracy)}` : null}
              </span>
            </div>
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
