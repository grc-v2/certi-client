import type { Metadata } from "next";

import { CertificationDetailView } from "@/features/learning/components/certification-detail-view";

interface CertificationDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CertificationDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Chứng chỉ ${slug}`,
  };
}

export default async function CertificationDetailPage({ params }: CertificationDetailPageProps) {
  const { slug } = await params;
  return <CertificationDetailView slug={slug} />;
}
