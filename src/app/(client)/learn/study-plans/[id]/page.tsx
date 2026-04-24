'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useState, type ElementType } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, Clock, Target, BookOpen,
  RotateCcw, FileText, CheckCircle2, Circle, Flag,
  ChevronDown, ChevronUp, Zap, Lightbulb, ListChecks, AlertCircle,
  ExternalLink, GraduationCap, FileQuestion, ClipboardList, ScrollText,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  studyPlansApi,
  type DailyTask, type DailyTaskType, type StudyWeek, type MilestoneResponse,
  type StudyPlanLessonResponse, type LessonStatus, type LessonResourceType,
} from '@/lib/api/study-plans'
import { formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'

// ── Constants ─────────────────────────────────────────────────────────────────

const TASK_TYPE_META: Record<DailyTaskType, { label: string; color: string; Icon: ElementType }> = {
  STUDY:     { label: 'Học',     color: 'text-[#0A66C2] bg-[#0A66C2]/10', Icon: BookOpen },
  PRACTICE:  { label: 'Luyện',   color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30', Icon: Target },
  REVIEW:    { label: 'Ôn tập',  color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30', Icon: RotateCcw },
  MOCK_EXAM: { label: 'Thi thử', color: 'text-red-500 bg-red-50 dark:bg-red-950/30', Icon: FileText },
}

const PHASE_LABEL: Record<string, { label: string; color: string }> = {
  LEARNING:   { label: 'Học',        color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  REVIEW:     { label: 'Ôn tập',     color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' },
  FINAL_PREP: { label: 'Chuẩn bị',   color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' },
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Đang học', COMPLETED: 'Hoàn thành', PAUSED: 'Tạm dừng', CANCELLED: 'Đã hủy',
}
const STATUS_COLOR: Record<string, string> = {
  ACTIVE:    'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  COMPLETED: 'bg-[#0A66C2]/10 text-[#0A66C2]',
  PAUSED:    'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
}

const EXP_LABEL: Record<string, string> = {
  BEGINNER: 'Mới bắt đầu', INTERMEDIATE: 'Trung cấp', ADVANCED: 'Nâng cao', EXPERT: 'Chuyên gia',
}

const LESSON_STATUS_META: Record<LessonStatus, { label: string; color: string }> = {
  AVAILABLE:   { label: 'Sẵn sàng',    color: 'bg-[#0A66C2]/10 text-[#0A66C2]' },
  IN_PROGRESS: { label: 'Đang học',    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' },
  COMPLETED:   { label: 'Hoàn thành', color: 'bg-[#22C55E]/10 text-[#22C55E]' },
}

const RESOURCE_TYPE_META: Record<LessonResourceType, { label: string; Icon: ElementType }> = {
  DOC:          { label: 'Tài liệu',    Icon: ScrollText },
  POST:         { label: 'Bài viết',    Icon: FileText },
  QUESTION_SET: { label: 'Bộ câu hỏi', Icon: FileQuestion },
  EXAM:         { label: 'Đề thi',      Icon: ClipboardList },
}

const LEVEL_LABEL: Record<string, string> = {
  FOUNDATIONAL: 'Nền tảng', INTERMEDIATE: 'Trung cấp', ADVANCED: 'Nâng cao', EXPERT: 'Chuyên gia',
}

// ── Lesson Detail Sheet ───────────────────────────────────────────────────────

function LessonDetailSheet({
  planId,
  lessonId,
  onClose,
  onCompleted,
}: {
  planId: string
  lessonId: number | null
  onClose: () => void
  onCompleted: () => void
}) {
  const queryClient = useQueryClient()

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson-detail', planId, lessonId],
    queryFn: () => studyPlansApi.getLessonDetail(planId, lessonId!),
    enabled: lessonId !== null,
  })

  const completeMutation = useMutation({
    mutationFn: () => studyPlansApi.completeLesson(planId, lessonId!),
    onSuccess: () => {
      toast.success('Đã hoàn thành bài học!')
      queryClient.invalidateQueries({ queryKey: ['study-plan', planId] })
      queryClient.invalidateQueries({ queryKey: ['domain-lessons', planId] })
      queryClient.invalidateQueries({ queryKey: ['lesson-detail', planId, lessonId] })
      onCompleted()
      onClose()
    },
    onError: (err: unknown) => {
      const code = (err as { response?: { data?: { errorCode?: string } } })?.response?.data?.errorCode
      if (code === 'ALREADY_COMPLETED') {
        toast.info('Bài học đã được hoàn thành trước đó')
      } else {
        toast.error('Không thể cập nhật bài học')
      }
    },
  })

  const isDone = lesson?.status === 'COMPLETED'

  return (
    <Sheet open={lessonId !== null} onOpenChange={open => { if (!open) onClose() }}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col gap-0 p-0">
        <SheetHeader className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <SheetTitle className="text-base font-semibold text-slate-900 dark:text-white">
            Chi tiết bài học
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 p-5 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ) : lesson ? (
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4 text-[#0A66C2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">{lesson.lessonTitle}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge className={cn('text-[10px] px-1.5 h-4 border-0', LESSON_STATUS_META[lesson.status].color)}>
                      {LESSON_STATUS_META[lesson.status].label}
                    </Badge>
                    <span className="text-[11px] text-slate-400">{LEVEL_LABEL[lesson.level] ?? lesson.level}</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />{lesson.estimatedMinutes}ph
                    </span>
                    <span className="text-[11px] text-slate-400">Tuần {lesson.scheduledWeek}</span>
                  </div>
                </div>
                {isDone && <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-1" />}
              </div>
              {lesson.lessonSummary && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">{lesson.lessonSummary}</p>
              )}
              {lesson.progress > 0 && !isDone && (
                <div className="mt-3">
                  <Progress value={lesson.progress} className="h-1.5" />
                  <p className="text-[11px] text-slate-400 mt-1">{lesson.progress}% hoàn thành</p>
                </div>
              )}
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Outcomes */}
              {lesson.outcomes.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 mb-2">
                    <ListChecks className="w-3.5 h-3.5 text-[#0A66C2]" />
                    <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Kết quả học tập</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {lesson.outcomes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0A66C2] flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Resources */}
              {lesson.resources.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                    <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Tài nguyên học tập</h3>
                  </div>
                  <div className="space-y-2">
                    {lesson.resources
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map(res => {
                        const meta = RESOURCE_TYPE_META[res.type] ?? RESOURCE_TYPE_META.DOC
                        return (
                          <div key={res.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                              <meta.Icon className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{meta.label}</p>
                              {res.url && (
                                <p className="text-[11px] text-slate-400 truncate">{res.url}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {res.mandatory && (
                                <Badge className="text-[9px] px-1 h-3.5 border-0 bg-red-50 text-red-500 dark:bg-red-950/30">Bắt buộc</Badge>
                              )}
                              {res.url && (
                                <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:text-[#084E96]">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </section>
              )}

              {isDone && lesson.completedAt && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                  Hoàn thành lúc {new Date(lesson.completedAt).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          </div>
        ) : null}

        {lesson && !isDone && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              className="w-full bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer"
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {completeMutation.isPending ? 'Đang lưu...' : 'Hoàn thành bài học'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ── Domain Lessons Panel ──────────────────────────────────────────────────────

function DomainLessonsPanel({
  planId,
  domainId,
  onLessonClick,
}: {
  planId: string
  domainId: number
  onLessonClick: (lessonId: number) => void
}) {
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['domain-lessons', planId, domainId],
    queryFn: () => studyPlansApi.getDomainLessons(planId, domainId),
  })

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!lessons || lessons.length === 0) {
    return <p className="text-xs text-slate-400 text-center py-4">Chưa có bài học nào</p>
  }

  return (
    <div className="space-y-1.5">
      {lessons
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map(lesson => {
          const statusMeta = LESSON_STATUS_META[lesson.status]
          const isDone = lesson.status === 'COMPLETED'
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => onLessonClick(lesson.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left cursor-pointer',
                isDone ? 'opacity-70' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
              )}
            >
              <div className="w-6 h-6 rounded-md bg-[#0A66C2]/10 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-3.5 h-3.5 text-[#0A66C2]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-xs font-medium truncate', isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200')}>
                  {lesson.lessonTitle}
                </p>
                <p className="text-[10px] text-slate-400">{LEVEL_LABEL[lesson.level] ?? lesson.level} · {lesson.estimatedMinutes}ph · Tuần {lesson.scheduledWeek}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge className={cn('text-[9px] px-1.5 h-4 border-0', statusMeta.color)}>
                  {statusMeta.label}
                </Badge>
                {isDone
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                  : <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                }
              </div>
            </button>
          )
        })}
    </div>
  )
}

// ── Task Detail Sheet ─────────────────────────────────────────────────────────

function TaskDetailSheet({
  planId,
  taskId,
  onClose,
  onCompleted,
}: {
  planId: string
  taskId: number | null
  onClose: () => void
  onCompleted: () => void
}) {
  const [actualMinutes, setActualMinutes] = useState<number>(0)
  const queryClient = useQueryClient()

  const { data: task, isLoading } = useQuery({
    queryKey: ['task-detail', planId, taskId],
    queryFn: () => studyPlansApi.getTaskDetail(planId, taskId!),
    enabled: taskId !== null,
  })

  const completeMutation = useMutation({
    mutationFn: () => studyPlansApi.completeTask(planId, taskId!, actualMinutes || task!.estimatedMinutes),
    onSuccess: () => {
      toast.success('Đã hoàn thành task!')
      queryClient.invalidateQueries({ queryKey: ['study-plan', planId] })
      onCompleted()
      onClose()
    },
    onError: () => toast.error('Không thể cập nhật task'),
  })

  const meta = task ? TASK_TYPE_META[task.taskType] ?? TASK_TYPE_META.STUDY : null
  const isDone = task?.status === 'COMPLETED'

  return (
    <Sheet open={taskId !== null} onOpenChange={open => { if (!open) onClose() }}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <SheetTitle className="text-base font-semibold text-slate-900 dark:text-white">
            Chi tiết nhiệm vụ
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 p-5 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ) : task && meta ? (
          <div className="flex-1 overflow-y-auto">
            {/* Task header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', meta.color)}>
                  <meta.Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge className={cn('text-[10px] px-1.5 h-4 border-0', meta.color)}>
                      {meta.label}
                    </Badge>
                    {task.domainName && (
                      <span className="text-[11px] text-slate-500">{task.domainName}</span>
                    )}
                    <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />{task.estimatedMinutes}ph
                    </span>
                    <span className="text-[11px] text-slate-400">{formatDate(task.scheduledDate)}</span>
                  </div>
                </div>
                {isDone && <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-1" />}
              </div>
            </div>

            {/* Content sections */}
            <div className="px-5 py-4 space-y-4">
              {task.keyKnowledge.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Kiến thức trọng tâm</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {task.keyKnowledge.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {task.learningObjectives.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 mb-2">
                    <ListChecks className="w-3.5 h-3.5 text-[#0A66C2]" />
                    <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Mục tiêu học tập</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {task.learningObjectives.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0A66C2] flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {task.examTips.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                    <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Mẹo thi</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {task.examTips.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        ) : null}

        {/* Footer: complete action */}
        {task && !isDone && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600 dark:text-slate-400 flex-shrink-0">Thời gian thực tế (phút)</label>
              <Input
                type="number"
                min={1}
                max={480}
                placeholder={String(task.estimatedMinutes)}
                value={actualMinutes || ''}
                onChange={e => setActualMinutes(Number(e.target.value))}
                className="h-8 text-sm w-24"
              />
            </div>
            <Button
              className="w-full bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer"
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {completeMutation.isPending ? 'Đang lưu...' : 'Hoàn thành nhiệm vụ'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TaskRow({ task, onClick }: { task: DailyTask; onClick: () => void }) {
  const meta = TASK_TYPE_META[task.taskType] ?? TASK_TYPE_META.STUDY
  const done = task.status === 'COMPLETED'
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left cursor-pointer',
        done ? 'opacity-60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
      )}
    >
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', meta.color)}>
        <meta.Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200')}>
          {task.title}
        </p>
        <p className="text-[11px] text-slate-400 truncate">{task.domainName}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-slate-400">{task.estimatedMinutes}ph</span>
        {done
          ? <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
        }
      </div>
    </button>
  )
}

function WeekCard({
  week,
  defaultOpen,
  onTaskClick,
}: {
  week: StudyWeek
  defaultOpen?: boolean
  onTaskClick: (taskId: number) => void
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const phase = PHASE_LABEL[week.phase]
  const progressPct = week.plannedHours > 0 ? (week.completedHours / week.plannedHours) * 100 : 0

  const tasksByDate: Record<string, DailyTask[]> = {}
  for (const t of week.dailyTasks) {
    if (!tasksByDate[t.scheduledDate]) tasksByDate[t.scheduledDate] = []
    tasksByDate[t.scheduledDate].push(t)
  }
  const sortedDates = Object.keys(tasksByDate).sort()

  return (
    <Card className={cn(
      'border transition-colors',
      week.status === 'IN_PROGRESS'
        ? 'border-[#0A66C2]/30 dark:border-[#0A66C2]/40'
        : 'border-slate-200 dark:border-slate-700',
    )}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left cursor-pointer"
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  Tuần {week.weekNumber}
                </span>
                {phase && (
                  <Badge className={cn('text-[10px] px-1.5 py-0 h-4 border-0', phase.color)}>
                    {phase.label}
                  </Badge>
                )}
                {week.status === 'IN_PROGRESS' && (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 border-0 bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                    Đang học
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{week.theme}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {formatDate(week.startDate)} – {formatDate(week.endDate)}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {week.completedHours.toFixed(1)}/{week.plannedHours.toFixed(1)}h
                </p>
                <p className="text-[10px] text-slate-400">{progressPct.toFixed(0)}%</p>
              </div>
              {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>
          {week.status !== 'UPCOMING' && (
            <Progress value={progressPct} className="h-1 mt-3" />
          )}
        </CardContent>
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 space-y-4">
          {sortedDates.map(date => (
            <div key={date}>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 px-3">
                {formatDate(date)}
              </p>
              <div className="space-y-0.5">
                {tasksByDate[date]
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map(task => (
                    <TaskRow key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function MilestoneCard({ m }: { m: MilestoneResponse }) {
  const done = m.status === 'ACHIEVED'
  const pct = m.targetValue > 0 ? Math.min((m.achievedValue / m.targetValue) * 100, 100) : 0
  return (
    <div className={cn(
      'flex gap-4 p-4 rounded-xl border',
      done ? 'border-[#22C55E]/30 bg-[#22C55E]/5 dark:bg-[#22C55E]/10' : 'border-slate-200 dark:border-slate-700',
    )}>
      <div className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
        done ? 'bg-[#22C55E] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400',
      )}>
        {done ? <CheckCircle2 className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('font-medium text-sm', done ? 'text-[#22C55E]' : 'text-slate-900 dark:text-white')}>
            {m.title}
          </p>
          <Badge className={cn(
            'text-[10px] px-1.5 h-4 border-0 flex-shrink-0',
            done ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-slate-100 text-slate-500 dark:bg-slate-800',
          )}>
            {done ? 'Đạt' : 'Chưa đạt'}
          </Badge>
        </div>
        {m.description && <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>}
        <div className="flex items-center gap-3 mt-2">
          {m.targetDate && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />{formatDate(m.targetDate)}
            </span>
          )}
          <span className="text-[11px] text-slate-400">
            {m.achievedValue}/{m.targetValue}
          </span>
        </div>
        {!done && m.targetValue > 0 && (
          <Progress value={pct} className="h-1 mt-2" />
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudyPlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [expandedDomains, setExpandedDomains] = useState<Set<number>>(new Set())

  function toggleDomainLessons(domainId: number) {
    setExpandedDomains(prev => {
      const next = new Set(prev)
      if (next.has(domainId)) next.delete(domainId)
      else next.add(domainId)
      return next
    })
  }

  const { data: plan, isLoading } = useQuery({
    queryKey: ['study-plan', id],
    queryFn: () => studyPlansApi.getById(id),
  })

  if (isLoading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      <div className="h-44 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />)}
      </div>
    </div>
  )

  if (!plan) return <div className="text-center py-16 text-slate-500">Không tìm thấy kế hoạch</div>

  const daysLeft = Math.ceil((new Date(plan.examDate).getTime() - Date.now()) / 86400000)
  const currentWeekIdx = plan.weeks.findIndex(w => w.status === 'IN_PROGRESS')

  return (
    <div className="space-y-6">
      <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors">
        <ArrowLeft className="w-4 h-4" />Học tập
      </Link>

      {/* Hero */}
      <Card className="border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0A66C2] to-[#084E96] p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge className={cn('border-0 text-xs', STATUS_COLOR[plan.status])}>
                  {STATUS_LABEL[plan.status] ?? plan.status}
                </Badge>
                <Badge className="bg-white/20 text-white border-0 text-xs">
                  {EXP_LABEL[plan.experienceLevel] ?? plan.experienceLevel}
                </Badge>
              </div>
              <h1 className="text-xl font-bold leading-snug">{plan.certificationName}</h1>
              <div className="flex items-center gap-4 mt-2 text-blue-100 text-xs flex-wrap">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Ngày thi: {formatDate(plan.examDate)}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{plan.dailyStudyMinutes} phút/ngày</span>
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" />{plan.studyDaysPerWeek} ngày/tuần</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-4xl font-bold">{plan.progress.toFixed(0)}%</div>
              <div className="text-xs text-blue-100 mt-0.5">
                {daysLeft > 0 ? `${daysLeft} ngày còn lại` : daysLeft === 0 ? 'Hôm nay thi!' : `Quá ${-daysLeft} ngày`}
              </div>
            </div>
          </div>
          <Progress value={plan.progress} className="mt-4 h-2 bg-white/20 [&>div]:bg-[#22C55E]" />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng giờ học', value: `${plan.totalStudyHours}h`, sub: `${plan.totalWeeks} tuần`, icon: BookOpen, color: 'text-[#0A66C2]' },
          { label: 'Đã hoàn thành', value: `${plan.completedHours.toFixed(1)}h`, sub: `${plan.progress.toFixed(0)}% tiến độ`, icon: CheckCircle2, color: 'text-[#22C55E]' },
          { label: 'Sẵn sàng thi', value: `${plan.readiness.toFixed(0)}%`, sub: 'Chỉ số readiness', icon: Target, color: 'text-orange-500' },
          { label: 'Milestones', value: `${plan.milestones.filter(m => m.status === 'ACHIEVED').length}/${plan.milestones.length}`, sub: 'Cột mốc đạt được', icon: Flag, color: 'text-purple-500' },
        ].map(s => (
          <Card key={s.label} className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                  <p className={cn('text-xl font-bold mt-0.5', s.color)}>{s.value}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{s.sub}</p>
                </div>
                <s.icon className={cn('w-5 h-5 opacity-60 flex-shrink-0', s.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule" className="cursor-pointer">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />Lịch học ({plan.weeks.length} tuần)
          </TabsTrigger>
          <TabsTrigger value="domains" className="cursor-pointer">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />Domain ({plan.domainAllocations.length})
          </TabsTrigger>
          <TabsTrigger value="milestones" className="cursor-pointer">
            <Flag className="w-3.5 h-3.5 mr-1.5" />Cột mốc ({plan.milestones.length})
          </TabsTrigger>
        </TabsList>

        {/* Weekly schedule */}
        <TabsContent value="schedule" className="mt-4 space-y-3">
          {plan.weeks.map((week, idx) => (
            <WeekCard
              key={week.id}
              week={week}
              defaultOpen={idx === currentWeekIdx}
              onTaskClick={setSelectedTaskId}
            />
          ))}
        </TabsContent>

        {/* Domain allocations */}
        <TabsContent value="domains" className="mt-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {plan.domainAllocations
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map(domain => {
                const pct = domain.allocatedHours > 0 ? (domain.completedHours / domain.allocatedHours) * 100 : 0
                const lessonsOpen = expandedDomains.has(domain.domainId)
                return (
                  <Card key={domain.id} className="border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{domain.domainName}</p>
                          <p className="text-[11px] text-slate-400">{domain.domainCode}</p>
                        </div>
                        <Badge className="text-[10px] px-1.5 h-4 border-0 bg-[#0A66C2]/10 text-[#0A66C2] flex-shrink-0">
                          {domain.weightPercentage}%
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{domain.completedHours.toFixed(1)}h / {domain.allocatedHours.toFixed(1)}h</span>
                          <span className="font-medium">{pct.toFixed(0)}%</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className="text-[10px] px-1.5 h-4 border-0 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {domain.proficiencyLevel}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => toggleDomainLessons(domain.domainId)}
                          className="flex items-center gap-1 text-[11px] text-[#0A66C2] hover:text-[#084E96] cursor-pointer transition-colors"
                        >
                          <GraduationCap className="w-3 h-3" />
                          Bài học
                          {lessonsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {lessonsOpen && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <DomainLessonsPanel
                            planId={id}
                            domainId={domain.domainId}
                            onLessonClick={setSelectedLessonId}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        {/* Milestones */}
        <TabsContent value="milestones" className="mt-4 space-y-3">
          {plan.milestones.map(m => <MilestoneCard key={m.id} m={m} />)}
        </TabsContent>
      </Tabs>

      {/* Task detail sheet */}
      <TaskDetailSheet
        planId={id}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onCompleted={() => setSelectedTaskId(null)}
      />

      {/* Lesson detail sheet */}
      <LessonDetailSheet
        planId={id}
        lessonId={selectedLessonId}
        onClose={() => setSelectedLessonId(null)}
        onCompleted={() => setSelectedLessonId(null)}
      />
    </div>
  )
}
