import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Không có quyền truy cập" };

export default function AccessDeniedPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="bg-destructive/10 text-destructive inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
        403
      </div>
      <h1 className="text-2xl font-semibold">Bạn không có quyền truy cập</h1>
      <p className="text-muted-foreground text-sm">
        Tài khoản của bạn không được cấp quyền xem trang này. Nếu bạn cho rằng đây là nhầm lẫn, hãy
        liên hệ quản trị viên.
      </p>
      <Button render={<Link href="/dashboard" />}>Về trang chính</Button>
    </div>
  );
}
