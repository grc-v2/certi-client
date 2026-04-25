import type { Metadata } from "next";

import { AdminCertificationsView } from "@/features/admin/components/admin-certifications-view";

export const metadata: Metadata = { title: "Chứng chỉ" };

export default function AdminCertificationsPage() {
  return <AdminCertificationsView />;
}
