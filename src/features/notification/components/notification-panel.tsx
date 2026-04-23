"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

import {
  useDismissNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from "../hooks/use-notifications";

import { NotificationItem } from "./notification-item";

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useNotifications({ size: 20 });
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const dismiss = useDismissNotification();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const notifications = data?.content ?? [];
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div
      ref={panelRef}
      className="border-border bg-background absolute top-full right-0 z-50 mt-2 flex w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border shadow-lg"
    >
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Thông báo</h2>
        {hasUnread ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        ) : null}
      </header>

      <div className="max-h-[28rem] divide-y overflow-y-auto">
        {isLoading ? (
          <p className="text-muted-foreground px-4 py-8 text-center text-sm">Đang tải...</p>
        ) : notifications.length === 0 ? (
          <p className="text-muted-foreground px-4 py-8 text-center text-sm">
            Bạn chưa có thông báo nào.
          </p>
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onRead={(id) => markAsRead.mutate(id)}
              onDismiss={(id) => dismiss.mutate(id)}
            />
          ))
        )}
      </div>

      {notifications.length > 0 && !data?.last ? (
        <footer className="border-t px-4 py-2 text-center">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Xem tất cả
          </Button>
        </footer>
      ) : null}
    </div>
  );
}
