"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";

import { useVerifyEmail } from "../hooks/use-auth";

type Status = "pending" | "success" | "error";

export function VerifyEmailView() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<Status>("pending");
  const [message, setMessage] = useState<string | null>(null);
  const verifyMutation = useVerifyEmail();
  const ranRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Liên kết xác thực không hợp lệ.");
      return;
    }
    if (ranRef.current) return;
    ranRef.current = true;

    verifyMutation
      .mutateAsync(token)
      .then(() => {
        setStatus("success");
        setMessage("Email của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.");
      })
      .catch((error: unknown) => {
        setStatus("error");
        const detail =
          error instanceof ApiError
            ? (error.problem.detail ?? error.problem.title)
            : "Không thể xác thực email. Liên kết có thể đã hết hạn.";
        setMessage(detail);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="border-border bg-card flex w-full max-w-md flex-col gap-4 rounded-2xl border p-8 text-center shadow-sm">
        {status === "pending" ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Đang xác thực...</h1>
            <p className="text-muted-foreground text-sm">Vui lòng chờ trong giây lát.</p>
          </>
        ) : status === "success" ? (
          <>
            <h1 className="text-primary text-2xl font-semibold tracking-tight">
              Xác thực thành công
            </h1>
            <p className="text-muted-foreground text-sm">{message}</p>
            <Button render={<Link href="/login" />}>Đăng nhập</Button>
          </>
        ) : (
          <>
            <h1 className="text-destructive text-2xl font-semibold tracking-tight">
              Xác thực thất bại
            </h1>
            <p className="text-muted-foreground text-sm">{message}</p>
            <Button variant="outline" render={<Link href="/login" />}>
              Quay lại đăng nhập
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
