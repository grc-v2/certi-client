'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Trophy, Clock, Target, TrendingUp, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Filter, GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { resultsApi, type HistoryResultItem, type HistoryParams } from '@/lib/api/results'
import { useAuthStore } from '@/store/auth-store'
import { formatDate, cn } from '@/lib/utils'

const PAGE_SIZE = 10

function formatSeconds(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}g ${m}ph`
  return `${m}ph`
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string
}) {
  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{value}</p>
            {sub && <p className="text-xs text-slate-400">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function HistoryCard({ item }: { item: HistoryResultItem }) {
  const passed = item.status === 'PASSED'
  return (
    <Link href={`/learn/results/${item.resultId}`} className="block cursor-pointer group">
      <Card className="border-slate-200 dark:border-slate-700 hover:border-[#0A66C2]/40 hover:shadow-sm transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              passed ? 'bg-[#22C55E]/10' : 'bg-red-500/10',
            )}>
              {passed
                ? <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                : <XCircle className="w-5 h-5 text-red-500" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-[#0A66C2] transition-colors truncate">
                    {item.examTitle}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{item.certificationName}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={cn(
                    'text-xl font-bold leading-tight',
                    passed ? 'text-[#22C55E]' : 'text-red-500',
                  )}>
                    {item.percentage.toFixed(0)}%
                  </span>
                  <Badge className={cn(
                    'text-xs',
                    passed
                      ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20'
                      : 'bg-red-500/10 text-red-500 border-red-500/20',
                  )}>
                    {passed ? 'Đỗ' : 'Trượt'}
                  </Badge>
                </div>
              </div>

              <Progress
                value={item.percentage}
                className={cn('h-1.5 mt-2', passed ? '[&>div]:bg-[#22C55E]' : '[&>div]:bg-red-400')}
              />

              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                  {item.correctAnswers}/{item.totalQuestions} câu đúng
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />{formatSeconds(item.timeSpent)}
                </span>
                <span>Lần {item.attemptNumber}</span>
                <span>{formatDate(item.completedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function ExamHistoryPage() {
  const { user } = useAuthStore()
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<'PASSED' | 'FAILED' | ''>('')

  const params: HistoryParams = {
    page,
    size: PAGE_SIZE,
    sort: 'completedAt,desc',
    ...(status ? { status } : {}),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['exam-history', user?.id, params],
    queryFn: () => resultsApi.getHistory(user!.id, params),
    enabled: !!user?.id,
  })

  const stats    = data?.statistics
  const results  = (data?.results ?? []).filter(r => r.examType === 'MOCK')
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#0A66C2]" />
            Lịch sử thi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {stats ? `${stats.totalExams} lần thi` : 'Đang tải...'}
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Target}     label="Tổng số lần thi" value={String(stats.totalExams)}          color="bg-[#0A66C2]" />
          <StatCard icon={TrendingUp} label="Tỉ lệ đỗ"        value={`${stats.passRate.toFixed(0)}%`}  color="bg-[#22C55E]"
            sub={`${stats.totalPassed}/${stats.totalExams}`} />
          <StatCard icon={Trophy}     label="Điểm TB"          value={`${stats.averageScore.toFixed(0)}%`} color="bg-purple-500"
            sub={`Cao nhất: ${stats.bestScore.toFixed(0)}%`} />
          <StatCard icon={Clock}      label="Tổng thời gian"   value={formatSeconds(stats.totalTimeSpent)} color="bg-orange-500" />
        </div>
      )}

      {/* Certification breakdown */}
      {stats?.certifications?.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-[#0A66C2]" />Theo chứng chỉ
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.certifications.map(c => (
                <div key={c.certificationId} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-slate-700 dark:text-slate-300 truncate mr-4">{c.name}</span>
                  <div className="flex items-center gap-3 flex-shrink-0 text-xs text-slate-500">
                    <span>{c.exams} lần</span>
                    <span className="font-semibold text-[#0A66C2]">{c.averageScore.toFixed(0)}% TB</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <Select value={status} onValueChange={(v) => { setStatus((v ?? '') as typeof status); setPage(0) }}>
          <SelectTrigger className="w-full sm:w-40 cursor-pointer">
            <SelectValue placeholder="Tất cả kết quả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tất cả</SelectItem>
            <SelectItem value="PASSED">Đỗ</SelectItem>
            <SelectItem value="FAILED">Trượt</SelectItem>
          </SelectContent>
        </Select>
        {pagination && (
          <p className="text-xs text-slate-500 ml-auto">
            {pagination.totalElements} kết quả
          </p>
        )}
      </div>

      {/* Results list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          {results.map(item => <HistoryCard key={item.resultId} item={item} />)}
        </div>
      ) : (
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="py-12 text-center">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Chưa có lịch sử thi nào</p>
            <Link href="/certifications" className="mt-3 inline-block">
              <Button size="sm" className="bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer mt-3">
                Bắt đầu thi thử
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={pagination.first}
            className="cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />Trước
          </Button>
          <span className="text-sm text-slate-500">
            Trang {pagination.pageNumber + 1} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={pagination.last}
            className="cursor-pointer"
          >
            Sau<ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
