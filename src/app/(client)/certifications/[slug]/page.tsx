'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  GraduationCap, Clock, BookOpen, Star,
  ChevronDown, ChevronUp, Play, Target, ArrowLeft, RotateCcw,
  Calendar, Zap, ChevronRight, CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AxiosError } from 'axios'
import { certificationsApi, type CertificationDomainResponse } from '@/lib/api/certifications'
import {
  studyPlansApi, type StudyPlanCreateRequest, type StudyDay, type DomainProficiency,
} from '@/lib/api/study-plans'
import {
  examSessionsApi, EXAM_SESSION_KEY, EXAM_INIT_KEY, normaliseResumeSession,
} from '@/lib/api/exam-sessions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Schema ────────────────────────────────────────────────────────────────────

const today = new Date()
today.setHours(0, 0, 0, 0)

const createPlanSchema = z.object({
  examDate: z.string()
    .min(1, 'Vui lòng chọn ngày thi')
    .refine(v => new Date(v) > today, 'Ngày thi phải là ngày trong tương lai'),
  dailyStudyMinutes: z.coerce.number()
    .min(15, 'Tối thiểu 15 phút')
    .max(480, 'Tối đa 480 phút'),
  studyDaysPerWeek: z.coerce.number()
    .min(1, 'Tối thiểu 1 ngày')
    .max(7, 'Tối đa 7 ngày'),
  preferredStudyDays: z.array(z.string()).optional(),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'], {
    error: 'Vui lòng chọn cấp độ kinh nghiệm',
  }),
  domainProficiencies: z.record(z.string(), z.string().optional()).optional(),
})

type CreatePlanForm = z.infer<typeof createPlanSchema>

// ── Constants ─────────────────────────────────────────────────────────────────

const STUDY_DAYS: { value: StudyDay; label: string }[] = [
  { value: 'MONDAY',    label: 'T2' },
  { value: 'TUESDAY',   label: 'T3' },
  { value: 'WEDNESDAY', label: 'T4' },
  { value: 'THURSDAY',  label: 'T5' },
  { value: 'FRIDAY',    label: 'T6' },
  { value: 'SATURDAY',  label: 'T7' },
  { value: 'SUNDAY',    label: 'CN' },
]

const EXPERIENCE_LEVELS = [
  { value: 'BEGINNER',     label: 'Mới bắt đầu',  desc: 'Chưa có kinh nghiệm' },
  { value: 'INTERMEDIATE', label: 'Trung cấp',     desc: 'Có kiến thức cơ bản' },
  { value: 'ADVANCED',     label: 'Nâng cao',      desc: 'Kinh nghiệm thực tế' },
  { value: 'EXPERT',       label: 'Chuyên gia',    desc: 'Thành thạo chuyên sâu' },
]

const PROFICIENCY_LEVELS: { value: DomainProficiency; label: string }[] = [
  { value: 'BEGINNER',   label: 'Mới bắt đầu' },
  { value: 'DEVELOPING', label: 'Đang phát triển' },
  { value: 'COMPETENT',  label: 'Có năng lực' },
  { value: 'PROFICIENT', label: 'Thành thạo' },
  { value: 'EXPERT',     label: 'Chuyên gia' },
]

const STEPS = [
  { label: 'Lịch học',    icon: Calendar },
  { label: 'Kinh nghiệm', icon: Zap },
  { label: 'Domain',      icon: BookOpen },
]

// ── Step progress bar ─────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                done   ? 'bg-[#0A66C2] text-white' :
                active ? 'bg-[#0A66C2]/10 text-[#0A66C2] ring-2 ring-[#0A66C2]' :
                         'bg-slate-100 dark:bg-slate-800 text-slate-400',
              )}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn(
                'text-[10px] font-medium whitespace-nowrap',
                active ? 'text-[#0A66C2]' : done ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400',
              )}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'h-px flex-1 mx-2 mb-4 transition-colors',
                i < current ? 'bg-[#0A66C2]' : 'bg-slate-200 dark:bg-slate-700',
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Steps content ─────────────────────────────────────────────────────────────

