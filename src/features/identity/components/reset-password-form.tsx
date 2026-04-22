"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { applyApiErrorToForm } from "@/lib/api/errors";

import { useResetPassword } from "../hooks/use-auth";
import { resetPasswordSchema, type ResetPasswordInput } from "../schemas/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [topLevelError, setTopLevelError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, newPassword: "", confirmPassword: "" },
  });

  const resetMutation = useResetPassword();

  async function onSubmit(values: ResetPasswordInput) {
    setTopLevelError(null);
    try {
      await resetMutation.mutateAsync({
        token: values.token,
        newPassword: values.newPassword,
      });
      toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
      router.push("/login");
    } catch (error) {
      setTopLevelError(applyApiErrorToForm(error, setError));
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Liên kết không hợp lệ</h1>
        <p className="text-muted-foreground text-sm">
          Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
        </p>
        <Link href="/forgot-password" className="text-primary text-sm hover:underline">
          Yêu cầu liên kết mới
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Đặt lại mật khẩu</h1>
        <p className="text-muted-foreground text-sm">Chọn mật khẩu mới cho tài khoản.</p>
      </header>

      {topLevelError ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {topLevelError}
        </div>
      ) : null}

      <input type="hidden" {...register("token")} />

      <FormField
        label="Mật khẩu mới"
        htmlFor="newPassword"
        error={errors.newPassword?.message}
        hint="Ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt."
      >
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          autoFocus
          aria-invalid={errors.newPassword ? "true" : undefined}
          {...register("newPassword")}
        />
      </FormField>

      <FormField
        label="Xác nhận mật khẩu"
        htmlFor="confirmPassword"
        error={errors.confirmPassword?.message}
      >
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.confirmPassword ? "true" : undefined}
          {...register("confirmPassword")}
        />
      </FormField>

      <Button type="submit" disabled={resetMutation.isPending}>
        {resetMutation.isPending ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
      </Button>
    </form>
  );
}
