import type { Metadata } from "next";

import { AdminCertificationEditView } from "@/features/admin/components/admin-certification-edit-view";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Chứng chỉ · ${slug}` };
}

export default async function AdminCertificationEditPage({ params }: PageProps) {
  const { slug } = await params;
  return <AdminCertificationEditView slug={slug} />;
}
