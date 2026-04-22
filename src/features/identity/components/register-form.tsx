"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { applyApiErrorToForm } from "@/lib/api/errors";

import { useRegister } from "../hooks/use-auth";
import { registerSchema, type RegisterInput } from "../schemas/auth";

import { OAuthButtons } from "./oauth-buttons";

export function RegisterForm() {
  const router = useRouter();
  const [topLevelError, setTopLevelError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegister();

  async function onSubmit(values: RegisterInput) {
    setTopLevelError(null);
    try {
      await registerMutation.mutateAsync({
        email: values.email,
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone || undefined,
        acceptTerms: true,
      });
      toast.success("Đăng ký thành công. Vui lòng kiểm tra email để xác thực.");
      router.push(`/login?registered=1`);
    } catch (error) {
      setTopLevelError(applyApiErrorToForm(error, setError));
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Tạo tài khoản</h1>
        <p className="text-muted-foreground text-sm">
          Bắt đầu hành trình luyện thi chứng chỉ của bạn.
        </p>
      </header>

      <OAuthButtons disabled={registerMutation.isPending} />

      <div className="text-muted-foreground flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" />
        <span>hoặc</span>
        <span className="bg-border h-px flex-1" />
      </div>

      {topLevelError ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {topLevelError}
        </div>
      ) : null}

      <FormField label="Họ và tên" htmlFor="fullName" error={errors.fullName?.message}>
        <Input
          id="fullName"
          autoComplete="name"
          aria-invalid={errors.fullName ? "true" : undefined}
          {...register("fullName")}
        />
      </FormField>

      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? "true" : undefined}
          {...register("email")}
        />
      </FormField>

      <FormField
        label="Tên đăng nhập"
        htmlFor="username"
        error={errors.username?.message}
        hint="3-50 ký tự, gồm chữ, số, gạch dưới hoặc gạch ngang."
      >
        <Input
          id="username"
          autoComplete="username"
          aria-invalid={errors.username ? "true" : undefined}
          {...register("username")}
        />
      </FormField>

      <FormField label="Số điện thoại (tuỳ chọn)" htmlFor="phone" error={errors.phone?.message}>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={errors.phone ? "true" : undefined}
          {...register("phone")}
        />
      </FormField>

      <FormField
        label="Mật khẩu"
        htmlFor="password"
        error={errors.password?.message}
        hint="Ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt."
      >
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.password ? "true" : undefined}
          {...register("password")}
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

      <label className="text-muted-foreground flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="border-input mt-0.5 size-4 rounded"
          {...register("acceptTerms")}
        />
        <span>
          Tôi đồng ý với{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Điều khoản sử dụng
          </Link>{" "}
          và{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Chính sách bảo mật
          </Link>
          .
        </span>
      </label>
      {errors.acceptTerms ? (
        <p className="text-destructive -mt-3 text-xs">{errors.acceptTerms.message}</p>
      ) : null}

      <Button type="submit" disabled={registerMutation.isPending}>
        {registerMutation.isPending ? "Đang tạo tài khoản..." : "Đăng ký"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
