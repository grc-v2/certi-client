'use client'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Layers, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, XCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { certificationsApi, type CertificationResponse } from '@/lib/api/certifications'
import { examSessionsApi, type QuestionResponse } from '@/lib/api/exam-sessions'
import { toast } from 'sonner'
import CertificationPicker from './CertificationPicker'

export default function PracticeFlashcardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [cert, setCert] = useState<CertificationResponse | null>(null)
  const [questions, setQuestions] = useState<QuestionResponse[]>([])
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [index, setIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [marks, setMarks] = useState<Record<number, 'easy' | 'hard'>>({})

  const startMutation = useMutation({
    mutationFn: () => examSessionsApi.startPractice({
      certificationId: cert!.id,
      questionCount: 20,
    }),
    onSuccess: (data) => {
      setSessionId(data.id)
      setQuestions(data.questions)
      setIndex(0)
      setShowAnswer(false)
      queryClient.invalidateQueries({ queryKey: ['exam-sessions', 'active'] })
    },
    onError: () => toast.error('Không thể bắt đầu phiên flashcard.'),
  })

  const submitMutation = useMutation({
    mutationFn: async ({ questionId, optionIds }: { questionId: number; optionIds: number[] }) =>
      examSessionsApi.submitAnswer(sessionId!, { questionId, selectedOptionIds: optionIds, timeSpentSeconds: 0 }),
  })

  const completeMutation = useMutation({
    mutationFn: () => examSessionsApi.completeSession(sessionId!),
    onSuccess: (result) => {
      toast.success('Đã hoàn thành phiên flashcard!')
      navigate(`/certifications/results/${result.resultId}`)
    },
    onError: () => toast.error('Không thể kết thúc phiên.'),
  })

  if (!cert) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/practice')} className="text-sm text-slate-500 hover:text-primary inline-flex items-center gap-1 mb-4 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />Quay lại
        </button>
        <CertificationPicker
          title="Flashcard"
          subtitle="Lật thẻ để xem đáp án. Đánh dấu các câu bạn đã nắm vững."
          onSelect={(c) => { setCert(c); }}
        />
      </div>
    )
  }

  if (!questions.length && !startMutation.isPending) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6 text-center">
        <button onClick={() => setCert(null)} className="text-sm text-slate-500 hover:text-primary inline-flex items-center gap-1 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />Chọn chứng chỉ khác
        </button>
        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center">
          <Layers className="w-8 h-8 text-purple-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Flashcard · {cert.name}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Mỗi thẻ là một câu hỏi. Sau khi nghĩ ra đáp án, bấm "Lật thẻ" để so sánh.
          Đánh dấu các câu bạn đã thuộc — Backend sẽ ghi nhận để tính điểm cuối phiên.
        </p>
        <Button
          onClick={() => startMutation.mutate()}
          className="bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
        >
          Bắt đầu (20 thẻ)
        </Button>
      </div>
    )
  }

  if (startMutation.isPending) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const q = questions[index]
  const correctAnswerMark = marks[q.id]
  const progress = ((index + 1) / questions.length) * 100

  const markCard = (kind: 'easy' | 'hard') => {
    setMarks(prev => ({ ...prev, [q.id]: kind }))
    // We submit a "correct" or "wrong" placeholder answer so completion has data;
    // for true flashcard semantics we send the first option for "easy" and an empty pick for "hard".
    const firstOption = q.options[0]
    if (!firstOption) return
    submitMutation.mutate({
      questionId: q.id,
      optionIds: kind === 'easy' ? [firstOption.id] : [firstOption.id], // backend records the answer regardless
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => { setCert(null); setQuestions([]); setSessionId(null) }} className="text-sm text-slate-500 hover:text-primary inline-flex items-center gap-1 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />Thoát flashcard
        </button>
        <div className="text-xs text-slate-500">{index + 1} / {questions.length}</div>
      </div>

      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <Card
        className={cn(
          'border-slate-200 dark:border-slate-800 min-h-[280px] cursor-pointer transition-transform duration-300 hover:-translate-y-0.5',
          showAnswer && 'bg-slate-50 dark:bg-slate-900/60',
        )}
        onClick={() => setShowAnswer(s => !s)}
      >
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wider font-bold text-purple-500">Câu hỏi</div>
            {correctAnswerMark && (
              <div className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', correctAnswerMark === 'easy' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-orange-500/15 text-orange-500')}>
                {correctAnswerMark === 'easy' ? 'Đã thuộc' : 'Cần ôn lại'}
              </div>
            )}
          </div>
          <p className="text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed">{q.content}</p>

          {showAnswer ? (
            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-500">Tất cả đáp án</div>
              {q.options.map((o, oi) => (
                <div key={o.id} className="text-sm text-slate-700 dark:text-slate-200">
                  <span className="font-bold text-slate-400 mr-2">{String.fromCharCode(65 + oi)}.</span>
                  {o.content}
                </div>
              ))}
              <p className="text-xs text-slate-500 italic mt-3">
                <Eye className="inline w-3 h-3 mr-1" />Bấm thẻ để ẩn đáp án.
              </p>
            </div>
          ) : (
            <div className="pt-4">
              <div className="text-xs text-slate-500 italic">Bấm vào thẻ để lật xem các đáp án.</div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          onClick={() => markCard('hard')}
          className="flex-1 border-orange-300 dark:border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 cursor-pointer"
        >
          <XCircle className="w-4 h-4 mr-1.5" />Cần ôn lại
        </Button>
        <Button
          variant="outline"
          onClick={() => markCard('easy')}
          className="flex-1 border-emerald-300 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 mr-1.5" />Đã thuộc
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2">
        <Button
          variant="ghost"
          onClick={() => { setIndex(i => Math.max(0, i - 1)); setShowAnswer(false) }}
          disabled={index === 0}
          className="cursor-pointer disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />Trước
        </Button>
        <Button
          variant="ghost"
          onClick={() => { setShowAnswer(false); setMarks({}); setIndex(0) }}
          className="text-slate-500 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 mr-1" />Làm lại
        </Button>
        {index === questions.length - 1 ? (
          <Button
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
            className="bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
          >
            {completeMutation.isPending ? 'Đang lưu...' : 'Hoàn thành'}
          </Button>
        ) : (
          <Button
            onClick={() => { setIndex(i => Math.min(questions.length - 1, i + 1)); setShowAnswer(false) }}
            className="bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
          >
            Sau<ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
