import { Badge } from "@/components/ui/badge";

import type { UserStatus } from "../types/user";

const STATUS_META: Record<
  UserStatus,
  { label: string; variant: "success" | "muted" | "warning" | "destructive" }
> = {
  ACTIVE: { label: "Hoạt động", variant: "success" },
  INACTIVE: { label: "Ngưng hoạt động", variant: "muted" },
  SUSPENDED: { label: "Tạm khoá", variant: "warning" },
  LOCKED: { label: "Đã khoá", variant: "destructive" },
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const meta = STATUS_META[status] ?? { label: status, variant: "muted" as const };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
