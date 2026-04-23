"use client";

import { cn } from "@/lib/utils";

import type { NotificationDto } from "../types/notification";

const CATEGORY_LABEL: Record<string, string> = {
  ACCOUNT: "Tài khoản",
  STUDY_PLAN: "Kế hoạch học",
  MOCK_EXAM: "Thi thử",
  PROGRESS: "Tiến độ",
  SOCIAL: "Cộng đồng",
  MARKETING: "Tin tức",
  SYSTEM: "Hệ thống",
};

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  const now = Date.now();
  const diff = Math.floor((now - date.getTime()) / 1000);
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

interface NotificationItemProps {
  notification: NotificationDto;
  onRead: (id: number) => void;
  onDismiss: (id: number) => void;
}

export function NotificationItem({ notification, onRead, onDismiss }: NotificationItemProps) {
  const unread = !notification.isRead;

  function handleClick() {
    if (unread) onRead(notification.id);
    if (notification.actionUrl) window.open(notification.actionUrl, "_self");
  }

  return (
    <div
      className={cn(
        "group relative flex gap-3 px-4 py-3 transition-colors",
        unread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50",
      )}
    >
      {unread ? (
        <span className="bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" />
      ) : (
        <span className="mt-1.5 h-2 w-2 flex-shrink-0" />
      )}

      <button
        type="button"
        className="flex flex-1 flex-col gap-0.5 text-left"
        onClick={handleClick}
      >
        <p className={cn("text-sm leading-snug", unread && "font-semibold")}>
          {notification.title}
        </p>
        <p className="text-muted-foreground line-clamp-2 text-xs">{notification.body}</p>
        <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-[0.65rem]">
          <span>{formatRelativeTime(notification.createdAt)}</span>
          <span className="bg-muted rounded-full px-1.5 py-0.5">
            {CATEGORY_LABEL[notification.category] ?? notification.category}
          </span>
        </div>
      </button>

      <button
        type="button"
        aria-label="Xoá thông báo"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification.id);
        }}
        className="text-muted-foreground hover:text-foreground invisible mt-0.5 self-start opacity-0 transition-opacity group-hover:visible group-hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
