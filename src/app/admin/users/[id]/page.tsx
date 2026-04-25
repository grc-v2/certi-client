import type { Metadata } from "next";

import { AdminUserDetailView } from "@/features/admin/components/admin-user-detail-view";

interface AdminUserPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AdminUserPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Người dùng #${id}` };
}

export default async function AdminUserPage({ params }: AdminUserPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  return <AdminUserDetailView userId={Number.isFinite(numericId) ? numericId : 0} />;
}
