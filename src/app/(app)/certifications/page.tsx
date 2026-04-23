import type { Metadata } from "next";
import { Suspense } from "react";

import { CertificationListView } from "@/features/learning/components/certification-list-view";

export const metadata: Metadata = {
  title: "Chứng chỉ",
};

export default function CertificationsPage() {
  return (
    <Suspense fallback={null}>
      <CertificationListView />
    </Suspense>
  );
}
