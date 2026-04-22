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

import { useLogin } from "../hooks/use-auth";
import { loginSchema, type LoginInput } from "../schemas/auth";

import { OAuthButtons } from "./oauth-buttons";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [topLevelError, setTopLevelError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", rememberMe: false },
  });

  const loginMutation = useLogin();

  async function onSubmit(values: LoginInput) {
    setTopLevelError(null);
    try {
      await loginMutation.mutateAsync(values);
      toast.success("Đăng nhập thành công");
      router.push(next);
    } catch (error) {
      setTopLevelError(applyApiErrorToForm(error, setError));
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
        <p className="text-muted-foreground text-sm">
          Chào mừng trở lại. Hãy tiếp tục hành trình luyện thi.
        </p>
      </header>

      <OAuthButtons disabled={loginMutation.isPending} />

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

      <FormField
        label="Tên đăng nhập hoặc email"
        htmlFor="username"
        error={errors.username?.message}
      >
        <Input
          id="username"
          autoComplete="username"
          autoFocus
          aria-invalid={errors.username ? "true" : undefined}
          {...register("username")}
        />
      </FormField>

      <FormField label="Mật khẩu" htmlFor="password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.password ? "true" : undefined}
          {...register("password")}
        />
      </FormField>

      <div className="flex items-center justify-between text-sm">
        <label className="text-muted-foreground flex items-center gap-2">
          <input
            type="checkbox"
            className="border-input size-4 rounded"
            {...register("rememberMe")}
          />
          Ghi nhớ đăng nhập
        </label>
        <Link href="/forgot-password" className="text-primary hover:underline">
          Quên mật khẩu?
        </Link>
      </div>

      <Button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
