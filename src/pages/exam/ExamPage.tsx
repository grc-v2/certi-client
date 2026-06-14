'use client'
import { useState, useEffect, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import {
  Flag, ChevronLeft, ChevronRight, Clock, AlertTriangle,
  CheckSquare, Square, Send, CheckCircle2, XCircle, BookOpen, ExternalLink,
  GraduationCap, Tag, Pause, Play, Menu, X,
} from 'lucide-react'

const MOCK_DOMAINS: Record<number, string> = {
  1: 'Kiến trúc cơ sở',
  2: 'Tính toán & Mạng',
  3: 'Lưu trữ & Dữ liệu',
  4: 'Bảo mật & Tuân thủ',
  5: 'Phân tích & Máy học',
  6: 'Spring Core · IoC / DI',
  7: 'Spring Data JPA',
  8: 'Spring Boot Auto-config',
}
const getDomainName = (id: number) => MOCK_DOMAINS[id] || `Chủ đề kiến thức ${id}`
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  type QuestionResponse,
  type AnswerFeedbackResponse,
} from '@/lib/api/exam-sessions'
import { useExamSession } from '@/hooks/use-exam-session'
import { cn } from '@/lib/utils'

type AnswerMap  = Record<number, number[]>
type FlagMap    = Record<number, boolean>
type FeedbackMap = Record<number, AnswerFeedbackResponse>

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds)
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

// ── Practice feedback banner ──────────────────────────────────────────────────

function FeedbackBanner({ fb }: { fb: AnswerFeedbackResponse }) {
  const correct = fb.isCorrect === true
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'rounded-xl p-4 border space-y-2',
        correct
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-red-500/10 border-red-500/30',
      )}
    >
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
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
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
  // Lock only once the server has actually revealed the answer. In EXAM mode the
  // BE strips correctOptionIds, so fbHasAnswer is always false — no premature lock,
  // no answer reveal, even if a client-side `mode` is tampered with.
  const fbHasAnswer = !!fb && fb.correctOptionIds != null
  const isLocked    = fbHasAnswer
  const optionLabels = ['A', 'B', 'C', 'D', 'E']

  const getOptionStyle = (optionId: number) => {
    const isSelected = selected.includes(optionId)
    if (fbHasAnswer) {
      const isCorrectOption = fb!.correctOptionIds?.includes(optionId)
      if (isCorrectOption)  return 'border-green-500 bg-green-50/50 dark:bg-green-500/10 border-l-[4px]'
      if (isSelected && !isCorrectOption) return 'border-red-500 bg-red-50/50 dark:bg-red-500/10 border-l-[4px]'
      return 'border-slate-200 bg-slate-50 opacity-50 dark:border-slate-700 dark:bg-slate-800/50 border-l-[1px]'
    }
    if (isSelected) return 'border-primary bg-primary/5 dark:bg-primary/10 border-l-[4px] shadow-sm'
    return 'border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 border-l-[1px] hover:border-l-[4px] transition-all'
  }

  return (
    <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Câu {index + 1} / {total}</span>
          {isMulti && (
            <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
              Nhiều đáp án
            </span>
          )}
        </div>
        <button
          onClick={() => onToggleFlag(question.id)}
          disabled={isLocked}
          aria-pressed={!!flagged[question.id]}
          aria-label={flagged[question.id] ? 'Bỏ đánh dấu câu hỏi này' : 'Đánh dấu câu hỏi này'}
          className={cn(
            'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            flagged[question.id]
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
              : 'text-slate-500 hover:text-orange-500 hover:bg-orange-500/10 dark:text-slate-400 dark:hover:text-orange-400',
            isLocked && 'opacity-50 cursor-default',
          )}
        >
          <Flag className="w-3.5 h-3.5" />
          {flagged[question.id] ? 'Đã đánh dấu' : 'Đánh dấu'}
        </button>
      </div>

      {/* Question text */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-transparent shadow-sm dark:shadow-none relative">
        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 w-fit border border-slate-200 dark:border-slate-700">
          <Tag className="w-3 h-3 text-primary" />
          {getDomainName(question.domainId)}
        </div>
        <p className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-white">{question.content}</p>
      </div>

      {/* Options */}
      <div
        className="space-y-3"
        role={isMulti ? 'group' : 'radiogroup'}
        aria-label={`Đáp án câu ${index + 1}`}
      >
        {question.options.map((option, oi) => {
          const isSelected = selected.includes(option.id)
          return (
            <button
              key={option.id}
              onClick={() => !isLocked && onAnswer(question.id, option.id)}
              disabled={isLocked}
              role={isMulti ? 'checkbox' : 'radio'}
              aria-checked={isSelected}
              aria-label={`Đáp án ${optionLabels[oi]}: ${option.content}`}
              className={cn(
                'group w-full text-left flex items-center gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                isLocked ? 'cursor-default' : 'cursor-pointer',
                getOptionStyle(option.id),
              )}
            >
              {isMulti ? (
                isSelected
                  ? <CheckSquare className="flex-shrink-0 w-5 h-5 text-primary" />
                  : <Square className="flex-shrink-0 w-5 h-5 text-slate-400 group-hover:text-primary/70 transition-colors" />
              ) : (
                <span className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold transition-colors',
                  isSelected && !fbHasAnswer ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30',
                )}>
                  {optionLabels[oi]}
                </span>
              )}
              <span className={cn(
                "text-sm leading-relaxed transition-colors",
                isSelected ? "text-slate-900 dark:text-white font-medium" : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
              )}>{option.content}</span>
            </button>
          )
        })}
      </div>

      {/* Multiple choice confirm button */}
      {isMulti && !isLocked && selected.length > 0 && (
        <Button
          onClick={() => onConfirmMulti(question.id)}
          disabled={pendingSubmit}
          className="w-full bg-primary hover:bg-slate-800 text-white cursor-pointer"
        >
          {pendingSubmit ? 'Đang xử lý...' : `Xác nhận ${selected.length} đáp án`}
        </Button>
      )}

      {/* Per-question feedback (only when the server actually revealed the answer) */}
      {fbHasAnswer && <FeedbackBanner fb={fb!} />}
    </div>
  )
}

