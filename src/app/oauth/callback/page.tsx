import type { Metadata } from "next";
import { Suspense } from "react";

import { OAuthCallbackView } from "@/features/identity/components/oauth-callback-view";

export const metadata: Metadata = {
  title: "Đang đăng nhập",
};

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackView />
    </Suspense>
  );
}
