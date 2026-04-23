import type { Metadata } from "next";

import { StudyPlanDetailView } from "@/features/learning/components/study-plan-detail-view";

interface StudyPlanPageProps {
  params: Promise<{ planId: string }>;
}

export async function generateMetadata({ params }: StudyPlanPageProps): Promise<Metadata> {
  const { planId } = await params;
  return { title: `Kế hoạch #${planId}` };
}

export default async function StudyPlanPage({ params }: StudyPlanPageProps) {
  const { planId } = await params;
  const numericId = Number(planId);
  return <StudyPlanDetailView planId={Number.isFinite(numericId) ? numericId : 0} />;
}
