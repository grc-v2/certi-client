'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
  CheckCircle2, XCircle, Trophy, Clock, Target, BarChart3,
  ArrowLeft, RotateCcw, ChevronDown, ChevronUp, Zap, AlertCircle,
  ListChecks, History, BookOpen, ChevronLeft, ChevronRight,
  Minus, Flag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  resultsApi,
  type TopicPerformance,
  type QuestionReportItem,
  type QuestionReportParams,
} from '@/lib/api/results'
import { cn } from '@/lib/utils'

function formatSeconds(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}g ${m}ph`
  return `${m} phút`
}

function DifficultyBar({ label, data, color }: {
  label: string
  data: { total: number; correct: number; percentage: number }
  color: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-300">{label}</span>
        <span className="font-medium text-zinc-900 dark:text-white">
          {data.correct}/{data.total} <span className="text-zinc-400 font-normal">({data.percentage.toFixed(0)}%)</span>
        </span>
      </div>
      <Progress value={data.percentage} strokeWidth={8} strokeColor={color} />
    </div>
  )
}

function TopicCard({ topic }: { topic: TopicPerformance }) {
  const [open, setOpen] = useState(false)
  const statusColor =
    topic.status === 'EXCELLENT' ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' :
    topic.status === 'GOOD'      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'  :
    topic.status === 'AVERAGE'   ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400' :
    'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-medium text-zinc-900 dark:text-white text-sm">{topic.topicName}</span>
            <Badge className={cn('text-xs', statusColor)}>{topic.status}</Badge>
            {topic.weight != null && <span className="text-xs text-zinc-400">{topic.weight}%</span>}
          </div>
          <Progress
            value={topic.percentage}
            strokeWidth={6}
            strokeColor={topic.percentage >= 70 ? '#22C55E' : '#EF4444'}
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>{topic.correctAnswers}/{topic.totalQuestions} câu đúng</span>
            <span className={cn('font-semibold', topic.percentage >= 70 ? 'text-[#22C55E]' : 'text-red-500')}>
              {topic.percentage.toFixed(0)}%
            </span>
          </div>
        </div>
        {topic.recommendations?.length > 0 && (
          open ? <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0" />
               : <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        )}
      </button>
      {open && topic.recommendations?.length > 0 && (
        <div className="px-4 pb-4 space-y-1 bg-zinc-50/50 dark:bg-zinc-800/20">
          {topic.recommendations.map((r, i) => (
            <p key={i} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
              <span className="text-accent mt-0.5">•</span>{r}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

const DIFFICULTY_LABELS: Record<string, string> = { EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó' }
const DIFFICULTY_COLORS: Record<string, string> = {
  EASY:   'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
  HARD:   'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
}

function QuestionCard({ q }: { q: QuestionReportItem }) {
  const [open, setOpen] = useState(false)
  const skipped = q.userAnswer.isCorrect === null
  const correct = q.userAnswer.isCorrect === true

  return (
    <div className={cn(
      'border rounded-lg overflow-hidden',
      correct  ? 'border-[#22C55E]/40' :
      skipped  ? 'border-zinc-200 dark:border-zinc-700' :
                 'border-red-400/40',
    )}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors text-left"
      >
        {/* Status icon */}
        <div className="flex-shrink-0 mt-0.5">
          {correct  ? <CheckCircle2 className="w-5 h-5 text-[#22C55E]" /> :
           skipped  ? <Minus className="w-5 h-5 text-zinc-400" /> :
                      <XCircle className="w-5 h-5 text-red-500" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-zinc-500">#{q.questionNumber}</span>
            <Badge className="text-xs bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
              {q.topicName}
            </Badge>
            {q.difficulty && (
              <Badge className={cn('text-xs', DIFFICULTY_COLORS[q.difficulty])}>
                {DIFFICULTY_LABELS[q.difficulty] ?? q.difficulty}
              </Badge>
            )}
            {q.wasFlagged && <Flag className="w-3.5 h-3.5 text-orange-400" />}
          </div>
          <p className="text-sm text-zinc-800 dark:text-zinc-200 line-clamp-2">{q.content}</p>
        </div>

        <div className="flex-shrink-0 mt-1">
          {open ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
          {/* User answer status */}
          <div className="pt-3">
            {skipped ? (
              <p className="text-xs text-zinc-500 italic">Bạn đã bỏ qua câu này</p>
            ) : (
              <div className={cn(
                'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                correct ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-red-500/10 text-red-500',
              )}>
                {correct
                  ? <><CheckCircle2 className="w-3.5 h-3.5" />Câu trả lời đúng</>
                  : <><XCircle className="w-3.5 h-3.5" />Câu trả lời sai</>}
              </div>
            )}
          </div>

          {/* Explanation */}
          {q.explanation && (
            <div className="bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-lg p-3">
              <p className="text-xs font-semibold text-accent mb-1">Giải thích</p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{q.explanation}</p>
            </div>
          )}

          {/* Time spent */}
          {q.userAnswer.timeSpent > 0 && (
            <p className="text-xs text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />Thời gian: {q.userAnswer.timeSpent}s
            </p>
          )}
        </div>
      )}
    </div>
  )
}

const FILTER_TABS = [
  { key: undefined,    label: 'Tất cả' },
  { key: 'correct',   label: 'Đúng' },
  { key: 'wrong',     label: 'Sai' },
  { key: 'skipped',   label: 'Bỏ qua' },
] as const

function QuestionsSection({ resultId }: { resultId: string }) {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<QuestionReportParams['filter']>(undefined)

  const { data, isLoading } = useQuery({
    queryKey: ['result-questions', resultId, page, filter],
    queryFn: () => resultsApi.getQuestions(resultId, { page, size: 10, filter }),
  })

  const pagination = data?.pagination

  return (
    <Card className="border-zinc-200 dark:border-zinc-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />Chi tiết từng câu hỏi
        </CardTitle>

        {/* Summary chips */}
        {data?.summary && (
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              Tổng: {data.summary.totalQuestions}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E]">
              Đúng: {data.summary.correct}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
              Sai: {data.summary.wrong}
            </span>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1 pt-1 flex-wrap">
          {FILTER_TABS.map(tab => (
            <button
              key={String(tab.key)}
              onClick={() => { setFilter(tab.key); setPage(0) }}
              className={cn(
                'text-xs px-3 py-1 rounded-full transition-colors cursor-pointer',
                filter === tab.key
                  ? 'bg-accent text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : data?.questions?.length === 0 ? (
          <p className="text-sm text-center text-zinc-500 py-6">Không có câu hỏi nào</p>
        ) : (
          data?.questions?.map(q => <QuestionCard key={q.questionId} q={q} />)
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.first}
              onClick={() => setPage(p => p - 1)}
              className="cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />Trước
            </Button>
            <span className="text-xs text-zinc-500">
              Trang {pagination.pageNumber + 1} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.last}
              onClick={() => setPage(p => p + 1)}
              className="cursor-pointer"
            >
              Tiếp<ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ExamResultPage() {
  const { sessionId: resultId } = useParams<{ sessionId: string }>()

  const { data: result, isLoading } = useQuery({
    queryKey: ['result', resultId],
    queryFn: () => resultsApi.getResult(resultId),
  })

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
      <div className="h-56 bg-zinc-200 dark:bg-zinc-700 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />)}
      </div>
    </div>
  )

  if (!result) return <div className="text-center py-16 text-zinc-500">Không tìm thấy kết quả</div>

  const { summary, difficultyAnalysis: diff } = result
  const passed = summary.status === 'PASSED'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/certifications" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer transition-colors">
          <ArrowLeft className="w-4 h-4" />Về danh mục
        </Link>
        <Link to="/certifications/exam-history" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-accent cursor-pointer transition-colors">
          <History className="w-4 h-4" />Lịch sử thi
        </Link>
      </div>

      {/* Hero */}
      <Card className="border-0 overflow-hidden">
        <div className={cn(
          'p-8 text-center',
          passed
            ? 'bg-gradient-to-br from-[#22C55E] to-[#16A34A]'
            : 'bg-gradient-to-br from-red-500 to-red-700',
        )}>
          {/* Badges */}
          {result.badges?.length > 0 && (
            <div className="flex justify-center gap-2 mb-4">
              {result.badges.map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-white text-xs font-medium">
                  <Trophy className="w-3.5 h-3.5" />{b.name}
                </div>
              ))}
            </div>
          )}
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
            {passed ? <Trophy className="w-10 h-10 text-white" /> : <XCircle className="w-10 h-10 text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {passed ? 'Chúc mừng! Bạn đã đỗ' : 'Chưa đạt – Tiếp tục cố gắng!'}
          </h1>
          <p className="text-white/80 text-sm mb-1">{result.examTitle}</p>
          <p className="text-white/60 text-xs mb-5">{result.certificationName}</p>
          <div className="text-6xl font-bold text-white mb-1">{summary.percentage.toFixed(0)}%</div>
          <p className="text-white/70 text-sm mb-4">Điểm chuẩn đỗ: {summary.passingScore}%</p>
          <Progress value={summary.percentage} className="max-w-xs mx-auto" strokeWidth={12} strokeColor="#ffffff" trailColor="rgba(255,255,255,0.3)" />
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: CheckCircle2, label: 'Câu đúng',    value: `${summary.correctAnswers}/${summary.totalQuestions}`, color: 'text-[#22C55E]' },
          { icon: XCircle,      label: 'Câu sai',     value: String(summary.wrongAnswers),   color: 'text-red-500' },
          { icon: Clock,        label: 'Thời gian',   value: formatSeconds(summary.totalTimeSpent), color: 'text-purple-500' },
          { icon: Target,       label: 'TB/câu',      value: `${summary.averageTimePerQuestion}s`, color: 'text-accent' },
        ].map((s, i) => (
          <Card key={i} className="border-zinc-200 dark:border-zinc-700">
            <CardContent className="p-4 text-center">
              <s.icon className={cn('w-5 h-5 mx-auto mb-1.5', s.color)} />
              <div className="text-lg font-bold text-zinc-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-zinc-500">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Difficulty analysis */}
      {diff && (
        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />Phân tích theo độ khó
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DifficultyBar label="Dễ"        data={diff.easy}   color="#22C55E" />
            <DifficultyBar label="Trung bình" data={diff.medium} color="#0A66C2" />
            <DifficultyBar label="Khó"        data={diff.hard}   color="#FB923C" />
          </CardContent>
        </Card>
      )}

      {/* Topic performance */}
      {result.topicPerformance?.length > 0 && (
        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-accent" />Kết quả theo chủ đề
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.topicPerformance.map(t => <TopicCard key={t.topicId} topic={t} />)}
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      {(result.strengths?.length > 0 || result.weaknesses?.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {result.strengths?.length > 0 && (
            <Card className="border-[#22C55E]/30 bg-[#22C55E]/5 dark:bg-[#22C55E]/10">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-[#22C55E] flex items-center gap-1.5 mb-3">
                  <Zap className="w-4 h-4" />Điểm mạnh
                </h3>
                <ul className="space-y-1.5">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] flex-shrink-0 mt-0.5" />{s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {result.weaknesses?.length > 0 && (
            <Card className="border-red-500/30 bg-red-500/5 dark:bg-red-500/10">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-red-500 flex items-center gap-1.5 mb-3">
                  <AlertCircle className="w-4 h-4" />Cần cải thiện
                </h3>
                <ul className="space-y-1.5">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />{w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Next steps */}
      {result.nextSteps?.length > 0 && (
        <Card className="border-accent/30 bg-accent/5 dark:bg-accent/10">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-accent dark:text-blue-400 flex items-center gap-1.5 mb-3">
              <Target className="w-4 h-4" />Bước tiếp theo
            </h3>
            <ul className="space-y-2">
              {result.nextSteps.map((s, i) => (
                <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-accent/20 dark:bg-blue-500/20 text-accent dark:text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Questions review */}
      <QuestionsSection resultId={resultId} />

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/certifications/exam-history" className="flex-1">
          <Button variant="outline" className="w-full cursor-pointer">
            <History className="w-4 h-4 mr-2" />Lịch sử thi
          </Button>
        </Link>
        <Link to={`/certifications`} className="flex-1">
          <Button className="w-full bg-accent hover:bg-zinc-800 text-white cursor-pointer">
            <RotateCcw className="w-4 h-4 mr-2" />Thi lại
          </Button>
        </Link>
      </div>
    </div>
  )
}
