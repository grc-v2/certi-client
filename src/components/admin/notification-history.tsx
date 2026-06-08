'use client'
import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { notificationsApi } from '@/lib/api/notifications'
import { formatRelativeTime } from '@/lib/utils'

export function NotificationHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-notification-history'],
    queryFn: () => notificationsApi.getAll({ page: 0, size: 50 }),
  })

  const notifications = data?.content ?? []

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return <p className="text-center py-8 text-slate-500 text-sm">Chưa có lịch sử thông báo</p>
  }

  return (
    <div className="space-y-2 max-w-2xl">
      {notifications.map(n => (
        <Card key={n.id} className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-3 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-slate-900 dark:text-white">{n.title}</p>
              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">{n.type}</Badge>
                <span className="text-xs text-slate-400">{formatRelativeTime(n.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
