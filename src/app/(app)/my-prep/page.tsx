import type { Metadata } from "next";
import { Suspense } from "react";

import { StudyPlanListView } from "@/features/learning/components/study-plan-list-view";

export const metadata: Metadata = {
  title: "Kế hoạch ôn thi",
};

export default function MyPrepPage() {
  return (
    <Suspense fallback={null}>
      <StudyPlanListView />
    </Suspense>
  );
}
