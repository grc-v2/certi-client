import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordForm } from "@/features/identity/components/reset-password-form";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
