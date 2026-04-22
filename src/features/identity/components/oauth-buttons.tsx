"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { getOauthAuthorizeUrl } from "../api/auth";

type Provider = "google" | "github";

const OAUTH_STATE_KEY = "certi_oauth_state";

function getRedirectUri(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/oauth/callback`;
}

export function OAuthButtons({ disabled }: { disabled?: boolean }) {
  const [pending, setPending] = useState<Provider | null>(null);

  async function start(provider: Provider) {
    try {
      setPending(provider);
      const { url, state } = await getOauthAuthorizeUrl(provider, getRedirectUri());
      sessionStorage.setItem(OAUTH_STATE_KEY, state);
      window.location.href = url;
    } catch {
      toast.error(`Không thể kết nối với ${provider}. Vui lòng thử lại.`);
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={disabled || pending !== null}
        onClick={() => start("google")}
      >
        {pending === "google" ? "Đang chuyển hướng..." : "Tiếp tục với Google"}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={disabled || pending !== null}
        onClick={() => start("github")}
      >
        {pending === "github" ? "Đang chuyển hướng..." : "Tiếp tục với GitHub"}
      </Button>
    </div>
  );
}
