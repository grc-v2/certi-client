'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { certificationsApi, type CertificationResponse } from '@/lib/api/certifications'
import { EXAM_SESSION_KEY } from '@/lib/api/exam-sessions'
import { useStartPractice } from '@/hooks/queries/exam-sessions'
import { toast } from 'sonner'
import CertificationPicker from './CertificationPicker'

const DIFFICULTIES: { value: string; label: string; color: string }[] = [
  { value: 'EASY',   label: 'Dễ',         color: 'border-green-400 text-green-600 dark:text-green-400 dark:border-green-500/50' },
  { value: 'MEDIUM', label: 'Trung bình', color: 'border-yellow-400 text-yellow-600 dark:text-yellow-400 dark:border-yellow-500/50' },
  { value: 'HARD',   label: 'Khó',        color: 'border-red-400 text-red-600 dark:text-red-400 dark:border-red-500/50' },
]
const COUNT_OPTIONS = [10, 20, 30, 50]

export default function PracticeFreePage() {
  const navigate = useNavigate()
  const [cert, setCert] = useState<CertificationResponse | null>(null)
  const [questionCount, setQuestionCount] = useState(20)
  const [difficulties, setDifficulties] = useState<string[]>(['EASY', 'MEDIUM', 'HARD'])
  const [selectedDomainIds, setSelectedDomainIds] = useState<number[] | null>(null)

  const { data: detail } = useQuery({
    queryKey: ['practice', 'cert-detail', cert?.slug],
    queryFn: () => certificationsApi.getBySlug(cert!.slug),
    enabled: !!cert?.slug,
  })

  const startMutation = useStartPractice({
    onSuccess: (data) => {
      sessionStorage.setItem(EXAM_SESSION_KEY(data.id), JSON.stringify(data))
      toast.success('Đã khởi tạo phiên luyện tập!')
      navigate(`/exam/${data.id}`)
    },
    onError: () => toast.error('Không thể khởi tạo phiên luyện tập. Vui lòng thử lại.'),
  })

  const toggleDifficulty = (level: string) => {
    setDifficulties(prev =>
      prev.includes(level)
        ? (prev.length > 1 ? prev.filter(l => l !== level) : prev)
        : [...prev, level]
    )
  }

  const toggleDomain = (id: number) => {
    setSelectedDomainIds(prev => {
      const allIds = detail?.domains.map(d => d.id) ?? []
      const current = prev ?? allIds
      const next = current.includes(id) ? current.filter(d => d !== id) : [...current, id]
      return next.length === 0 ? [id] : next
    })
  }

  if (!cert) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/practice')} className="text-sm text-ink-soft hover:text-accent inline-flex items-center gap-1 mb-4 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />Quay lại
        </button>
        <CertificationPicker
          title="Luyện tập tự do"
          subtitle="Chọn một chứng chỉ để bắt đầu luyện tập theo tốc độ của bạn."
          onSelect={setCert}
        />
      </div>
    )
  }

  const activeDomainIds = selectedDomainIds ?? detail?.domains.map(d => d.id) ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <button onClick={() => setCert(null)} className="text-sm text-ink-soft hover:text-accent inline-flex items-center gap-1 cursor-pointer">
        <ArrowLeft className="w-4 h-4" />Chọn chứng chỉ khác
      </button>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-accent-soft flex items-center justify-center flex-shrink-0">
          <Target className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-ink">Luyện tập tự do</h1>
          <p className="text-sm text-ink-soft">{cert.name}</p>
        </div>
      </div>

      <Card className="border-line shadow-none rounded-[var(--radius-card)]">
        <CardContent className="p-5 space-y-5">
          {/* Question count */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Số lượng câu hỏi</Label>
            <div className="flex gap-2 flex-wrap">
              {COUNT_OPTIONS.map(count => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={cn(
                    'px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                    questionCount === count
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-accent/40',
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Độ khó</Label>
            <div className="flex gap-2 flex-wrap">
              {DIFFICULTIES.map(d => {
                const selected = difficulties.includes(d.value)
                return (
                  <button
                    key={d.value}
                    onClick={() => toggleDifficulty(d.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                      selected
                        ? d.color
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300',
                    )}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Domains */}
          {detail?.domains?.length ? (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Chủ đề ({activeDomainIds.length}/{detail.domains.length})</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {detail.domains.map(d => {
                  const selected = activeDomainIds.includes(d.id)
                  return (
                    <button
                      key={d.id}
                      onClick={() => toggleDomain(d.id)}
                      className={cn(
                        'text-left px-3 py-2 rounded-lg border text-xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                        selected
                          ? 'border-accent/40 bg-accent/5 text-zinc-900 dark:text-white'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300',
                      )}
                    >
                      <div className="font-medium line-clamp-1">{d.name}</div>
                      {d.weightPercentage > 0 && (
                        <div className="text-[10px] text-zinc-400 mt-0.5">Trọng số {d.weightPercentage}%</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Button
        onClick={() => startMutation.mutate({
          certificationId: cert!.id,
          questionCount,
          domainIds: selectedDomainIds ?? undefined,
          difficulties,
        })}
        disabled={startMutation.isPending || activeDomainIds.length === 0}
        className="w-full bg-accent hover:bg-accent/90 text-white cursor-pointer"
      >
        <Play className="w-4 h-4 mr-1.5" />
        {startMutation.isPending ? 'Đang tạo phiên...' : 'Bắt đầu luyện tập'}
      </Button>
    </div>
  )
}
