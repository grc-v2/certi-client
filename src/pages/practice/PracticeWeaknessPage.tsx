'use client'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, Play, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { certificationsApi, type CertificationResponse } from '@/lib/api/certifications'
import { EXAM_SESSION_KEY } from '@/lib/api/exam-sessions'
import { useStartPractice } from '@/hooks/queries/exam-sessions'
import { resultsApi } from '@/lib/api/results'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'
import CertificationPicker from './CertificationPicker'

const WEAKNESS_THRESHOLD = 70

export default function PracticeWeaknessPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [cert, setCert] = useState<CertificationResponse | null>(null)

  // Fetch user's last exam result for this certification to identify weakest domains
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['practice-weakness', 'history', user?.id, cert?.id],
    queryFn: () => resultsApi.getHistory(user!.id, { certificationId: cert!.id, size: 5 }),
    enabled: !!user?.id && !!cert?.id,
  })

  const { data: lastResult, isLoading: resultLoading } = useQuery({
    queryKey: ['practice-weakness', 'result', history?.results?.[0]?.resultId],
    queryFn: () => resultsApi.getResult(history!.results[0].resultId),
    enabled: !!history?.results?.[0]?.resultId,
  })

  const weakDomains = useMemo(() => {
    if (!lastResult) return []
    return lastResult.topicPerformance
      .filter(t => t.percentage < WEAKNESS_THRESHOLD)
      .sort((a, b) => a.percentage - b.percentage)
  }, [lastResult])

  const startMutation = useStartPractice({
    onSuccess: (data) => {
      sessionStorage.setItem(EXAM_SESSION_KEY(data.id), JSON.stringify(data))
      toast.success('Đã tạo phiên luyện tập tập trung vào điểm yếu!')
      navigate(`/exam/${data.id}`)
    },
    onError: () => toast.error('Không thể bắt đầu phiên.'),
  })

  if (!cert) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/practice')} className="text-sm text-slate-500 hover:text-primary inline-flex items-center gap-1 mb-4 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />Quay lại
        </button>
        <CertificationPicker
          title="Khắc phục điểm yếu"
          subtitle="Hệ thống sẽ tự động chọn câu hỏi từ các chủ đề bạn còn yếu nhất dựa trên lần thi gần nhất."
          onSelect={setCert}
        />
      </div>
    )
  }

  const loading = historyLoading || resultLoading

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <button onClick={() => setCert(null)} className="text-sm text-slate-500 hover:text-primary inline-flex items-center gap-1 cursor-pointer">
        <ArrowLeft className="w-4 h-4" />Chọn chứng chỉ khác
      </button>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
          <Zap className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Khắc phục điểm yếu</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{cert.name}</p>
        </div>
      </div>

      {loading ? (
        <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      ) : !history?.results?.length ? (
        <Card className="border-yellow-200 dark:border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-500/5">
          <CardContent className="p-5 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-slate-900 dark:text-yellow-200 mb-1">Chưa có lịch sử làm bài</p>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                Bạn cần hoàn thành ít nhất một bài thi với chứng chỉ này để chúng tôi xác định được điểm yếu.
              </p>
              <Button
                size="sm"
                onClick={() => navigate('/practice/exam')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
              >
                Vào thi thử
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : weakDomains.length === 0 ? (
        <Card className="border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5">
          <CardContent className="p-5">
            <p className="font-semibold text-slate-900 dark:text-emerald-200 mb-1">Bạn đang làm rất tốt!</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Tất cả các chủ đề đều đạt trên {WEAKNESS_THRESHOLD}%. Hãy thử thi thử lại để duy trì phong độ.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Các chủ đề cần ôn lại
                </h3>
                <Badge variant="secondary" className="text-[10px]">{weakDomains.length} chủ đề</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Dựa trên kết quả gần nhất ({history.results[0].percentage}%)
              </p>
              <div className="space-y-2">
                {weakDomains.map((d) => (
                  <div key={d.topicId} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{d.topicName}</p>
                      <p className="text-[11px] text-slate-500">{d.correctAnswers}/{d.totalQuestions} câu đúng</p>
                    </div>
                    <div className={cn(
                      'font-bold text-sm tabular-nums px-2 py-0.5 rounded',
                      d.percentage < 40 ? 'text-red-500 bg-red-500/10' :
                      d.percentage < 60 ? 'text-orange-500 bg-orange-500/10' :
                      'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10',
                    )}>
                      {d.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => startMutation.mutate({
              certificationId: cert!.id,
              questionCount: 20,
              domainIds: weakDomains.map(d => d.topicId),
            })}
            disabled={startMutation.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
          >
            <Play className="w-4 h-4 mr-1.5" />
            {startMutation.isPending ? 'Đang tạo phiên...' : `Luyện 20 câu từ ${weakDomains.length} chủ đề yếu`}
          </Button>
        </>
      )}
    </div>
  )
}
