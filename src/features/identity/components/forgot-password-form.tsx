"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { applyApiErrorToForm } from "@/lib/api/errors";

import { useForgotPassword } from "../hooks/use-auth";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../schemas/auth";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [topLevelError, setTopLevelError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const forgotMutation = useForgotPassword();

  async function onSubmit(values: ForgotPasswordInput) {
    setTopLevelError(null);
    try {
      await forgotMutation.mutateAsync(values.email);
      setSubmitted(true);
    } catch (error) {
      setTopLevelError(applyApiErrorToForm(error, setError));
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Kiểm tra hộp thư</h1>
        <p className="text-muted-foreground text-sm">
          Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Hãy kiểm
          tra hộp thư đến (và thư mục spam).
        </p>
        <Link href="/login" className="text-primary text-sm hover:underline">
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Quên mật khẩu</h1>
        <p className="text-muted-foreground text-sm">
          Nhập email của bạn — chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
        </p>
      </header>

      {topLevelError ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {topLevelError}
        </div>
      ) : null}

      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          aria-invalid={errors.email ? "true" : undefined}
          {...register("email")}
        />
      </FormField>

      <Button type="submit" disabled={forgotMutation.isPending}>
        {forgotMutation.isPending ? "Đang gửi..." : "Gửi liên kết đặt lại"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
