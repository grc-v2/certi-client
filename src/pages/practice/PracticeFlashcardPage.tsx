'use client'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Layers, ChevronLeft, ChevronRight, RotateCcw,
  CheckCircle2, XCircle, Eye, EyeOff, BookOpen, ExternalLink, Sparkles, Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { type CertificationResponse } from '@/lib/api/certifications'
import { flashcardApi, type FlashcardQuestion } from '@/lib/api/flashcard'
import { toast } from 'sonner'
import CertificationPicker from './CertificationPicker'

const DIFFICULTIES: { value: string; label: string; color: string }[] = [
  { value: 'EASY',   label: 'Dễ',         color: 'border-green-400 text-green-600 dark:text-green-400 dark:border-green-500/50' },
  { value: 'MEDIUM', label: 'Trung bình', color: 'border-yellow-400 text-yellow-600 dark:text-yellow-400 dark:border-yellow-500/50' },
  { value: 'HARD',   label: 'Khó',        color: 'border-red-400 text-red-600 dark:text-red-400 dark:border-red-500/50' },
]
const COUNT_OPTIONS = [10, 20, 30, 50]

type Mark = 'easy' | 'hard'

export default function PracticeFlashcardPage() {
  const navigate = useNavigate()
  const [cert, setCert] = useState<CertificationResponse | null>(null)
  const [count, setCount] = useState(20)
  const [difficulties, setDifficulties] = useState<string[]>(['EASY', 'MEDIUM', 'HARD'])
  const [questions, setQuestions] = useState<FlashcardQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [marks, setMarks] = useState<Record<number, Mark>>({})
  const [finished, setFinished] = useState(false)

  const fetchMutation = useMutation({
    mutationFn: () => flashcardApi.fetch({
      certificationId: cert!.id,
      difficulties,
      count,
    }),
    onSuccess: (data) => {
      if (!data.length) {
        toast.error('Không tìm thấy câu hỏi phù hợp.')
        return
      }
      setQuestions(data)
      setIndex(0)
      setShowAnswer(false)
      setMarks({})
      setFinished(false)
    },
    onError: () => toast.error('Không thể bắt đầu phiên flashcard.'),
  })

  const toggleDifficulty = (level: string) => {
    setDifficulties(prev =>
      prev.includes(level)
        ? (prev.length > 1 ? prev.filter(l => l !== level) : prev)
        : [...prev, level],
    )
  }

  const resetSession = () => {
    setQuestions([])
    setIndex(0)
    setShowAnswer(false)
    setMarks({})
    setFinished(false)
  }

  // ── Stage 1: Certification picker ────────────────────────────────────────────
  if (!cert) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/practice')} className="text-sm text-slate-500 hover:text-primary inline-flex items-center gap-1 mb-4 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />Quay lại
        </button>
        <CertificationPicker
          title="Flashcard"
          subtitle="Lật thẻ để xem đáp án. Tự đánh giá xem bạn đã nắm chắc câu hỏi chưa."
          onSelect={setCert}
        />
      </div>
    )
  }

  // ── Stage 2: Settings + start ────────────────────────────────────────────────
  if (!questions.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <button onClick={() => setCert(null)} className="text-sm text-slate-500 hover:text-primary inline-flex items-center gap-1 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />Chọn chứng chỉ khác
        </button>

        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Flashcard</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">{cert.name}</p>
          </div>
        </div>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số lượng thẻ</Label>
              <div className="flex gap-2 flex-wrap">
                {COUNT_OPTIONS.map(c => (
                  <button
                    key={c}
                    onClick={() => setCount(c)}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40',
                      count === c
                        ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-500/40',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Độ khó</Label>
              <div className="flex gap-2 flex-wrap">
                {DIFFICULTIES.map(d => {
                  const selected = difficulties.includes(d.value)
                  return (
                    <button
                      key={d.value}
                      onClick={() => toggleDifficulty(d.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40',
                        selected
                          ? d.color
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300',
                      )}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 px-3 py-2.5 flex items-start gap-2">
              <Sparkles className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
              <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                Flashcard là chế độ <strong>tự ôn</strong>. Kết quả &ldquo;Đã thuộc&rdquo; / &ldquo;Cần ôn lại&rdquo;
                được lưu cục bộ trên thiết bị và không ảnh hưởng tới điểm luyện tập của bạn.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => fetchMutation.mutate()}
          disabled={fetchMutation.isPending}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
        >
          <Play className="w-4 h-4 mr-1.5" />
          {fetchMutation.isPending ? 'Đang tải thẻ...' : `Bắt đầu (${count} thẻ)`}
        </Button>
      </div>
    )
  }

  // ── Stage 4: Summary ─────────────────────────────────────────────────────────
  if (finished) {
    const easy = Object.values(marks).filter(m => m === 'easy').length
    const hard = Object.values(marks).filter(m => m === 'hard').length
    const skipped = questions.length - easy - hard
    const masteryPct = questions.length > 0 ? Math.round((easy / questions.length) * 100) : 0

    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <Layers className="w-8 h-8 text-purple-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Hoàn thành phiên flashcard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {cert.name} · {questions.length} thẻ · {masteryPct}% đã nắm vững
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="border-emerald-200 dark:border-emerald-500/30">
            <CardContent className="p-4 text-center space-y-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">{easy}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-300">Đã thuộc</p>
            </CardContent>
          </Card>
          <Card className="border-orange-200 dark:border-orange-500/30">
            <CardContent className="p-4 text-center space-y-1">
              <XCircle className="w-5 h-5 text-orange-500 mx-auto" />
              <p className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 tabular-nums">{hard}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-orange-700 dark:text-orange-300">Cần ôn lại</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-4 text-center space-y-1">
              <Eye className="w-5 h-5 text-slate-400 mx-auto" />
              <p className="text-2xl font-extrabold text-slate-600 dark:text-slate-300 tabular-nums">{skipped}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Chưa đánh giá</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => { setIndex(0); setShowAnswer(false); setMarks({}); setFinished(false) }}
            className="flex-1 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />Ôn lại bộ thẻ này
          </Button>
          <Button
            onClick={() => { resetSession(); fetchMutation.mutate() }}
            disabled={fetchMutation.isPending}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />Tải bộ thẻ mới
          </Button>
        </div>
        <button
          onClick={() => navigate('/practice')}
          className="block mx-auto text-sm text-slate-500 hover:text-primary cursor-pointer"
        >
          Quay lại trang luyện tập
        </button>
      </div>
    )
  }

  // ── Stage 3: Flashcard view ──────────────────────────────────────────────────
  const q = questions[index]
  const mark = marks[q.id]
  const progress = ((index + 1) / questions.length) * 100
  const correctIds = new Set(q.options.filter(o => o.isCorrect).map(o => o.id))

  const markCard = (kind: Mark) => {
    setMarks(prev => ({ ...prev, [q.id]: kind }))
    if (index < questions.length - 1) {
      setIndex(i => i + 1)
      setShowAnswer(false)
    } else {
      setFinished(true)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={resetSession}
          className="text-sm text-slate-500 hover:text-primary inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />Thoát flashcard
        </button>
        <div className="text-xs text-slate-500 tabular-nums">{index + 1} / {questions.length}</div>
      </div>

      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <Card className="border-slate-200 dark:border-slate-800 min-h-[280px]">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wider font-bold text-purple-500">
              Câu hỏi{q.difficulty ? ` · ${q.difficulty}` : ''}
            </div>
            {mark && (
              <div className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full',
                mark === 'easy'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
              )}>
                {mark === 'easy' ? 'Đã thuộc' : 'Cần ôn lại'}
              </div>
            )}
          </div>

          <p className="text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed">{q.content}</p>

          {showAnswer ? (
            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-500">Đáp án</div>
              <div className="space-y-2">
                {q.options.map((o, oi) => {
                  const isCorrect = correctIds.has(o.id)
                  return (
                    <div
                      key={o.id}
                      className={cn(
                        'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm leading-relaxed',
                        isCorrect
                          ? 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-500/10 text-slate-900 dark:text-white font-medium'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 opacity-80',
                      )}
                    >
                      <span className={cn(
                        'font-bold flex-shrink-0',
                        isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400',
                      )}>
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      <span className="flex-1">{o.content}</span>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />}
                    </div>
                  )
                })}
              </div>

              {q.explanation && (
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3 flex gap-2">
                  <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{q.explanation}</p>
                </div>
              )}

              {q.referenceUrl && (
                <a
                  href={q.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />Tham khảo
                </a>
              )}
            </div>
          ) : (
            <div className="pt-4">
              <Button
                onClick={() => setShowAnswer(true)}
                variant="outline"
                className="w-full border-purple-300 dark:border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 cursor-pointer"
              >
                <Eye className="w-4 h-4 mr-1.5" />Lật thẻ — xem đáp án
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showAnswer && (
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
      )}

      <div className="flex items-center justify-between gap-2 pt-2">
        <Button
          variant="ghost"
          onClick={() => { setIndex(i => Math.max(0, i - 1)); setShowAnswer(false) }}
          disabled={index === 0}
          className="cursor-pointer disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />Trước
        </Button>
        {showAnswer ? (
          <Button
            variant="ghost"
            onClick={() => setShowAnswer(false)}
            className="text-slate-500 cursor-pointer"
          >
            <EyeOff className="w-4 h-4 mr-1" />Ẩn đáp án
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => { setIndex(0); setShowAnswer(false); setMarks({}) }}
            className="text-slate-500 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-1" />Làm lại
          </Button>
        )}
        {index === questions.length - 1 ? (
          <Button
            onClick={() => setFinished(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
          >
            Kết thúc
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
