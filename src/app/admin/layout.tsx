import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { RoleGuard } from "@/features/admin/components/role-guard";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s · Quản trị" },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <RoleGuard>
        <AdminShell>{children}</AdminShell>
      </RoleGuard>
    </div>
  );
}
