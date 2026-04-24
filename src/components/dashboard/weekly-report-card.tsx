'use client'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Clock, HelpCircle } from 'lucide-react'
import { progressApi } from '@/lib/api/progress'
import { formatDate } from '@/lib/utils'

interface WeeklyReportCardProps {
  certificationId?: number
}

export function WeeklyReportCard({ certificationId }: WeeklyReportCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['weekly-reports', certificationId],
    queryFn: () => progressApi.getWeeklyReports(certificationId!, 0, 10),
    enabled: !!certificationId,
  })

  const latest = data?.content?.[0]

  const h = latest ? Math.floor(latest.totalStudyMinutes / 60) : 0
  const m = latest ? latest.totalStudyMinutes % 60 : 0

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-500" />
          Báo cáo tuần này
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />)}
          </div>
        ) : latest ? (
          <>
            <p className="text-[11px] text-slate-400">
              {formatDate(latest.weekStartDate)} – {formatDate(latest.weekEndDate)}
            </p>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-[#0A66C2]" />
                Thời gian học
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {h > 0 ? `${h}g ` : ''}{m}ph
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <HelpCircle className="w-4 h-4 text-[#22C55E]" />
                Luyện tập
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {latest.totalPracticeQuestions} phiên
              </span>
            </div>
            {latest.summary && (
              <p className="text-xs text-slate-500 pt-1">{latest.summary}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">Chưa có dữ liệu tuần này</p>
        )}
      </CardContent>
    </Card>
  )
}
