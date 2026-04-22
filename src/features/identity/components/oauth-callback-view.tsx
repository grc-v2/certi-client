"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { tokenStore } from "@/lib/api";
import { authStore } from "@/lib/auth/user-store";

import { getCurrentUser } from "../api/auth";
import { AUTH_QUERY_KEY } from "../hooks/use-auth";

const ERROR_MESSAGES: Record<string, string> = {
  oauth_denied: "Bạn đã từ chối cấp quyền cho ứng dụng.",
  invalid_state: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
};

type Status = "pending" | "error";

export function OAuthCallbackView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>("pending");
  const [message, setMessage] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const error = searchParams.get("error");
    if (error) {
      setStatus("error");
      setMessage(ERROR_MESSAGES[error] ?? "Đăng nhập thất bại. Vui lòng thử lại.");
      return;
    }

    const accessToken = searchParams.get("accessToken");
    if (!accessToken) {
      setStatus("error");
      setMessage("Không nhận được token từ máy chủ. Vui lòng thử lại.");
      return;
    }

    tokenStore.set(accessToken);

    getCurrentUser()
      .then((data) => {
        authStore.setSession(data.user, Array.from(data.permissions ?? []));
        queryClient.setQueryData(AUTH_QUERY_KEY, data);
        router.replace("/dashboard");
      })
      .catch(() => {
        tokenStore.clear();
        authStore.clear();
        setStatus("error");
        setMessage("Không thể xác thực phiên đăng nhập.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="border-border bg-card flex w-full max-w-md flex-col gap-4 rounded-2xl border p-8 text-center shadow-sm">
        {status === "pending" ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Đang đăng nhập...</h1>
            <p className="text-muted-foreground text-sm">Vui lòng chờ trong giây lát.</p>
          </>
        ) : (
          <>
            <h1 className="text-destructive text-2xl font-semibold tracking-tight">
              Đăng nhập thất bại
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
