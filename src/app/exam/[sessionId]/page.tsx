'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import {
  Flag, ChevronLeft, ChevronRight, Clock, AlertTriangle,
  CheckSquare, Square, Send, CheckCircle2, XCircle, BookOpen, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  examSessionsApi,
  EXAM_SESSION_KEY, EXAM_INIT_KEY,
  type StartSessionResponse, type QuestionResponse,
  type ExamInitState, type AnswerFeedbackResponse,
} from '@/lib/api/exam-sessions'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type AnswerMap  = Record<number, number[]>
type FlagMap    = Record<number, boolean>
type FeedbackMap = Record<number, AnswerFeedbackResponse>

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

// ── Practice feedback banner ──────────────────────────────────────────────────

function FeedbackBanner({ fb }: { fb: AnswerFeedbackResponse }) {
  const correct = fb.isCorrect === true
  return (
    <div className={cn(
      'rounded-xl p-4 border space-y-2',
      correct
        ? 'bg-green-500/10 border-green-500/30'
        : 'bg-red-500/10 border-red-500/30',
    )}>
      <p className={cn('text-sm font-semibold flex items-center gap-1.5', correct ? 'text-green-400' : 'text-red-400')}>
        {correct
          ? <><CheckCircle2 className="w-4 h-4" />Chính xác!</>
          : <><XCircle className="w-4 h-4" />Chưa đúng</>}
      </p>
      {fb.explanation && (
        <div className="flex gap-2 text-sm text-slate-300">
          <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
          <p>{fb.explanation}</p>
        </div>
      )}
      {fb.referenceLinks?.length ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {fb.referenceLinks.map((link, i) => (
            <a key={i} href={link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#0A66C2] hover:underline">
              <ExternalLink className="w-3 h-3" />Tham khảo {i + 1}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}

// ── Question view ─────────────────────────────────────────────────────────────

function QuestionView({
  question, index, total, answers, flagged, feedback, isPractice,
  pendingSubmit, onAnswer, onToggleFlag, onConfirmMulti,
}: {
  question: QuestionResponse
  index: number
  total: number
  answers: AnswerMap
  flagged: FlagMap
  feedback: FeedbackMap
  isPractice: boolean
  pendingSubmit: boolean
  onAnswer: (questionId: number, optionId: number) => void
  onToggleFlag: (questionId: number) => void
  onConfirmMulti: (questionId: number) => void
}) {
  const selected  = answers[question.id] ?? []
  const fb        = feedback[question.id]
  const isMulti   = question.type === 'MULTIPLE_CHOICE'
  // lock options once feedback received (practice) or answered (exam single choice)
  const isLocked  = isPractice ? !!fb : false
  const optionLabels = ['A', 'B', 'C', 'D', 'E']

  const getOptionStyle = (optionId: number) => {
    const isSelected = selected.includes(optionId)
    if (fb) {
      const isCorrectOption = fb.correctOptionIds?.includes(optionId)
      if (isCorrectOption)  return 'border-green-500 bg-green-500/10'
      if (isSelected && !isCorrectOption) return 'border-red-500 bg-red-500/10'
      return 'border-slate-700 bg-slate-800/50 opacity-50'
    }
    if (isSelected) return 'border-[#0A66C2] bg-[#0A66C2]/20'
    return 'border-slate-700 bg-slate-800/50 hover:border-[#0A66C2]/50 hover:bg-slate-800'
  }

  return (
    <div className="max-w-3xl mx-auto w-full p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-400">Câu {index + 1} / {total}</span>
          {isMulti && (
            <span className="text-xs bg-[#0A66C2]/20 text-[#0A66C2] border border-[#0A66C2]/30 px-2 py-0.5 rounded-full">
              Nhiều đáp án
            </span>
          )}
        </div>
        <button
          onClick={() => onToggleFlag(question.id)}
          disabled={isLocked}
          className={cn(
            'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg cursor-pointer transition-all',
            flagged[question.id]
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
              : 'text-slate-400 hover:text-orange-400 hover:bg-orange-500/10',
            isLocked && 'opacity-50 cursor-default',
          )}
        >
          <Flag className="w-3.5 h-3.5" />
          {flagged[question.id] ? 'Đã đánh dấu' : 'Đánh dấu'}
        </button>
      </div>

      {/* Question text */}
      <div className="bg-slate-800/50 rounded-2xl p-6">
        <p className="text-base sm:text-lg leading-relaxed text-white">{question.content}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, oi) => {
          const isSelected = selected.includes(option.id)
          return (
            <button
              key={option.id}
              onClick={() => !isLocked && onAnswer(question.id, option.id)}
              disabled={isLocked}
              className={cn(
                'w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all duration-200',
                isLocked ? 'cursor-default' : 'cursor-pointer',
                getOptionStyle(option.id),
              )}
            >
              {isMulti ? (
                isSelected
                  ? <CheckSquare className="flex-shrink-0 w-5 h-5 text-[#0A66C2]" />
                  : <Square className="flex-shrink-0 w-5 h-5 text-slate-500" />
              ) : (
                <span className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold',
                  isSelected && !fb ? 'bg-[#0A66C2] border-[#0A66C2] text-white' : 'border-slate-600 text-slate-400',
                )}>
                  {optionLabels[oi]}
                </span>
              )}
              <span className="text-sm text-slate-200 leading-relaxed">{option.content}</span>
            </button>
          )
        })}
      </div>

      {/* Multiple choice confirm button */}
      {isMulti && !isLocked && selected.length > 0 && (
        <Button
          onClick={() => onConfirmMulti(question.id)}
          disabled={pendingSubmit}
          className="w-full bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer"
        >
          {pendingSubmit ? 'Đang xử lý...' : `Xác nhận ${selected.length} đáp án`}
        </Button>
      )}

      {/* Practice feedback */}
      {isPractice && fb && <FeedbackBanner fb={fb} />}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ExamPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const router = useRouter()

  const [session,  setSession]  = useState<StartSessionResponse | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers,  setAnswers]  = useState<AnswerMap>({})
  const [flagged,  setFlagged]  = useState<FlagMap>({})
  const [feedback, setFeedback] = useState<FeedbackMap>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitDialog, setSubmitDialog] = useState(false)

  // track time spent on current question
  const questionStartRef = useRef<number>(Date.now())
  useEffect(() => { questionStartRef.current = Date.now() }, [currentIndex])

  // Load session (+ optional resume init) from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem(EXAM_SESSION_KEY(sessionId))
    if (!raw) {
      toast.error('Không tìm thấy phiên thi. Vui lòng bắt đầu lại.')
      router.replace('/certifications')
      return
    }
    const data = JSON.parse(raw) as StartSessionResponse
    setSession(data)

    const initRaw = sessionStorage.getItem(EXAM_INIT_KEY(sessionId))
    if (initRaw) {
      const init = JSON.parse(initRaw) as ExamInitState
      if (Object.keys(init.answers).length) setAnswers(init.answers)
      if (Object.keys(init.flagged).length)  setFlagged(init.flagged)
      setTimeLeft(init.timeLeftSeconds)
      sessionStorage.removeItem(EXAM_INIT_KEY(sessionId))
    } else {
      setTimeLeft(data.durationMinutes * 60)
    }
  }, [sessionId, router])

  // ── Mutations ────────────────────────────────────────────────────────────────

  const submitAnswerMutation = useMutation({
    mutationFn: ({ questionId, optionIds }: { questionId: number; optionIds: number[] }) => {
      const timeSpentSeconds = Math.round((Date.now() - questionStartRef.current) / 1000)
      return examSessionsApi.submitAnswer(sessionId, {
        questionId,
        selectedOptionIds: optionIds,
        timeSpentSeconds,
        isFlagged: !!flagged[questionId],
      })
    },
    onSuccess: (data, { questionId }) => {
      if (session?.mode === 'PRACTICE') {
        setFeedback(prev => ({ ...prev, [questionId]: data }))
      }
    },
    onError: (err: { response?: { status?: number } }) => {
      const status = err?.response?.status
      if (status === 400) toast.error('Dữ liệu không hợp lệ')
      else if (status === 403) toast.error('Không có quyền thực hiện')
      else if (status === 404) toast.error('Không tìm thấy câu hỏi')
      else toast.error('Không thể lưu câu trả lời')
    },
  })

  const completeSessionMutation = useMutation({
    mutationFn: () => examSessionsApi.completeSession(sessionId),
    onSuccess: (result) => {
      sessionStorage.removeItem(EXAM_SESSION_KEY(sessionId))
      toast.success('Nộp bài thành công!')
      router.push(`/learn/results/${result.resultId}`)
    },
    onError: (err: { response?: { status?: number } }) => {
      const status = err?.response?.status
      if (status === 400) toast.error('Phiên thi không hợp lệ hoặc đã kết thúc')
      else if (status === 403) toast.error('Không có quyền nộp bài')
      else toast.error('Không thể nộp bài. Vui lòng thử lại.')
    },
  })

  // ── Timer countdown ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { completeSessionMutation.mutate(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft])

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleAnswer = useCallback((questionId: number, optionId: number) => {
    if (!session) return
    const question = session.questions.find(q => q.id === questionId)
    if (!question) return
    const isMulti = question.type === 'MULTIPLE_CHOICE'

    setAnswers(prev => {
      const current = prev[questionId] ?? []
      let next: number[]
      if (isMulti) {
        next = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId]
      } else {
        if (current[0] === optionId) return prev
        next = [optionId]
        // auto-submit for single/true-false
        submitAnswerMutation.mutate({ questionId, optionIds: next })
      }
      if (next.length === 0) {
        const { [questionId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [questionId]: next }
    })
  }, [session])

  const handleConfirmMulti = useCallback((questionId: number) => {
    const optionIds = answers[questionId]
    if (!optionIds?.length) return
    submitAnswerMutation.mutate({ questionId, optionIds })
  }, [answers])

  const handleToggleFlag = useCallback((questionId: number) => {
    setFlagged(prev => ({ ...prev, [questionId]: !prev[questionId] }))
  }, [])

  // ── Loading state ─────────────────────────────────────────────────────────────

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const questions      = session.questions
  const totalQuestions = questions.length
  const answeredCount  = Object.keys(answers).length
  const progress       = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0
  const currentQuestion = questions[currentIndex]
  const isWarning      = timeLeft < 300 && timeLeft > 0
  const isPractice     = session.mode === 'PRACTICE'

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white">
      {/* Top bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-[#0A66C2] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-sm">C</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{session.examTitle}</p>
            <p className="text-xs text-slate-400">{answeredCount}/{totalQuestions} đã trả lời</p>
          </div>
        </div>

        <div className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold flex-shrink-0',
          isWarning ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-white',
        )}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSubmitDialog(true)}
          className="text-slate-300 hover:text-white cursor-pointer flex-shrink-0"
        >
          <Send className="w-4 h-4 mr-1.5" />Nộp bài
        </Button>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-slate-800">
        <div className="h-full bg-[#22C55E] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Question navigator */}
        <aside className="hidden lg:flex flex-col w-56 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Câu hỏi</p>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q, i) => {
              const isAnswered = !!(answers[q.id]?.length)
              const isFlagged  = !!flagged[q.id]
              const isActive   = i === currentIndex
              const hasFeedback = !!feedback[q.id]
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer',
                    isActive
                      ? 'bg-[#0A66C2] text-white'
                      : isPractice && hasFeedback && feedback[q.id].isCorrect
                      ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30'
                      : isPractice && hasFeedback && !feedback[q.id].isCorrect
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : isFlagged
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                      : isAnswered
                      ? 'bg-slate-600/40 text-slate-300 border border-slate-600'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700',
                  )}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          <div className="mt-auto space-y-2 text-xs text-slate-500 pt-4">
            {isPractice ? (
              <>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#22C55E]/20 border border-[#22C55E]/30" />Đúng</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />Sai</div>
              </>
            ) : (
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-600/40 border border-slate-600" />Đã trả lời</div>
            )}
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/40" />Đánh dấu</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-800" />Chưa trả lời</div>
          </div>
        </aside>

        {/* Main question area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {currentQuestion && (
            <QuestionView
              question={currentQuestion}
              index={currentIndex}
              total={totalQuestions}
              answers={answers}
              flagged={flagged}
              feedback={feedback}
              isPractice={isPractice}
              pendingSubmit={submitAnswerMutation.isPending}
              onAnswer={handleAnswer}
              onToggleFlag={handleToggleFlag}
              onConfirmMulti={handleConfirmMulti}
            />
          )}

          {/* Bottom navigation */}
          <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 p-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="text-slate-300 hover:text-white cursor-pointer disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />Câu trước
            </Button>

            <span className="text-sm text-slate-400 lg:hidden">{currentIndex + 1}/{totalQuestions}</span>

            {currentIndex === totalQuestions - 1 ? (
              <Button
                onClick={() => setSubmitDialog(true)}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white cursor-pointer"
              >
                <Send className="w-4 h-4 mr-1.5" />Nộp bài
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setCurrentIndex(i => Math.min(totalQuestions - 1, i + 1))}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                Câu sau<ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </main>
      </div>

      {/* Submit confirmation dialog */}
      <Dialog open={submitDialog} onOpenChange={setSubmitDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Xác nhận nộp bài
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-slate-300 text-sm">
              Bạn đã trả lời <strong className="text-white">{answeredCount}/{totalQuestions}</strong> câu hỏi.
            </p>
            {answeredCount < totalQuestions && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Còn {totalQuestions - answeredCount} câu chưa trả lời. Sau khi nộp không thể chỉnh sửa.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSubmitDialog(false)} className="text-slate-300 cursor-pointer">
              Hủy
            </Button>
            <Button
              onClick={() => { setSubmitDialog(false); completeSessionMutation.mutate() }}
              disabled={completeSessionMutation.isPending}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white cursor-pointer"
            >
              {completeSessionMutation.isPending ? 'Đang nộp...' : 'Xác nhận nộp bài'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
