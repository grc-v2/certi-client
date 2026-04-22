import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/features/identity/components/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
