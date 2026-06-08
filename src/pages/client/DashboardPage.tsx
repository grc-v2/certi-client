'use client'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  BarChart3, ChevronRight, Activity, BookOpen, Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { resultsApi } from '@/lib/api/results'
import { examSessionsApi } from '@/lib/api/exam-sessions'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'

// Import new dashboard components
import { CertHero } from '@/components/dashboard/cert-hero'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { DomainsBreakdown } from '@/components/dashboard/domains-breakdown'
import { PracticeModes } from '@/components/dashboard/practice-modes'
import { RecommendedNext } from '@/components/dashboard/recommended-next'

export default function DashboardPage() {
  const { user } = useAuthStore()

  // Fetch real user history & aggregated test prep statistics
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['results-history', user?.id],
    queryFn: () => resultsApi.getHistory(user!.id, { size: 10 }),
    enabled: !!user?.id,
  })
  const history = historyData?.results ?? []
  const stats = historyData?.statistics

  // Fetch active test sessions
  const { data: activeSessions, isLoading: isActiveLoading } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => examSessionsApi.getActive(),
    enabled: !!user?.id,
  })

  // Format seconds to readable format
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    if (mins < 60) return `${mins} phút`
    const hrs = Math.floor(mins / 60)
    const remMins = mins % 60
    return `${hrs} giờ ${remMins} phút`
  }

  return (
    <div className="space-y-6">
      {/* 1. Hero Certification */}
      <CertHero userName={user?.fullName || 'Học viên'} progress={65} certName="AWS Certified Solutions Architect" />

      {/* 2. Quick Stats */}
      <QuickStats 
        streak={12} 
        xp={2450} 
        accuracy={stats?.passRate ? Math.round(Number(stats.passRate) * 100) : 78} 
        timeSpent="14h 30m" 
        isLoading={isHistoryLoading} 
      />

      {/* Main columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main Column (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 5. Recommended Next */}
          <RecommendedNext />

          {/* 4. Practice Modes */}
          <PracticeModes />

          {/* 6. Activity Feed / Recent Exam History Widget */}
          <Card className="border-slate-200/60 dark:border-slate-800">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4.5 h-4.5 text-purple-500" />
                Lịch sử thi & luyện tập gần đây
              </CardTitle>
              <Link to="/learn" className="text-xs text-primary font-semibold flex items-center hover:underline">
                Xem tất cả
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {isHistoryLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : history.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.map((result) => {
                    const isPassed = result.status === 'PASSED'
                    const date = new Date(result.completedAt).toLocaleDateString('vi-VN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                    return (
                      <div key={result.resultId} className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 first:rounded-t-xl last:rounded-b-xl transition-colors">
                        <div className="min-w-0 pr-4">
                          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">{result.examTitle}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="font-semibold text-slate-600 dark:text-slate-400">{result.certificationName}</span>
                            <span>•</span>
                            <span>{date}</span>
                            <span>•</span>
                            <span>Đúng: {result.correctAnswers}/{result.totalQuestions} câu</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">{Math.round(Number(result.percentage))}%</p>
                            <Badge className={cn(
                              'text-[10px] font-semibold px-2 py-0.5 mt-0.5 rounded-full border-0 uppercase tracking-wider',
                              isPassed 
                                ? 'bg-success/10 text-success dark:bg-success/20' 
                                : 'bg-danger/10 text-danger dark:bg-danger/20'
                            )}>
                              {isPassed ? 'Đạt' : 'Trượt'}
                            </Badge>
                          </div>
                          <Link to={`/certifications/results/${result.resultId}`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 px-4 text-slate-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-25" />
                  <p className="font-medium text-sm">Chưa có kết quả thi nào</p>
                  <p className="text-xs text-slate-400 mt-1">Các lượt làm đề luyện tập hoặc thi thử sẽ xuất hiện ở đây.</p>
                  <Link to="/certifications" className="inline-block mt-4">
                    <Button size="sm" className="bg-primary text-white">Luyện thi ngay</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right side Column (col-span-1) */}
        <div className="space-y-6">

          {/* 3. Domains Breakdown */}
          <DomainsBreakdown />

          {/* Active test sessions widget */}
          {activeSessions && activeSessions.length > 0 && (
            <Card className="border-primary/20 dark:border-primary/30 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-primary animate-pulse" />
                  Đang ôn luyện
                </CardTitle>
                <Badge variant="outline" className="bg-slate-100 text-primary border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                  {activeSessions.length} phiên
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeSessions.map((session) => (
                  <div key={session.id} className="flex flex-col gap-2 p-4 bg-slate-100/50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{session.examTitle}</h4>
                      <div className="flex flex-col gap-1 mt-1.5 text-xs text-slate-500">
                        <span className="font-medium text-slate-600 dark:text-slate-400">{session.certificationName}</span>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {formatTime(session.timeSpentSeconds)}</span>
                          <span>•</span>
                          <span>{session.answeredCount}/{session.totalQuestions} câu</span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/exam/${session.id}`} className="mt-1">
                      <Button size="sm" className="w-full bg-primary hover:bg-slate-800 text-white font-semibold cursor-pointer rounded-lg shadow-sm">
                        Làm tiếp
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick actions panel */}
          <Card className="border-slate-200/60 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lối tắt nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/certifications" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all group cursor-pointer">
                <span>Tra cứu chứng chỉ học</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/community" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all group cursor-pointer">
                <span>Cộng đồng & Chia sẻ</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/profile/me" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all group cursor-pointer">
                <span>Thiết lập mục tiêu</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </CardContent>
          </Card>

        </div>
        
      </div>
    </div>
  )
}
