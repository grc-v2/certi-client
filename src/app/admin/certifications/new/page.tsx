import type { Metadata } from "next";

import { AdminCertificationCreateView } from "@/features/admin/components/admin-certification-create-view";

export const metadata: Metadata = { title: "Tạo chứng chỉ" };

export default function AdminCertificationCreatePage() {
  return <AdminCertificationCreateView />;
}
