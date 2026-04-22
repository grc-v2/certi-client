import type { Metadata } from "next";
import { Suspense } from "react";

import { VerifyEmailView } from "@/features/identity/components/verify-email-view";

export const metadata: Metadata = {
  title: "Xác thực email",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailView />
    </Suspense>
  );
}
