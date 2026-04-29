'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Plus, Target, Calendar, Clock, CheckCircle2,
  BookOpen, AlertCircle, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { studyPlansApi, type StudyPlanListItem, type StudyPlanListResponse } from '@/lib/api/study-plans'
import { examSessionsApi, type ActiveSessionResponse } from '@/lib/api/exam-sessions'
import { resultsApi, type HistoryResultItem } from '@/lib/api/results'
import { useAuthStore } from '@/store/auth-store'
import { formatDate, formatRelativeTime, cn } from '@/lib/utils'

function StudyPlanCard({ plan }: { plan: StudyPlanListItem }) {
  const daysLeft = plan.schedule.daysToExam
  const isOverdue = daysLeft < 0
  return (
    <Link href={`/learn/study-plans/${plan.id}`} className="block cursor-pointer group">
      <Card className="border-slate-200 dark:border-slate-700 hover:border-[#0A66C2]/40 hover:shadow-sm transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-[#0A66C2] transition-colors text-sm truncate">
                {plan.certification.name}
              </h3>
              <Badge variant="secondary" className={cn('text-xs mt-1', plan.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300')}>
                {plan.status === 'ACTIVE' ? 'Đang học' : plan.status}
              </Badge>
            </div>
            <div className={cn('text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0', isOverdue ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' : daysLeft <= 7 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300')}>
              {isOverdue ? `Quá ${-daysLeft}ngày` : `${daysLeft} ngày còn`}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Tiến độ</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{plan.progress.percent.toFixed(0)}%</span>
            </div>
            <Progress value={plan.progress.percent} className="h-1.5" />
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(plan.schedule.examDate)}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{plan.schedule.dailyStudyMinutes}ph/ngày</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{plan.milestones.achieved}/{plan.milestones.total}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ExamHistoryCard({ item }: { item: HistoryResultItem }) {
  const passed = item.status === 'PASSED'
  return (
    <Link href={`/learn/results/${item.resultId}`} className="block cursor-pointer group">
      <Card className="border-slate-200 dark:border-slate-700 hover:border-[#0A66C2]/40 hover:shadow-sm transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-slate-900 dark:text-white group-hover:text-[#0A66C2] transition-colors truncate">{item.examTitle}</p>
              <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(item.completedAt)}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={cn('text-lg font-bold', passed ? 'text-[#22C55E]' : 'text-red-500')}>{item.percentage.toFixed(0)}%</div>
              <div className={cn('text-xs font-medium', passed ? 'text-[#22C55E]' : 'text-red-500')}>{passed ? 'Đỗ' : 'Trượt'}</div>
            </div>
          </div>
          <Progress value={item.percentage} className={cn('h-1.5 mt-3', passed ? '[&>div]:bg-[#22C55E]' : '[&>div]:bg-red-500')} />
        </CardContent>
      </Card>
    </Link>
  )
}

export default function LearnPage() {
  const { user } = useAuthStore()

  const { data: plans, isLoading: plansLoading } = useQuery<StudyPlanListResponse>({
    queryKey: ['study-plans'],
    queryFn: studyPlansApi.getAll,
  })
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['exam-history', user?.id],
    queryFn: () => resultsApi.getHistory(user!.id, { page: 0, size: 10, sort: 'completedAt,desc' }),
    enabled: !!user?.id,
  })
  const { data: activeSessions } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: examSessionsApi.getActive,
  })

  const sessions: ActiveSessionResponse[] = (activeSessions as ActiveSessionResponse[]) ?? []
  const studyPlans: StudyPlanListItem[] = plans?.items ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Học tập</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Kế hoạch học và lịch sử thi</p>
        </div>
        <Link href="/certifications">
          <Button className="bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />Tạo kế hoạch mới
          </Button>
        </Link>
      </div>

      {/* Active sessions */}
      {sessions.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <p className="font-medium text-yellow-800 dark:text-yellow-300 text-sm flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4" />{sessions.length} bài thi đang chờ tiếp tục
          </p>
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between">
                <span className="text-sm text-yellow-700 dark:text-yellow-400">{s.examTitle}</span>
                <Link href={`/exam/${s.id}`}>
                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white cursor-pointer">Tiếp tục thi</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans" className="cursor-pointer">
            <Target className="w-3.5 h-3.5 mr-1.5" />Kế hoạch ({studyPlans.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="cursor-pointer">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />Lịch sử thi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-4">
          {plansLoading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />)}</div>
          ) : studyPlans.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {studyPlans.map(plan => <StudyPlanCard key={plan.id} plan={plan} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Chưa có kế hoạch học nào</p>
              <p className="text-sm mt-1 mb-4">Chọn chứng chỉ để tạo kế hoạch học</p>
              <Link href="/certifications"><Button className="bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer">Khám phá chứng chỉ</Button></Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {historyLoading ? (
            <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />)}</div>
          ) : history?.results?.length ? (
            <>
              {history.results.map(item => <ExamHistoryCard key={item.resultId} item={item} />)}
              <Link href="/learn/exam-history" className="block">
                <Button variant="ghost" size="sm" className="w-full text-[#0A66C2] cursor-pointer">
                  Xem toàn bộ lịch sử <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Chưa có lịch sử thi</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