function Step1({
  register, errors, control,
}: {
  register: ReturnType<typeof useForm<CreatePlanForm>>['register']
  errors: ReturnType<typeof useForm<CreatePlanForm>>['formState']['errors']
  control: ReturnType<typeof useForm<CreatePlanForm>>['control']
}) {
  const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
      {/* Left column */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="examDate" className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Ngày thi mục tiêu <span className="text-red-500">*</span>
          </Label>
          <Input
            id="examDate"
            type="date"
            min={minDate}
            {...register('examDate')}
            className={cn('h-9 text-sm', errors.examDate && 'border-red-400')}
          />
          {errors.examDate && <p className="text-[11px] text-red-500">{errors.examDate.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dailyStudyMinutes" className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Thời gian học mỗi ngày <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="dailyStudyMinutes"
              type="number"
              min={15}
              max={480}
              placeholder="60"
              {...register('dailyStudyMinutes')}
              className={cn('h-9 text-sm pr-12', errors.dailyStudyMinutes && 'border-red-400')}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">phút</span>
          </div>
          {errors.dailyStudyMinutes
            ? <p className="text-[11px] text-red-500">{errors.dailyStudyMinutes.message}</p>
            : <p className="text-[11px] text-slate-400">15 – 480 phút mỗi ngày</p>}
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Số ngày học mỗi tuần
          </Label>
          <Controller
            name="studyDaysPerWeek"
            control={control}
            render={({ field }) => (
              <div className="flex gap-1.5">
                {[1,2,3,4,5,6,7].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => field.onChange(n)}
                    className={cn(
                      'flex-1 h-9 rounded-lg text-sm font-semibold transition-colors cursor-pointer border',
                      Number(field.value) === n
                        ? 'bg-[#0A66C2] text-white border-[#0A66C2]'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#0A66C2]/50',
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        <Controller
          name="preferredStudyDays"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Ngày học ưa thích
              </Label>
              <div className="flex gap-1.5">
                {STUDY_DAYS.map(day => {
                  const checked = (field.value ?? []).includes(day.value)
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        const curr = field.value ?? []
                        field.onChange(
                          checked ? curr.filter(d => d !== day.value) : [...curr, day.value]
                        )
                      }}
                      className={cn(
                        'flex-1 h-9 rounded-lg text-xs font-semibold transition-colors cursor-pointer border',
                        checked
                          ? 'bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]'
                          : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-[#0A66C2]/40',
                      )}
                    >
                      {day.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        />
      </div>
    </div>
  )
}

function Step2({
  control, errors,
}: {
  control: ReturnType<typeof useForm<CreatePlanForm>>['control']
  errors: ReturnType<typeof useForm<CreatePlanForm>>['formState']['errors']
}) {
  return (
    <Controller
      name="experienceLevel"
      control={control}
      render={({ field }) => (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Cấp độ kinh nghiệm của bạn <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2.5">
            {EXPERIENCE_LEVELS.map(lvl => {
              const active = field.value === lvl.value
              return (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => field.onChange(lvl.value)}
                  className={cn(
                    'p-3.5 rounded-xl border text-left transition-all cursor-pointer',
                    active
                      ? 'border-[#0A66C2] bg-[#0A66C2]/8 ring-1 ring-[#0A66C2]/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-[#0A66C2]/40 bg-white dark:bg-slate-800/50',
                  )}
                >
                  <div className={cn(
                    'text-sm font-semibold mb-0.5',
                    active ? 'text-[#0A66C2]' : 'text-slate-800 dark:text-slate-200',
                  )}>
                    {lvl.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{lvl.desc}</div>
                </button>
              )
            })}
          </div>
          {errors.experienceLevel && (
            <p className="text-[11px] text-red-500">{errors.experienceLevel.message}</p>
          )}
        </div>
      )}
    />
  )
}

function Step3({
  control, domains,
}: {
  control: ReturnType<typeof useForm<CreatePlanForm>>['control']
  domains: CertificationDomainResponse[]
}) {
  if (domains.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Không có domain nào để cấu hình</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Đánh giá trình độ của bạn cho từng domain. Hệ thống sẽ tối ưu kế hoạch học dựa trên thông tin này.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-hide">
        {domains.map(domain => (
          <Controller
            key={domain.id}
            name={`domainProficiencies.d${domain.id}`}
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    {domain.name}
                  </p>
                  <p className="text-[10px] text-slate-400">{domain.weightPercentage}%</p>
                </div>
                <Select value={field.value ?? ''} onValueChange={v => field.onChange(v || undefined)}>
                  <SelectTrigger className="w-32 h-8 text-xs cursor-pointer flex-shrink-0">
                    <SelectValue placeholder="Trình độ" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFICIENCY_LEVELS.map(p => (
                      <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ── Create plan dialog (wizard) ───────────────────────────────────────────────

function CreatePlanDialog({
  open,
  onOpenChange,
  certificationId,
  domains,
  onSuccess,
  onExistingPlan,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  certificationId: number
  domains: CertificationDomainResponse[]
  onSuccess: (planId: number) => void
  onExistingPlan: () => void
}) {
  const [step, setStep] = useState(0)

  const form = useForm<CreatePlanForm>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      studyDaysPerWeek: 5,
      preferredStudyDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      experienceLevel: 'INTERMEDIATE',
      dailyStudyMinutes: 60,
    },
  })
  const { register, control, trigger, getValues, formState: { errors } } = form

  const createMutation = useMutation({
    mutationFn: (data: CreatePlanForm) => {
      const payload: StudyPlanCreateRequest = {
        certificationId,
        examDate: data.examDate,
        dailyStudyMinutes: data.dailyStudyMinutes,
        studyDaysPerWeek: data.studyDaysPerWeek,
        preferredStudyDays: (data.preferredStudyDays ?? []) as StudyDay[],
        experienceLevel: data.experienceLevel,
        domainProficiencies: data.domainProficiencies
          ? Object.fromEntries(
              Object.entries(data.domainProficiencies)
                .filter(([, v]) => !!v)
                .map(([k, v]) => [k.replace(/^d/, ''), v])
            ) as Record<string, DomainProficiency>
          : undefined,
      }
      return studyPlansApi.create(payload)
    },
    onSuccess: (plan) => {
      toast.success('Đã tạo kế hoạch học tập!')
      onOpenChange(false)
      setStep(0)
      form.reset()
      onSuccess(plan.id)
    },
    onError: (err) => {
      const status = (err as AxiosError)?.response?.status
      if (status === 409 || status === 400) {
        onOpenChange(false)
        onExistingPlan()
      } else {
        toast.error('Không thể tạo kế hoạch học tập')
      }
    },
  })

  // Validate current step fields before advancing
  const STEP_FIELDS: (keyof CreatePlanForm)[][] = [
    ['examDate', 'dailyStudyMinutes', 'studyDaysPerWeek'],
    ['experienceLevel'],
    [],
  ]

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[step] as (keyof CreatePlanForm)[])
    if (valid) setStep(s => s + 1)
  }

  const handleCreate = async () => {
    const valid = await trigger()
    if (!valid) return
    createMutation.mutate(getValues())
  }

  const handleDialogClose = (v: boolean) => {
    if (!v) { setStep(0); form.reset() }
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] lg:max-w-[calc(100vw-19rem)] lg:left-[calc(50%+8rem)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Target className="w-4 h-4 text-[#0A66C2]" />
            Tạo kế hoạch học tập
          </DialogTitle>
        </DialogHeader>

        <StepBar current={step} />

        <div>
          <div className="min-h-[220px]">
            {step === 0 && <Step1 register={register} errors={errors} control={control} />}
            {step === 1 && <Step2 control={control} errors={errors} />}
            {step === 2 && <Step3 control={control} domains={domains} />}
          </div>

          <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(s => s - 1)}
                className="flex-1 cursor-pointer"
              >
                Quay lại
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogClose(false)}
                className="flex-1 cursor-pointer"
              >
                Hủy
              </Button>
            )}

            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer"
              >
                Tiếp theo <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white cursor-pointer"
              >
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo kế hoạch'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Domain accordion ──────────────────────────────────────────────────────────

function DomainAccordion({ domain }: { domain: CertificationDomainResponse }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0A66C2]" />
          <span className="font-medium text-slate-900 dark:text-white text-sm">{domain.name}</span>
          <Badge variant="secondary" className="text-xs">{domain.weightPercentage}%</Badge>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && domain.description && (
        <div className="px-4 pb-4 pt-0 text-sm text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/20">
          {domain.description}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CertificationDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [planDialogOpen, setPlanDialogOpen] = useState(false)

  const { data: cert, isLoading } = useQuery({
    queryKey: ['certifications', slug],
    queryFn: () => certificationsApi.getBySlug(slug),
  })

  const { data: activeSessions = [] } = useQuery({
    queryKey: ['exam-sessions', 'active'],
    queryFn: () => examSessionsApi.getActive(),
    refetchOnWindowFocus: true,
  })

  const startExamMutation = useMutation({
    mutationFn: (examId: number) => examSessionsApi.startExam(examId, { mode: 'PRACTICE' }),
    onSuccess: (data) => {
      sessionStorage.setItem(EXAM_SESSION_KEY(data.id), JSON.stringify(data))
      queryClient.invalidateQueries({ queryKey: ['exam-sessions', 'active'] })
      router.push(`/exam/${data.id}`)
    },
    onError: () => toast.error('Không thể bắt đầu bài thi. Vui lòng thử lại.'),
  })

  const resumeMutation = useMutation({
    mutationFn: (sessionId: number) => examSessionsApi.resumeSession(sessionId),
    onSuccess: (data) => {
      const { session, init } = normaliseResumeSession(data)
      sessionStorage.setItem(EXAM_SESSION_KEY(session.id), JSON.stringify(session))
      sessionStorage.setItem(EXAM_INIT_KEY(session.id), JSON.stringify(init))
      router.push(`/exam/${session.id}`)
    },
    onError: () => toast.error('Không thể tiếp tục phiên thi.'),
  })

  const handleCreatePlan = () => setPlanDialogOpen(true)

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
      </div>
    )
  }

  if (!cert) return <div className="text-center py-16 text-slate-500">Không tìm thấy chứng chỉ</div>

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/certifications" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">
        <ArrowLeft className="w-4 h-4" />Danh mục chứng chỉ
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0A66C2] to-[#084E96] rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-0">{cert.level}</Badge>
              <Badge className="bg-white/20 text-white border-0">{cert.provider}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">{cert.name}</h1>
            {cert.description && <p className="text-blue-100 mt-2 text-sm line-clamp-3">{cert.description}</p>}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-blue-100">
              <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{cert.exams?.length ?? 0} đề thi</div>
              {cert.totalQuestions && <div className="flex items-center gap-1.5"><Star className="w-4 h-4" />{cert.totalQuestions} câu hỏi</div>}
              {cert.durationMinutes && <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{cert.durationMinutes} phút</div>}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={handleCreatePlan} className="bg-[#22C55E] hover:bg-[#16A34A] text-white border-0 cursor-pointer">
            <Target className="w-4 h-4 mr-2" />Tạo kế hoạch học tập
          </Button>
          {(() => {
            const active = activeSessions.find(s => s.certificationId === cert.id)
            if (active) return (
              <Button variant="outline" onClick={() => resumeMutation.mutate(active.id)} disabled={resumeMutation.isPending}
                className="text-white border-white/50 hover:bg-white/10 cursor-pointer bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                {resumeMutation.isPending ? 'Đang tải...' : 'Tiếp tục bài thi'}
              </Button>
            )
            if (cert.exams?.length > 0) return (
              <Button variant="outline" onClick={() => startExamMutation.mutate(cert.exams[0].id)} disabled={startExamMutation.isPending}
                className="text-white border-white/50 hover:bg-white/10 cursor-pointer bg-transparent">
                <Play className="w-4 h-4 mr-2" />
                {startExamMutation.isPending ? 'Đang tải...' : 'Thi thử ngay'}
              </Button>
            )
            return null
          })()}
        </div>
      </div>

      <Tabs defaultValue="domains">
        <TabsList>
          <TabsTrigger value="domains" className="cursor-pointer">Các domain ({cert.domains?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="exams" className="cursor-pointer">Đề thi ({cert.exams?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="domains" className="space-y-3 mt-4">
          {cert.domains?.length > 0
            ? cert.domains.map(d => <DomainAccordion key={d.id} domain={d} />)
            : <p className="text-sm text-slate-500 py-4 text-center">Chưa có thông tin domain</p>}
        </TabsContent>
        <TabsContent value="exams" className="space-y-3 mt-4">
          {cert.exams?.length > 0 ? cert.exams.map(exam => (
            <Card key={exam.id} className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">{exam.title}</h3>
                  <div className="flex gap-3 mt-1 text-xs text-slate-500">
                    <span>{exam.totalQuestions} câu</span>
                    <span>{exam.durationMinutes} phút</span>
                    <span>Điểm đỗ: {exam.passingScore}%</span>
                  </div>
                </div>
                <Button size="sm" onClick={() => startExamMutation.mutate(exam.id)} disabled={startExamMutation.isPending}
                  className="bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer flex-shrink-0">
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  {startExamMutation.isPending ? 'Đang tải...' : 'Bắt đầu'}
                </Button>
              </CardContent>
            </Card>
          )) : <p className="text-sm text-slate-500 py-4 text-center">Chưa có đề thi</p>}
        </TabsContent>
      </Tabs>

      <CreatePlanDialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        certificationId={cert.id}
        domains={cert.domains ?? []}
        onSuccess={(planId) => router.push(`/learn/study-plans/${planId}`)}
        onExistingPlan={async () => {
          try {
            const existing = await studyPlansApi.getActive(cert.id)
            toast.info('Bạn đã có kế hoạch học tập đang hoạt động')
            router.push(`/learn/study-plans/${existing.id}`)
          } catch {
            toast.error('Không thể tạo kế hoạch học tập')
          }
        }}
      />
    </div>
  )
}
