import type { Metadata } from "next";

import { RegisterForm } from "@/features/identity/components/register-form";

export const metadata: Metadata = {
  title: "Đăng ký",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
