"use client";

import {
  BarChart3,
  BookOpen,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AdminNavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV: AdminNavItem[] = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/certifications", label: "Chứng chỉ", icon: BookOpen },
  { href: "/admin/questions", label: "Ngân hàng câu hỏi", icon: FileText },
  { href: "/admin/notifications", label: "Thông báo", icon: MessageSquare },
  { href: "/admin/audit", label: "Nhật ký hoạt động", icon: Shield },
  { href: "/admin/analytics", label: "Thống kê", icon: BarChart3 },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full">
      <aside className="border-border bg-background sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r md:block">
        <div className="border-border border-b px-4 py-3 text-xs font-semibold tracking-wide uppercase">
          Quản trị
        </div>
        <nav className="flex flex-col gap-0.5 p-2">
          {NAV.map((item) => {
            const active =
              item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 px-6 py-6">{children}</main>
    </div>
  );
}
