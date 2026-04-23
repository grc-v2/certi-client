import type { Metadata } from "next";
import { Suspense } from "react";

import { CreateStudyPlanForm } from "@/features/learning/components/create-study-plan-form";

export const metadata: Metadata = {
  title: "Tạo kế hoạch ôn thi",
};

export default function CreateStudyPlanPage() {
  return (
    <Suspense fallback={null}>
      <CreateStudyPlanForm />
    </Suspense>
  );
}
