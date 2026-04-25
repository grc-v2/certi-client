import { Badge } from "@/components/ui/badge";

import type { CertificationStatus } from "../types/certification";

const STATUS_META: Record<
  CertificationStatus,
  { label: string; variant: "success" | "muted" | "warning" | "destructive" | "default" }
> = {
  DRAFT: { label: "Nháp", variant: "muted" },
  ACTIVE: { label: "Đang hoạt động", variant: "success" },
  RETIRING: { label: "Sắp ngừng", variant: "warning" },
  RETIRED: { label: "Đã ngừng", variant: "destructive" },
};

export function CertificationStatusBadge({ status }: { status: string }) {
  const key = status as CertificationStatus;
  const meta = STATUS_META[key] ?? { label: status, variant: "muted" as const };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