// ── Question navigator (shared between desktop sidebar + mobile sheet) ────────

function QuestionNavigator({
  questions, answers, flagged, feedback, currentIndex, isPractice, onSelect,
}: {
  questions: QuestionResponse[]
  answers: AnswerMap
  flagged: FlagMap
  feedback: FeedbackMap
  currentIndex: number
  isPractice: boolean
  onSelect: (i: number) => void
}) {
  // Single source of truth: derive both the chip and the bar from the same
  // answers/questions pair so they can never drift apart between renders.
  const answeredCount = questions.reduce((acc, q) => acc + (answers[q.id]?.length ? 1 : 0), 0)
  const totalQuestions = questions.length
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

  // Layout: sticky progress header → scrollable section that holds the question
  // cells followed immediately by the legend (no gap between cells and legend).
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Sticky progress header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tiến độ</p>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md tabular-nums">
            {answeredCount}/{totalQuestions} · {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Scrollable area: question cells then legend, glued together */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div
          className="grid gap-2 px-3 pt-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))' }}
        >
          {questions.map((q, i) => {
            const isAnswered  = !!(answers[q.id]?.length)
            const isFlagged   = !!flagged[q.id]
            const isActive    = i === currentIndex
            const fb          = feedback[q.id]
            const showCorrect = isPractice && fb && fb.isCorrect === true
            const showWrong   = isPractice && fb && fb.isCorrect === false

            const cellClass = isActive
              ? 'bg-primary text-white ring-2 ring-primary/30 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 shadow-sm'
              : showCorrect
              ? 'bg-[#22C55E]/15 text-[#15803D] border border-[#22C55E]/40 hover:bg-[#22C55E]/25 dark:text-[#22C55E]'
              : showWrong
              ? 'bg-red-500/15 text-red-600 border border-red-500/40 hover:bg-red-500/25 dark:text-red-400'
              : isAnswered
              ? 'bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600'
              : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700'

            return (
              <button
                key={q.id}
                onClick={() => onSelect(i)}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`Đi đến câu ${i + 1}${isAnswered ? ', đã trả lời' : ''}${isFlagged ? ', đã đánh dấu' : ''}`}
                className={cn(
                  'relative h-10 rounded-lg text-sm font-semibold tabular-nums transition-all cursor-pointer',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  cellClass,
                )}
              >
                {i + 1}
                {isFlagged && (
                  <Flag
                    className="absolute -top-1 -right-1 w-3 h-3 fill-orange-500 text-orange-500 drop-shadow"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Legend — immediately after the cells, no gap, scrolls with them */}
        <div className="mt-3 px-4 pt-3 pb-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Chú giải
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <LegendItem
              swatchClass="bg-primary ring-1 ring-primary/40"
              label="Đang chọn"
            />
            {isPractice ? (
              <>
                <LegendItem
                  swatchClass="bg-[#22C55E]/20 border border-[#22C55E]/40"
                  label="Đúng"
                />
                <LegendItem
                  swatchClass="bg-red-500/20 border border-red-500/40"
                  label="Sai"
                />
              </>
            ) : (
              <LegendItem
                swatchClass="bg-slate-200 border border-slate-300 dark:bg-slate-700 dark:border-slate-600"
                label="Đã trả lời"
              />
            )}
            <LegendItem
              swatchClass="bg-slate-50 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700"
              label="Chưa trả lời"
            />
            <LegendItem
              swatchIcon={<Flag className="w-3 h-3 fill-orange-500 text-orange-500" />}
              label="Đã đánh dấu"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendItem({
  swatchClass, swatchIcon, label,
}: {
  swatchClass?: string
  swatchIcon?: ReactNode
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span
        className={cn(
          'inline-flex items-center justify-center w-4 h-4 rounded-md flex-shrink-0',
          swatchClass,
        )}
      >
        {swatchIcon}
      </span>
      <span className="truncate">{label}</span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ExamPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const exam = useExamSession(sessionId)
  const { session, currentIndex, answers, flagged, feedback, timeLeft, isPaused, hasDuration, isTimeUp } = exam.state

  const [submitDialog, setSubmitDialog] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Handler aliases so the JSX reads as before; all transition logic lives in useExamSession.
  const handleAnswer = exam.selectAnswer
  const handleConfirmMulti = exam.confirmMulti
  const handleToggleFlag = exam.toggleFlag
  const handleSelectQuestion = (i: number) => { exam.goTo(i); setMobileNavOpen(false) }

  // ── Keyboard shortcuts (presentation) ────────────────────────────────────────
  useEffect(() => {
    if (!session || isPaused) return
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const q = session.questions[currentIndex]
      if (!q) return
      if (e.key === 'ArrowLeft')  { e.preventDefault(); exam.goTo(Math.max(0, currentIndex - 1)) }
      else if (e.key === 'ArrowRight') { e.preventDefault(); exam.goTo(Math.min(session.questions.length - 1, currentIndex + 1)) }
      else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); exam.toggleFlag(q.id) }
      else if (/^[1-5]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1
        const opt = q.options[idx]
        if (opt) { e.preventDefault(); exam.selectAnswer(q.id, opt.id) }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [session, currentIndex, isPaused, exam])

  // ── Warn on tab close while in-progress ──────────────────────────────────────
  useEffect(() => {
    if (!session) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [session])

  // ── Loading state ─────────────────────────────────────────────────────────────

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 dark:border-white/20 border-t-primary dark:border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const questions      = session.questions
  const totalQuestions = questions.length
  const answeredCount  = Object.keys(answers).length
  const progress       = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0
  const currentQuestion = questions[currentIndex]
  const isPractice     = session.mode === 'PRACTICE'

  const timerColor = !hasDuration
    ? 'text-slate-500 dark:text-slate-400'
    : timeLeft > 600 ? 'text-[#22C55E]' : timeLeft > 180 ? 'text-yellow-600 dark:text-yellow-500' : 'text-red-500 animate-pulse'
  const timerDotColor = !hasDuration
    ? 'bg-slate-400'
    : timeLeft > 600 ? 'bg-[#22C55E]' : timeLeft > 180 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-white">
      {/* Top bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-3 flex items-center justify-between gap-2 sm:gap-4 shadow-sm z-10 relative">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Mở danh sách câu hỏi"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-800">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg">CertiMaster</span>
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded flex-shrink-0">
                {isPractice ? 'Luyện tập' : 'Thi thử'} · {session.certificationName}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold truncate text-slate-800 dark:text-slate-200 leading-tight">{session.examTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasDuration && (
            <div className={cn(
              'flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg font-mono text-sm sm:text-base md:text-lg font-bold flex-shrink-0 bg-slate-100 dark:bg-slate-800 transition-colors',
              timerColor
            )}
              aria-live="polite"
              aria-label={`Còn ${formatTime(timeLeft)}`}
            >
              <div className={cn("w-2 h-2 rounded-full", timerDotColor, timeLeft <= 600 ? "animate-pulse" : "")} />
              <Clock className="w-4 h-4 hidden sm:block" />
              {formatTime(timeLeft)}
            </div>
          )}

          {isPractice && !isPaused && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => exam.pause()}
              disabled={exam.isPausing}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer flex-shrink-0 bg-slate-50 dark:bg-slate-800/50"
              aria-label="Tạm dừng"
            >
              <Pause className="w-4 h-4 sm:mr-1.5 text-yellow-500" />
              <span className="hidden sm:inline">Tạm dừng</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSubmitDialog(true)}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer flex-shrink-0 bg-slate-50 dark:bg-slate-800/50"
            aria-label="Nộp bài"
          >
            <Send className="w-4 h-4 sm:mr-1.5 text-primary" />
            <span className="hidden sm:inline">Nộp bài</span>
          </Button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-slate-200 dark:bg-slate-800">
        <div className="h-full bg-[#22C55E] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar — internal scroll, no outer overflow so legend stays pinned. */}
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-0">
          <QuestionNavigator
            questions={questions} answers={answers} flagged={flagged} feedback={feedback}
            currentIndex={currentIndex} isPractice={isPractice}
            onSelect={handleSelectQuestion}
          />
        </aside>

        {/* Mobile drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-slate-900/60" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
            <aside className="relative flex flex-col w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-xl">
              <div className="shrink-0 flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-sm">Danh sách câu hỏi</span>
                <button onClick={() => setMobileNavOpen(false)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Đóng">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <QuestionNavigator
                  questions={questions} answers={answers} flagged={flagged} feedback={feedback}
                  currentIndex={currentIndex} isPractice={isPractice}
                  onSelect={handleSelectQuestion}
                />
              </div>
            </aside>
          </div>
        )}

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
              pendingSubmit={exam.isSubmitting}
              onAnswer={handleAnswer}
              onToggleFlag={handleToggleFlag}
              onConfirmMulti={handleConfirmMulti}
            />
          )}

          {/* Bottom navigation */}
          <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 flex items-center justify-between gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <Button
              variant="outline"
              onClick={() => exam.goTo(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer disabled:opacity-50"
              aria-label="Câu trước"
            >
              <ChevronLeft className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Câu trước</span>
            </Button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Đã trả lời <span className="text-slate-900 dark:text-white font-bold">{answeredCount}</span> / {totalQuestions}
              </span>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
              <span className="text-xs sm:text-sm text-slate-400 hidden sm:inline lg:hidden">Câu {currentIndex + 1}</span>
            </div>

            {currentIndex === totalQuestions - 1 ? (
              <Button
                onClick={() => setSubmitDialog(true)}
                className="bg-primary hover:bg-slate-800 dark:hover:bg-primary/80 text-white cursor-pointer shadow-md shadow-primary/20"
              >
                <Send className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Nộp bài</span>
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => exam.goTo(Math.min(totalQuestions - 1, currentIndex + 1))}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer shadow-sm"
                aria-label="Câu sau"
              >
                <span className="hidden sm:inline">Câu sau</span>
                <ChevronRight className="w-4 h-4 sm:ml-1" />
              </Button>
            )}
          </div>
        </main>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-5 border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/15 flex items-center justify-center">
              <Pause className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Phiên đã tạm dừng</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Phiên luyện tập đã được lưu. Bấm tiếp tục để quay lại làm bài.
              </p>
            </div>
            <Button
              onClick={() => exam.resume()}
              disabled={exam.isResuming}
              className="w-full bg-primary hover:bg-primary/90 text-white cursor-pointer"
            >
              <Play className="w-4 h-4 mr-1.5" />
              {exam.isResuming ? 'Đang tiếp tục...' : 'Tiếp tục làm bài'}
            </Button>
          </div>
        </div>
      )}

      {/* Submit confirmation dialog */}
      <Dialog open={submitDialog} onOpenChange={setSubmitDialog}>
        <DialogContent size="lg" className="exam-dialog">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-11 h-11 rounded-full bg-yellow-100 dark:bg-yellow-500/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle>Xác nhận nộp bài</DialogTitle>
                <DialogDescription className="mt-1">
                  Sau khi nộp, bạn sẽ không thể chỉnh sửa các câu trả lời.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary stats — 3-column grid scales to the wider dialog */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Đã trả lời</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {answeredCount}<span className="text-base font-medium text-slate-400">/{totalQuestions}</span>
                </p>
              </div>
              <div className="rounded-xl border border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 p-3 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">Đã đánh dấu</p>
                <p className="mt-1 text-2xl font-bold text-orange-700 dark:text-orange-300 tabular-nums">
                  {Object.values(flagged).filter(Boolean).length}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Chưa trả lời</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {totalQuestions - answeredCount}
                </p>
              </div>
            </div>

            {answeredCount < totalQuestions && (
              <div className="flex items-start gap-2 rounded-lg border border-yellow-300/60 dark:border-yellow-500/30 bg-yellow-50 dark:bg-yellow-500/10 px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                  Còn <strong>{totalQuestions - answeredCount}</strong> câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSubmitDialog(false)}
              className="text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Tiếp tục làm bài
            </Button>
            <Button
              onClick={() => { setSubmitDialog(false); exam.complete() }}
              disabled={exam.isCompleting}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white cursor-pointer min-w-[160px]"
            >
              {exam.isCompleting ? 'Đang nộp...' : 'Xác nhận nộp bài'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time-up dialog */}
      <Dialog open={isTimeUp} onOpenChange={() => {}}>
        <DialogContent size="md" closable={false} maskClosable={false} className="exam-dialog">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-11 h-11 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle>Hết giờ làm bài</DialogTitle>
                <DialogDescription className="mt-1">
                  Thời gian làm bài đã hết. Bài thi sẽ được tự động nộp trong giây lát.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tiến độ của bạn</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {answeredCount}<span className="text-base font-medium text-slate-400">/{totalQuestions}</span>
                  <span className="ml-2 text-sm font-medium text-slate-500">
                    ({totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0}%)
                  </span>
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => exam.submitTimeout()}
              disabled={exam.isTimingOut}
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer min-w-[180px] w-full sm:w-auto"
            >
              {exam.isTimingOut ? 'Đang xử lý...' : 'Xem kết quả ngay'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
