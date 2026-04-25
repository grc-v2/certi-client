"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import {
  ADMIN_ROLE_CODE,
  useRequirePermission,
} from "@/features/admin/hooks/use-require-permission";

interface RoleGuardProps {
  children: ReactNode;
  role?: string;
  permission?: string;
  fallback?: ReactNode;
}

export function RoleGuard({
  children,
  role = ADMIN_ROLE_CODE,
  permission,
  fallback,
}: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const check = useRequirePermission({ role, permission });

  useEffect(() => {
    if (check.missingReason === "unauthenticated") {
      const returnTo = encodeURIComponent(pathname || "/admin");
      router.replace(`/login?returnTo=${returnTo}`);
    } else if (check.missingReason === "forbidden") {
      router.replace("/access-denied");
    }
  }, [check.missingReason, pathname, router]);

  if (check.hasAccess) return <>{children}</>;

  return (
    <>
      {fallback ?? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-muted-foreground text-sm">Đang kiểm tra quyền truy cập…</div>
        </div>
      )}
    </>
  );
}
