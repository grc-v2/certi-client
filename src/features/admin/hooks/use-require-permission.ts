"use client";

import { useCurrentUser } from "@/features/identity/hooks/use-auth";
import { useAuthStore } from "@/lib/auth/user-store";

export const ADMIN_ROLE_CODE = "ADMIN";

export interface PermissionCheckResult {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasAccess: boolean;
  missingReason: "loading" | "unauthenticated" | "forbidden" | null;
}

export function useRequirePermission(
  opts: { role?: string; permission?: string } = {},
): PermissionCheckResult {
  const { role, permission } = opts;
  const { data, isLoading, isFetching, isError } = useCurrentUser();
  const cachedPermissions = useAuthStore((s) => s.permissions);

  if (isLoading || isFetching) {
    return { isLoading: true, isAuthenticated: false, hasAccess: false, missingReason: "loading" };
  }

  const user = data?.user;
  if (!user || isError) {
    return {
      isLoading: false,
      isAuthenticated: false,
      hasAccess: false,
      missingReason: "unauthenticated",
    };
  }

  const roleCodes = user.roles?.map((r) => r.code) ?? [];
  const permissions = data?.permissions ?? cachedPermissions;

  const roleOk = role ? roleCodes.includes(role) : true;
  const permOk = permission ? permissions.includes(permission) : true;

  if (!roleOk || !permOk) {
    return {
      isLoading: false,
      isAuthenticated: true,
      hasAccess: false,
      missingReason: "forbidden",
    };
  }

  return { isLoading: false, isAuthenticated: true, hasAccess: true, missingReason: null };
}
