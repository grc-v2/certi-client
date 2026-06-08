'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Filter, GraduationCap, MessageSquare, Target, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { notificationsApi, type NotificationResponse } from '@/lib/api/notifications'
import { formatRelativeTime, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/lib/constants'

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  EXAM_RESULT: GraduationCap,
  COMMENT: MessageSquare,
  MILESTONE: Target,
  BROADCAST: Megaphone,
}

const NOTIFICATION_COLORS: Record<string, string> = {
  EXAM_RESULT: 'bg-[#22C55E]/10 text-[#22C55E]',
  COMMENT: 'bg-primary/10 text-primary',
  MILESTONE: 'bg-yellow-500/10 text-yellow-500',
  BROADCAST: 'bg-purple-500/10 text-purple-500',
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.NOTIFICATIONS, filter],
    queryFn: () => notificationsApi.getAll({ unreadOnly: filter === 'unread' }),
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS }),
  })
  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS }); toast.success('Đã đánh dấu tất cả là đã đọc') },
  })

  const notifications: NotificationResponse[] = data?.content ?? []
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Thông báo
          </h1>
          {unreadCount > 0 && <p className="text-slate-500 mt-1">{unreadCount} chưa đọc</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()} disabled={markAllReadMutation.isPending} className="cursor-pointer">
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
        <TabsList>
          <TabsTrigger value="all" className="cursor-pointer">Tất cả</TabsTrigger>
          <TabsTrigger value="unread" className="cursor-pointer">
            Chưa đọc {unreadCount > 0 && <Badge className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0">{unreadCount}</Badge>}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />)}</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map(notif => {
            const Icon = NOTIFICATION_ICONS[notif.type] ?? Bell
            const colors = NOTIFICATION_COLORS[notif.type] ?? 'bg-slate-100 text-slate-500'
            return (
              <button
                key={notif.id}
                onClick={() => !notif.read && markReadMutation.mutate(notif.id)}
                className={cn(
                  'w-full text-left rounded-xl p-4 transition-all duration-200 cursor-pointer',
                  notif.read ? 'bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800' : 'bg-primary/5 dark:bg-primary/10 border border-primary/20'
                )}
              >
                <div className="flex gap-3">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', colors)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm font-medium line-clamp-1', notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white')}>
                        {notif.title}
                      </p>
                      {!notif.read && <div className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Không có thông báo nào</p>
        </div>
      )}
    </div>
  )
}
