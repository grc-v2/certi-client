"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { clientEnv } from "@/config/env";
import { useCurrentUser, useLogout } from "@/features/identity/hooks/use-auth";
import type { AuthUser } from "@/lib/auth/user-store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Bảng điều khiển" },
  { href: "/certifications", label: "Chứng chỉ" },
  { href: "/blog", label: "Bài viết" },
];

function getInitials(user: AuthUser): string {
  const source = user.fullName || user.username || user.email || "?";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getAvatarUrl(user: AuthUser): string | null | undefined {
  if ("avatar" in user) return user.avatar;
  if ("avatarUrl" in user) return user.avatarUrl;
  return null;
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useCurrentUser();
  const logoutMutation = useLogout();
  const user = data?.user;

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    router.replace("/login");
  }

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          {clientEnv.NEXT_PUBLIC_APP_NAME}
        </Link>
        <nav className="hidden items-center gap-4 text-sm sm:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors",
                  active && "text-foreground font-medium",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/profile"
                className="hover:bg-muted flex items-center gap-2 rounded-full px-2 py-1"
              >
                <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center overflow-hidden rounded-full text-xs font-semibold">
                  {getAvatarUrl(user) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getAvatarUrl(user) ?? undefined}
                      alt={user.fullName || user.username}
                      className="size-full object-cover"
                    />
                  ) : (
                    getInitials(user)
                  )}
                </span>
                <span className="hidden text-sm sm:inline">{user.fullName || user.username}</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Đang thoát..." : "Đăng xuất"}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" render={<Link href="/login" />}>
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
