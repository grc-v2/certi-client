'use client'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useActiveSession, useStartExam, useStartPractice } from '@/hooks/queries/exam-sessions'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  GraduationCap, Clock, BookOpen, Star,
  ChevronDown, ChevronUp, Play, Target, ArrowLeft, RotateCcw,
  Calendar, Zap, ChevronRight, CheckCircle2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
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
  examSessionsApi, EXAM_SESSION_KEY, EXAM_INIT_KEY, normaliseResumeSession,
} from '@/lib/api/exam-sessions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'



// ── Create practice dialog ───────────────────────────────────────────────

function CreatePracticeDialog({
  open,
  onOpenChange,
  certificationId,
  domains,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  certificationId: number
  domains: CertificationDomainResponse[]
}) {
  const navigate = useNavigate()
  const [questionCount, setQuestionCount] = useState<number>(20)
  const [selectedDomainIds, setSelectedDomainIds] = useState<number[]>(() => domains.map(d => d.id))
  const [difficulties, setDifficulties] = useState<string[]>(['EASY', 'MEDIUM', 'HARD'])

  const startPracticeMutation = useStartPractice({
    onSuccess: (data) => {
      sessionStorage.setItem(EXAM_SESSION_KEY(data.id), JSON.stringify(data))
      toast.success('Đã khởi tạo đề luyện tập!')
      onOpenChange(false)
      navigate(`/exam/${data.id}`)
    },
    onError: () => {
      toast.error('Không thể khởi tạo đề luyện tập. Vui lòng thử lại.')
    }
  })

  const toggleDomain = (id: number) => {
    setSelectedDomainIds(prev =>
      prev.includes(id) ? prev.filter(dId => dId !== id) : [...prev, id]
    )
  }

  const toggleDifficulty = (level: string) => {
    setDifficulties(prev =>
      prev.includes(level)
        ? (prev.length > 1 ? prev.filter(l => l !== level) : prev) // keep at least one
        : [...prev, level]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] lg:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Target className="w-5 h-5 text-primary" />
            Cấu hình luyện tập tự do
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Question count */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số lượng câu hỏi</Label>
            <div className="flex gap-2">
              {[10, 20, 30, 50].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={cn(
                    'flex-1 h-9 rounded-lg text-sm font-semibold border transition-all cursor-pointer',
                    questionCount === count
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/45'
                  )}
                >
                  {count} câu
                </button>
              ))}
            </div>
          </div>

          {/* Difficulties */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Độ khó câu hỏi</Label>
            <div className="flex gap-2">
              {[
                { value: 'EASY', label: 'Dễ' },
                { value: 'MEDIUM', label: 'Trung bình' },
                { value: 'HARD', label: 'Khó' }
              ].map((diff) => {
                const active = difficulties.includes(diff.value)
                return (
                  <button
                    key={diff.value}
                    type="button"
                    onClick={() => toggleDifficulty(diff.value)}
                    className={cn(
                      'flex-1 h-9 rounded-lg text-sm font-semibold border transition-all cursor-pointer',
                      active
                        ? 'bg-primary/10 text-primary border-primary'
                        : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary/30'
                    )}
                  >
                    {diff.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Domain Selection */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chọn Domain ôn tập ({selectedDomainIds.length}/{domains.length})</Label>
              <button
                onClick={() => setSelectedDomainIds(selectedDomainIds.length === domains.map(d => d.id).length ? [] : domains.map(d => d.id))}
                className="text-[11px] text-primary font-semibold hover:underline"
              >
                {selectedDomainIds.length === domains.length ? 'Bỏ chọn hết' : 'Chọn hết'}
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 scrollbar-hide">
              {domains.map((domain) => {
                const checked = selectedDomainIds.includes(domain.id)
                return (
                  <div
                    key={domain.id}
                    onClick={() => toggleDomain(domain.id)}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => { }} // handled by div click
                      className="rounded border-slate-300 text-primary focus:ring-primary pointer-events-none"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{domain.name}</p>
                      <p className="text-[10px] text-slate-400">Trọng số: {domain.weightPercentage}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            onClick={() => startPracticeMutation.mutate({
              certificationId,
              questionCount,
              domainIds: selectedDomainIds,
              difficulties,
            })}
            disabled={startPracticeMutation.isPending || selectedDomainIds.length === 0}
            className="flex-1 bg-primary hover:bg-slate-800 text-white font-semibold cursor-pointer shadow-md shadow-blue-500/10"
          >
            {startPracticeMutation.isPending ? 'Đang tạo đề...' : 'Bắt đầu ngay'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Domain accordion ──────────────────────────────────────────────────────────

function DomainAccordion({ domain }: { domain: CertificationDomainResponse }) {
  const [open, setOpen] = useState(false)
  // Compute nice deterministic progress for realistic feeling
  const mockProgress = ((domain.id * 23) % 45) + 40 // yields progress between 40% and 85%
  const isMastered = mockProgress >= 80
  const isIntermediate = mockProgress >= 55
  
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/40 hover:border-cta/25 transition-all shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Target className="w-4 h-4 text-cta flex-shrink-0 animate-pulse" />
          <div className="text-left min-w-0">
            <span className="font-semibold text-slate-900 dark:text-white text-sm block sm:inline pr-2">{domain.name}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Trọng số: {domain.weightPercentage}%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          {/* Progress bar */}
          <div className="flex items-center gap-2 flex-1 sm:w-32 sm:flex-none">
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isMastered ? "bg-success" : isIntermediate ? "bg-yellow-500" : "bg-danger"
                )}
                style={{ width: `${mockProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 flex-shrink-0 w-8 text-right">{mockProgress}%</span>
          </div>
          
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] font-bold px-2.5 py-0.5 rounded-full border-0 flex-shrink-0",
              isMastered 
                ? "bg-success/10 text-success" 
                : isIntermediate 
                  ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" 
                  : "bg-danger/10 text-danger"
            )}
          >
            {isMastered ? 'Xuất sắc' : isIntermediate ? 'Khá' : 'Đang học'}
          </Badge>
          
          <div className="flex-shrink-0">
            {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      </button>
      
      {open && domain.description && (
        <div className="px-4 pb-4 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/10 border-t border-slate-100 dark:border-slate-800/40">
          <p className="leading-relaxed">{domain.description}</p>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────



export default function CertificationDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [practiceDialogOpen, setPracticeDialogOpen] = useState(false)

  const { data: cert, isLoading } = useQuery({
    queryKey: ['certifications', slug],
    queryFn: () => certificationsApi.getBySlug(slug),
  })

  const { data: activeSessions = [] } = useActiveSession()

  const startExamMutation = useStartExam({
    onSuccess: (data) => {
      sessionStorage.setItem(EXAM_SESSION_KEY(data.id), JSON.stringify(data))
      navigate(`/exam/${data.id}`)
    },
    onError: () => toast.error('Không thể bắt đầu bài thi. Vui lòng thử lại.'),
  })

  const resumeMutation = useMutation({
    mutationFn: (sessionId: number) => examSessionsApi.resumeSession(sessionId),
    onSuccess: (data) => {
      const { session, init } = normaliseResumeSession(data)
      sessionStorage.setItem(EXAM_SESSION_KEY(session.id), JSON.stringify(session))
      sessionStorage.setItem(EXAM_INIT_KEY(session.id), JSON.stringify(init))
      navigate(`/exam/${session.id}`)
    },
    onError: () => toast.error('Không thể tiếp tục phiên thi.'),
  })

  const handleCreatePractice = () => setPracticeDialogOpen(true)

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
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/certifications" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">
        <ArrowLeft className="w-4 h-4" />Danh mục chứng chỉ
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-slate-100 dark:from-primary dark:via-slate-900 dark:to-slate-800 rounded-2xl p-5 sm:p-6 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-cta/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 sm:w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 sm:w-7 h-7 text-cta" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <Badge className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/20 border-0 text-[10px] px-2.5 py-0.5 rounded-full">{cert.provider}</Badge>
                <Badge className="bg-cta/20 text-green-700 dark:text-cta border-0 text-[10px] px-2.5 py-0.5 rounded-full font-bold">{cert.level}</Badge>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">{cert.name}</h1>
              {cert.description && <p className="text-slate-600 dark:text-slate-300 mt-1 text-xs line-clamp-2 max-w-2xl leading-relaxed">{cert.description}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-cta" />{cert.exams?.length ?? 0} đề thi</div>
                {cert.totalQuestions && <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400" />{cert.totalQuestions} câu hỏi</div>}
                {cert.durationMinutes && <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-400" />{cert.durationMinutes} phút</div>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 sm:justify-end flex-shrink-0">
            <Button onClick={handleCreatePractice} className="bg-cta hover:bg-success text-primary font-bold px-5 py-5 rounded-xl text-sm transition-all shadow-lg shadow-green-500/10 cursor-pointer">
              <Target className="w-4 h-4 mr-1.5" />Luyện tập tự do
            </Button>
            {(() => {
              const active = activeSessions.find(s => s.certificationId === cert.id)
              if (active) return (
                <Button variant="outline" onClick={() => resumeMutation.mutate(active.id)} disabled={resumeMutation.isPending}
                  className="text-slate-700 dark:text-white border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-white/5 cursor-pointer rounded-xl px-5 py-5 text-sm font-bold transition-all">
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  {resumeMutation.isPending ? 'Đang tải...' : 'Tiếp tục bài thi'}
                </Button>
              )
              if (cert.exams?.length > 0) return (
                <Button variant="outline" onClick={() => startExamMutation.mutate(cert.exams[0].id)} disabled={startExamMutation.isPending}
                  className="text-slate-700 dark:text-white border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-white/5 cursor-pointer rounded-xl px-5 py-5 text-sm font-bold transition-all">
                  <Play className="w-4 h-4 mr-1.5 animate-pulse" />
                  {startExamMutation.isPending ? 'Đang tải...' : 'Thi thử ngay'}
                </Button>
              )
              return null
            })()}
          </div>
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
                  className="bg-primary hover:bg-slate-800 text-white cursor-pointer flex-shrink-0">
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  {startExamMutation.isPending ? 'Đang tải...' : 'Bắt đầu'}
                </Button>
              </CardContent>
            </Card>
          )) : <p className="text-sm text-slate-500 py-4 text-center">Chưa có đề thi</p>}
        </TabsContent>
      </Tabs>

      <CreatePracticeDialog
        open={practiceDialogOpen}
        onOpenChange={setPracticeDialogOpen}
        certificationId={cert.id}
        domains={cert.domains ?? []}
      />
    </div>
  )
}
