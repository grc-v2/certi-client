'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { certificationsApi, type CertificationResponse, type ExamResponse } from '@/lib/api/certifications'
import { EXAM_SESSION_KEY } from '@/lib/api/exam-sessions'
import { useStartExam } from '@/hooks/queries/exam-sessions'
import { toast } from 'sonner'
import CertificationPicker from './CertificationPicker'

export default function PracticeExamSimPage() {
  const navigate = useNavigate()
  const [cert, setCert] = useState<CertificationResponse | null>(null)
  const [confirmExam, setConfirmExam] = useState<ExamResponse | null>(null)

  const { data: detail, isLoading } = useQuery({
    queryKey: ['practice', 'cert-detail', cert?.slug],
    queryFn: () => certificationsApi.getBySlug(cert!.slug),
    enabled: !!cert?.slug,
  })

  const startExamMutation = useStartExam({
    onSuccess: (data) => {
      sessionStorage.setItem(EXAM_SESSION_KEY(data.id), JSON.stringify(data))
      toast.success('Bắt đầu thi thử!')
      navigate(`/exam/${data.id}`)
    },
    onError: () => toast.error('Không thể bắt đầu kỳ thi. Có thể bạn đang có phiên đang hoạt động.'),
  })

  if (!cert) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/practice')} className="text-sm text-zinc-500 hover:text-accent inline-flex items-center gap-1 mb-4 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />Quay lại
        </button>
        <CertificationPicker
          title="Thi thử ngay"
          subtitle="Chọn một chứng chỉ và đề thi mô phỏng. Bạn sẽ làm bài trong điều kiện như thi thật."
          onSelect={setCert}
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <button onClick={() => setCert(null)} className="text-sm text-zinc-500 hover:text-accent inline-flex items-center gap-1 cursor-pointer">
        <ArrowLeft className="w-4 h-4" />Chọn chứng chỉ khác
      </button>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">Thi thử</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{cert.name}</p>
        </div>
      </div>

      <Card className="border-yellow-200 dark:border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-500/5">
        <CardContent className="p-4 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
            <p className="font-semibold text-zinc-900 dark:text-yellow-200">Chế độ thi thử:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-zinc-600 dark:text-zinc-300">
              <li>Đồng hồ đếm ngược bắt đầu ngay khi vào phòng thi</li>
              <li>Không thể tạm dừng hoặc xem đáp án giữa chừng</li>
              <li>Câu hỏi sẽ được trộn ngẫu nhiên</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : !detail?.exams?.length ? (
        <div className="text-center py-12 text-sm text-zinc-500">
          Chứng chỉ này chưa có đề thi nào sẵn sàng.
        </div>
      ) : (
        <div className="space-y-3">
          {detail.exams.map((exam) => (
            <Card key={exam.id} className="border-zinc-200 dark:border-zinc-800">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{exam.type}</Badge>
                    {exam.status && <Badge variant="outline" className="text-[10px]">{exam.status}</Badge>}
                  </div>
                  <h3 className="font-bold text-zinc-900 dark:text-white">{exam.title}</h3>
                  {exam.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{exam.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.durationMinutes} phút
                    </div>
                    <div className="inline-flex items-center gap-1">
                      • {exam.totalQuestions} câu
                    </div>
                    <div className="inline-flex items-center gap-1">
                      • Qua nếu đạt {exam.passingScore}%
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setConfirmExam(exam)}
                  className={cn(
                    'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer flex-shrink-0',
                    startExamMutation.isPending && 'opacity-50',
                  )}
                  disabled={startExamMutation.isPending}
                >
                  <Play className="w-4 h-4 mr-1.5" />Vào phòng thi
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {confirmExam && (
        <div className="fixed inset-0 z-50 bg-zinc-900/70 flex items-center justify-center px-4" onClick={() => setConfirmExam(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-zinc-200 dark:border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Sẵn sàng vào thi?</h3>
            <div className="text-sm text-zinc-600 dark:text-zinc-300 space-y-1">
              <p>Đề thi: <strong>{confirmExam.title}</strong></p>
              <p>Thời lượng: <strong>{confirmExam.durationMinutes} phút</strong></p>
              <p>Số câu: <strong>{confirmExam.totalQuestions}</strong></p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-600 dark:text-red-400">
              Sau khi bắt đầu, đồng hồ sẽ đếm ngược và không thể tạm dừng.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setConfirmExam(null)} className="cursor-pointer">Hủy</Button>
              <Button
                onClick={() => { startExamMutation.mutate(confirmExam.id); setConfirmExam(null) }}
                disabled={startExamMutation.isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
              >
                {startExamMutation.isPending ? 'Đang tải...' : 'Bắt đầu ngay'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
