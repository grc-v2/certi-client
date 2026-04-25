import type { Metadata } from "next";

import { AdminAuditView } from "@/features/admin/components/admin-audit-view";

export const metadata: Metadata = { title: "Nhật ký hoạt động" };

export default function AdminAuditPage() {
  return <AdminAuditView />;
}
