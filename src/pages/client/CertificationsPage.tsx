'use client'
import { useState } from 'react'
import { useInfiniteQuery, useQuery, useMutation } from '@tanstack/react-query'
import { Search, GraduationCap, Star, Clock, ChevronDown, Play, RotateCcw, BookOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { certificationsApi, type CertificationResponse } from '@/lib/api/certifications'
import {
  examSessionsApi, type ActiveSessionResponse,
  EXAM_SESSION_KEY, EXAM_INIT_KEY, normaliseResumeSession,
} from '@/lib/api/exam-sessions'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'
import { useLookups } from '@/hooks/use-lookups'

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  INTERMEDIATE: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  ADVANCED: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
  EXPERT: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó', VERY_HARD: 'Rất khó'
}

function CertificationCard({ cert }: { cert: CertificationResponse }) {
  return (
    <Link to={`/certifications/${cert.slug}`} className="block cursor-pointer group">
      <Card className="border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-md transition-all duration-200 h-full">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <Badge variant="secondary" className={cn('text-xs', LEVEL_COLORS[cert.level] ?? 'bg-slate-100 text-slate-600')}>
                  {cert.level}
                </Badge>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 text-sm leading-snug">
                {cert.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{cert.provider}</p>
              {cert.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{cert.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            {cert.totalQuestions && (
              <div className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                {cert.totalQuestions} câu hỏi
              </div>
            )}
            {cert.durationMinutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {cert.durationMinutes} phút
              </div>
            )}
            {cert.passingScore && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                Đỗ: {cert.passingScore}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ActiveSessionCard({ session, onResume, resuming }: {
  session: ActiveSessionResponse
  onResume: (id: number) => void
  resuming: boolean
}) {
  const progress = session.totalQuestions > 0
    ? Math.round((session.answeredCount / session.totalQuestions) * 100)
    : 0
  const remainingMins = Math.max(0, Math.round((session.durationMinutes * 60 - session.timeSpentSeconds) / 60))

  return (
    <Card className="border-primary/30 bg-primary/5 dark:bg-primary/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-xs font-medium text-[#22C55E]">Đang làm</span>
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                {session.mode === 'PRACTICE' ? 'Luyện tập' : 'Thi thật'}
              </Badge>
            </div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{session.examTitle}</p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{session.certificationName}</p>
            <div className="mt-2.5 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{session.answeredCount}/{session.totalQuestions} câu đã trả lời</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{remainingMins} phút còn lại</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onResume(session.id)}
            disabled={resuming}
            className="bg-primary hover:bg-slate-800 text-white cursor-pointer flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            {resuming ? 'Đang tải...' : 'Tiếp tục'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CertificationsPage() {
  const navigate = useNavigate()
  const { getOptions, getLabel } = useLookups()
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState<string>('')
  const [difficulty, setDifficulty] = useState<string>('')
  const debouncedSearch = useDebounce(search, 400)

  const { data: activeSessions = [] } = useQuery({
    queryKey: ['exam-sessions', 'active'],
    queryFn: () => examSessionsApi.getActive(),
    refetchOnWindowFocus: true,
  })

  const [resumingId, setResumingId] = useState<number | null>(null)
  const resumeMutation = useMutation({
    mutationFn: (id: number) => examSessionsApi.resumeSession(id),
    onMutate: (id) => setResumingId(id),
    onSuccess: (data) => {
      const { session, init } = normaliseResumeSession(data)
      sessionStorage.setItem(EXAM_SESSION_KEY(session.id), JSON.stringify(session))
      sessionStorage.setItem(EXAM_INIT_KEY(session.id), JSON.stringify(init))
      navigate(`/exam/${session.id}`)
    },
    onError: () => { toast.error('Không thể tiếp tục phiên thi'); setResumingId(null) },
  })

  const {
    data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading,
  } = useInfiniteQuery({
    queryKey: ['certifications', debouncedSearch, level, difficulty],
    queryFn: ({ pageParam = 0 }) => certificationsApi.search({
      keyword: debouncedSearch || undefined,
      level: level || undefined,
      difficultyLevel: difficulty || undefined,
      page: pageParam,
      size: 12,
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.pageNumber < lastPage.totalPages - 1 ? pages.length : undefined,
  })

  const certifications = data?.pages.flatMap(p => p.content ?? []).filter(Boolean) ?? []
  const total = data?.pages[0]?.totalElements ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Danh mục chứng chỉ</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{total} chứng chỉ có sẵn</p>
        </div>
        <Link to="/certifications/exam-history">
          <Button variant="outline" className="cursor-pointer text-primary border-primary/20 hover:bg-primary/5">
            <BookOpen className="w-4 h-4 mr-2" />
            Lịch sử thi
          </Button>
        </Link>
      </div>

      {/* Active sessions banner */}
      {activeSessions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" />
            Bài thi đang dở ({activeSessions.length})
          </p>
          {activeSessions.map(s => (
            <ActiveSessionCard
              key={s.id}
              session={s}
              onResume={(id) => resumeMutation.mutate(id)}
              resuming={resumingId === s.id && resumeMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm chứng chỉ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10 w-full bg-slate-50/50 dark:bg-slate-900/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-44">
            <Select value={level} onValueChange={(v) => setLevel(v ?? '')}>
              <SelectTrigger className="w-full h-10 cursor-pointer bg-slate-50/50 dark:bg-slate-900/50">
                <SelectValue placeholder="Cấp độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả cấp độ</SelectItem>
                {getOptions('constants.certificationLevels').map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{getLabel('constants.certificationLevels', opt.value)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-44">
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v ?? '')}>
              <SelectTrigger className="w-full h-10 cursor-pointer bg-slate-50/50 dark:bg-slate-900/50">
                <SelectValue placeholder="Độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả độ khó</SelectItem>
                {getOptions('constants.certificationDifficultyLevels').map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{getLabel('constants.certificationDifficultyLevels', opt.value)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(search || level || difficulty) && (
            <Button 
              variant="ghost" 
              onClick={() => { setSearch(''); setLevel(''); setDifficulty('') }} 
              className="h-10 px-4 cursor-pointer text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-5 space-y-3">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : certifications.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {certifications.map(cert => <CertificationCard key={cert.id} cert={cert} />)}
          </div>
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="cursor-pointer"
              >
                {isFetchingNextPage ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                    Đang tải...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ChevronDown className="w-4 h-4" />
                    Xem thêm
                  </span>
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-slate-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Không tìm thấy chứng chỉ nào</p>
          <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  )
}
