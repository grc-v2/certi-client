import Link from "next/link";
import type { ReactNode } from "react";

import { clientEnv } from "@/config/env";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="text-xl font-semibold tracking-tight hover:underline">
            {clientEnv.NEXT_PUBLIC_APP_NAME}
          </Link>
          <p className="text-muted-foreground text-sm">Nền tảng luyện thi chứng chỉ</p>
        </div>
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
