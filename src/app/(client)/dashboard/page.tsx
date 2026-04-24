'use client'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import {
  TrendingUp, Flame, Target, Calendar,
  CheckCircle, BookOpen, BarChart3, GraduationCap, ArrowUp, ArrowDown, Minus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { progressApi } from '@/lib/api/progress'
import { studyPlansApi } from '@/lib/api/study-plans'
import { StudyHeatmap } from '@/components/dashboard/study-heatmap'
import { ReadinessTrendChart } from '@/components/dashboard/readiness-trend-chart'
import { WeeklyReportCard } from '@/components/dashboard/weekly-report-card'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { cn } from '@/lib/utils'

const TREND_ICON = {
  UP:     <ArrowUp className="w-3.5 h-3.5 text-[#22C55E]" />,
  DOWN:   <ArrowDown className="w-3.5 h-3.5 text-red-500" />,
  STABLE: <Minus className="w-3.5 h-3.5 text-slate-400" />,
}

export default function DashboardPage() {
  const [certificationId, setCertificationId] = useState<number | undefined>(undefined)

  // Fetch active study plans for the selector
  const { data: plansData } = useQuery({
    queryKey: ['study-plans'],
    queryFn: studyPlansApi.getAll,
  })
  const plans = plansData?.items ?? []

  // Auto-select first certification once plans load
  useEffect(() => {
    if (plans.length > 0 && certificationId === undefined) {
      setCertificationId(plans[0].certification.id)
    }
  }, [plans, certificationId])

  // Heatmap date range: last 90 days
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard', certificationId],
    queryFn: () => progressApi.getDashboard(certificationId!),
    enabled: !!certificationId,
  })
  const { data: heatmap } = useQuery({
    queryKey: ['heatmap', certificationId, startDate],
    queryFn: () => progressApi.getHeatmap(certificationId!, startDate, endDate),
    enabled: !!certificationId,
  })

  // Study streak from streaks array
  const studyStreak = dashboard?.streaks?.find(s => s.streakType === 'STUDY')
  const currentStreak = studyStreak?.currentStreak ?? 0

  const stats = [
    {
      label: 'Streak học tập',
      value: currentStreak,
      unit: 'ngày',
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      label: 'Điểm sẵn sàng',
      value: Math.round(dashboard?.readinessScore ?? 0),
      unit: '%',
      icon: Target,
      color: 'text-[#0A66C2]',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Ngày đã học',
      value: dashboard?.totalStudyDays ?? 0,
      unit: 'ngày',
      icon: BookOpen,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      label: 'Còn đến ngày thi',
      value: dashboard?.daysUntilExam ?? '--',
      unit: typeof dashboard?.daysUntilExam === 'number' ? 'ngày' : '',
      icon: Calendar,
      color: 'text-[#22C55E]',
      bg: 'bg-green-50 dark:bg-green-950/30',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Tổng quan tiến độ học tập của bạn</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {currentStreak > 0 && (
            <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />{currentStreak} ngày streak
            </Badge>
          )}
          {plans.length > 0 && (
            <Select
              value={certificationId?.toString() ?? ''}
              onValueChange={v => setCertificationId(Number(v))}
            >
              <SelectTrigger className="w-full sm:w-64 h-8 text-sm cursor-pointer gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {plans.map(p => (
                  <SelectItem key={p.id} value={p.certification.id.toString()}>
                    {p.certification.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    {isLoading ? (
                      <div className="h-7 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                        {stat.unit && <span className="text-sm text-slate-500">{stat.unit}</span>}
                      </>
                    )}
                  </div>
                </div>
                <div className={cn('p-2 rounded-lg', stat.bg)}>
                  <stat.icon className={cn('w-5 h-5', stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Readiness + Plan completion */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#0A66C2]" />Điểm sẵn sàng thi
              </CardTitle>
              <span className="text-2xl font-bold text-[#0A66C2]">{Math.round(dashboard?.readinessScore ?? 0)}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={dashboard?.readinessScore ?? 0} className="h-2.5" />
            <p className="text-xs text-slate-500 mt-2">
              {(dashboard?.readinessScore ?? 0) >= 80 ? 'Bạn đã sẵn sàng thi!' : 'Cần đạt 80% để sẵn sàng'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#22C55E]" />Hoàn thành kế hoạch
              </CardTitle>
              <span className="text-2xl font-bold text-[#22C55E]">{Math.round(dashboard?.planCompletionPct ?? 0)}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={dashboard?.planCompletionPct ?? 0} className="h-2.5 [&>div]:bg-[#22C55E]" />
            <p className="text-xs text-slate-500 mt-2">Tiến độ so với kế hoạch học</p>
          </CardContent>
        </Card>
      </div>

      {/* Mock exam summary */}
      {dashboard?.mockSummary && dashboard.mockSummary.totalAttempts > 0 && (
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />Kết quả thi thử
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Lần thi', value: `${dashboard.mockSummary.totalAttempts}` },
                { label: 'Điểm gần nhất', value: `${dashboard.mockSummary.latestScore.toFixed(0)}%` },
                { label: 'Điểm tốt nhất', value: `${dashboard.mockSummary.bestScore.toFixed(0)}%` },
                { label: 'Điểm trung bình', value: `${dashboard.mockSummary.averageScore.toFixed(0)}%` },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{item.value}</p>
                  <p className="text-xs text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-1 mt-3 text-xs text-slate-500">
              Xu hướng {TREND_ICON[dashboard.mockSummary.trend]}
              <span className={cn(
                dashboard.mockSummary.trend === 'UP' ? 'text-[#22C55E]' :
                dashboard.mockSummary.trend === 'DOWN' ? 'text-red-500' : 'text-slate-400'
              )}>
                {dashboard.mockSummary.trend === 'UP' ? 'Đang tăng' :
                 dashboard.mockSummary.trend === 'DOWN' ? 'Đang giảm' : 'Ổn định'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Domain progress */}
      {dashboard?.domainProgress && dashboard.domainProgress.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0A66C2]" />Tiến độ theo Domain
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.domainProgress.map(d => (
              <div key={d.domainId}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate mr-4">{d.domainName}</span>
                  <span className="text-slate-500 flex-shrink-0">{d.accuracy.toFixed(0)}% accuracy · {d.questionsAttempted} câu</span>
                </div>
                <Progress value={d.currentScore} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StudyHeatmap data={heatmap ?? []} />
          <ReadinessTrendChart certificationId={certificationId} />
        </div>
        <div className="space-y-6">
          <WeeklyReportCard certificationId={certificationId} />
          <ActivityFeed
            certificationId={certificationId}
            activities={dashboard?.recentActivities}
          />
        </div>
      </div>
    </div>
  )
}
