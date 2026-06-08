'use client'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, BookOpen, CheckCircle2, FileText, Target, RotateCcw } from 'lucide-react'
import { progressApi, type DashboardActivity } from '@/lib/api/progress'
import { formatDate } from '@/lib/utils'

const ACTIVITY_META: Record<string, { icon: typeof BookOpen; color: string; label: string }> = {
  TASK_COMPLETED:   { icon: CheckCircle2, color: 'text-[#22C55E] bg-green-50 dark:bg-green-950/30',    label: 'Hoàn thành task' },
  MOCK_COMPLETED:   { icon: FileText,     color: 'text-primary bg-blue-50 dark:bg-blue-950/30',      label: 'Thi thử' },
  STUDY_SESSION:    { icon: BookOpen,     color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30', label: 'Học tập' },
  PRACTICE_SESSION: { icon: RotateCcw,    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30', label: 'Luyện tập' },
  MILESTONE_REACHED:{ icon: Target,       color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30', label: 'Cột mốc' },
}

interface ActivityFeedProps {
  certificationId?: number
  activities?: DashboardActivity[]
}

export function ActivityFeed({ certificationId, activities: propActivities }: ActivityFeedProps) {
  const { data: fetchedActivities, isLoading } = useQuery({
    queryKey: ['activity-feed', certificationId],
    queryFn: () => progressApi.getActivityFeed(certificationId!, 0, 20),
    enabled: propActivities === undefined && !!certificationId,
  })

  const activities = propActivities ?? fetchedActivities ?? []

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Hoạt động gần đây
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-3">
            {activities.slice(0, 8).map((a, idx) => {
              const meta = ACTIVITY_META[a.activityType] ?? {
                icon: Activity,
                color: 'text-slate-500 bg-slate-50 dark:bg-slate-800',
                label: a.activityType,
              }
              const Icon = meta.icon
              return (
                <div key={idx} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{a.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {a.domainName && (
                        <span className="text-xs text-slate-500 truncate">{a.domainName}</span>
                      )}
                      {a.durationMinutes > 0 && (
                        <span className="text-[11px] text-slate-400 flex-shrink-0">{a.durationMinutes}ph</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(a.activityDate)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">Chưa có hoạt động nào</p>
        )}
      </CardContent>
    </Card>
  )
}
