import { Badge } from "@/components/ui/badge";

import type { QuestionStatus } from "../types/question";

const STATUS_META: Record<
  QuestionStatus,
  { label: string; variant: "success" | "muted" | "warning" | "destructive" | "default" }
> = {
  DRAFT: { label: "Nháp", variant: "muted" },
  REVIEW: { label: "Chờ duyệt", variant: "warning" },
  PUBLISHED: { label: "Đã xuất bản", variant: "success" },
  DEPRECATED: { label: "Đã ẩn", variant: "muted" },
  REPORTED: { label: "Bị báo cáo", variant: "destructive" },
};

export function QuestionStatusBadge({ status }: { status: string }) {
  const key = status as QuestionStatus;
  const meta = STATUS_META[key] ?? { label: status, variant: "muted" as const };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
