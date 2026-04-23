"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { useUnreadCount } from "../hooks/use-notifications";

import { NotificationPanel } from "./notification-panel";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Thông báo${count > 0 ? ` (${count} chưa đọc)` : ""}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "hover:bg-muted relative flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          open && "bg-muted",
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {count > 0 ? (
          <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.6rem] leading-none font-bold">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>

      {open ? <NotificationPanel onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
