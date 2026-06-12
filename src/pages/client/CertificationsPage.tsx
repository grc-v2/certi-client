import { useState } from 'react'
import { useInfiniteQuery, useQuery, useMutation } from '@tanstack/react-query'
import { Search, GraduationCap, Clock, ChevronDown, Trophy, Star, ChevronRight, RotateCcw, BookOpen } from 'lucide-react'
import { certificationsApi, type CertificationResponse } from '@/lib/api/certifications'
import {
  examSessionsApi, type ActiveSessionResponse,
  EXAM_SESSION_KEY, EXAM_INIT_KEY, normaliseResumeSession,
} from '@/lib/api/exam-sessions'
import { Link, useNavigate } from 'react-router-dom'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'
import { useLookups } from '@/hooks/use-lookups'

const LEVEL_TONE: Record<string, string> = {
  BEGINNER:     'easy',
  INTERMEDIATE: 'medium',
  ADVANCED:     'hard',
  EXPERT:       'hard',
}

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: 'Cơ bản', INTERMEDIATE: 'Trung cấp', ADVANCED: 'Nâng cao', EXPERT: 'Chuyên gia',
}

function CertCard({ cert, onStart }: { cert: CertificationResponse; onStart: () => void }) {
  const tone = LEVEL_TONE[cert.level] || 'brand'
  return (
    <div
      className="card enter"
      style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform .12s, box-shadow .12s' }}
      onClick={() => window.location.assign(`/certifications/${cert.slug}`)}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)' }}
    >
      <div style={{ padding: '18px 18px 0' }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div className="itile" style={{ width: 48, height: 48, background: `var(--${tone}-soft, var(--brand-soft))` }}>
            <Trophy size={25} style={{ color: `var(--${tone}, var(--brand))` }} />
          </div>
        </div>
        <div className="row" style={{ gap: 7, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          {cert.code && <span className="codechip">{cert.code}</span>}
          <span className={`pill ${tone}`} style={{ padding: '3px 9px' }}>
            {LEVEL_LABEL[cert.level] || cert.level}
          </span>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 6, minHeight: 42 }}>
          {cert.name}
        </h3>
        {cert.provider && (
          <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8 }}>{cert.provider}</p>
        )}
        <div className="row" style={{ gap: 13, flexWrap: 'wrap', marginBottom: 14 }}>
          {cert.totalQuestions && (
            <span className="row" style={{ gap: 5, alignItems: 'center', fontSize: 12, color: 'var(--ink-3)' }}>
              <GraduationCap size={13} />
              <span className="mono">{cert.totalQuestions}</span> câu
            </span>
          )}
          {cert.durationMinutes && (
            <span className="row" style={{ gap: 5, alignItems: 'center', fontSize: 12, color: 'var(--ink-3)' }}>
              <Clock size={13} />
              <span className="mono">{cert.durationMinutes}</span> phút
            </span>
          )}
          {cert.passingScore && (
            <span className="row" style={{ gap: 5, alignItems: 'center', fontSize: 12, color: 'var(--gold-deep)' }}>
              <Star size={13} />
              <span className="mono">{cert.passingScore}%</span>
            </span>
          )}
        </div>
      </div>

      <div className="row" style={{
        padding: '13px 18px', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, borderTop: '1px solid var(--border)', background: 'var(--surface-2)',
      }}>
        <button
          className="btn3d sm"
          style={{ flex: 1 }}
          onClick={e => { e.stopPropagation(); onStart() }}
        >
          Bắt đầu học <ChevronRight size={14} strokeWidth={2.4} />
        </button>
      </div>
    </div>
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
    <div className="card" style={{ padding: '14px 16px', borderColor: 'color-mix(in srgb, var(--brand) 40%, var(--border))' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
            <span className="pill brand" style={{ padding: '2px 8px', fontSize: 10.5 }}>
              {session.mode === 'PRACTICE' ? 'Luyện tập' : 'Thi thật'} · đang làm
            </span>
          </div>
          <p style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session.examTitle}
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{session.certificationName}</p>
          <div style={{ marginTop: 10 }}>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>
              <span className="mono">{session.answeredCount}/{session.totalQuestions} câu</span>
              <span className="mono">{remainingMins} phút còn lại</span>
            </div>
            <div className="ch-track" style={{ height: 7 }}>
              <i style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <button
          className="btn3d sm"
          onClick={() => onResume(session.id)}
          disabled={resuming}
          style={{ flexShrink: 0 }}
        >
          <RotateCcw size={14} />
          {resuming ? 'Đang tải...' : 'Tiếp tục'}
        </button>
      </div>
    </div>
  )
}

const LEVELS = [['', 'Tất cả'], ['BEGINNER', 'Cơ bản'], ['INTERMEDIATE', 'Trung cấp'], ['ADVANCED', 'Nâng cao']]

export default function CertificationsPage() {
  const navigate = useNavigate()
  const { getOptions, getLabel } = useLookups()
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['certifications', debouncedSearch, level],
    queryFn: ({ pageParam = 0 }) => certificationsApi.search({
      keyword: debouncedSearch || undefined,
      level: level || undefined,
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
    <div className="col" style={{ gap: 20 }}>
      {/* Header */}
      <div>
        <span className="eyebrow">Danh mục</span>
        <h1 style={{ fontSize: 25, fontWeight: 800, color: 'var(--ink)', marginTop: 6 }}>Khám phá chứng chỉ</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 6 }}>
          Chọn chứng chỉ bạn muốn chinh phục — luyện đề, flashcard và mô phỏng thi thật.
        </p>
      </div>

      {/* Active sessions */}
      {activeSessions.length > 0 && (
        <div className="col" style={{ gap: 10 }}>
          <span className="eyebrow">Bài thi đang dở ({activeSessions.length})</span>
          {activeSessions.map(s => (
            <ActiveSessionCard
              key={s.id}
              session={s}
              onResume={id => resumeMutation.mutate(id)}
              resuming={resumingId === s.id && resumeMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card enter" style={{ padding: '14px 16px' }}>
        <div className="row" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div className="row" style={{
            alignItems: 'center', gap: 9, padding: '0 13px', height: 42,
            borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)',
            border: '1px solid var(--border)', flex: '1 1 220px',
          }}>
            <Search size={17} style={{ color: 'var(--ink-3)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm chứng chỉ…"
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                color: 'var(--ink)', fontSize: 13.5, width: '100%',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {/* Level filter pills */}
          <div className="row" style={{ gap: 4, padding: 4, borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
            {LEVELS.map(([k, l]) => (
              <button
                key={k}
                onClick={() => setLevel(k)}
                style={{
                  padding: '7px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, transition: 'all .12s',
                  background: level === k ? 'var(--surface)' : 'transparent',
                  color: level === k ? 'var(--ink)' : 'var(--ink-3)',
                  boxShadow: level === k ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* History link */}
          <Link
            to="/certifications/exam-history"
            className="row"
            style={{ gap: 6, alignItems: 'center', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', textDecoration: 'none' }}
          >
            <BookOpen size={15} /> Lịch sử thi
          </Link>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>
          {total} chứng chỉ
          {search || level ? ` phù hợp với bộ lọc` : ' có sẵn'}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(264px, 1fr))', gap: 16 }}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="card" style={{ padding: '18px', height: 220 }}>
              <div style={{ height: 48, width: 48, borderRadius: 12, background: 'var(--surface-2)', marginBottom: 14, animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: 12, width: '60%', background: 'var(--surface-2)', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: 16, width: '80%', background: 'var(--surface-2)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
      ) : certifications.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(264px, 1fr))', gap: 16 }}>
            {certifications.map((cert, i) => (
              <CertCard
                key={cert.id}
                cert={cert}
                onStart={() => navigate(`/certifications/${cert.slug}`)}
              />
            ))}
          </div>
          {hasNextPage && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <button
                className="btn3d ghost"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <span className="row" style={{ gap: 8, alignItems: 'center' }}>
                    <span style={{ width: 16, height: 16, border: '2px solid var(--ink-3)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                    Đang tải...
                  </span>
                ) : (
                  <span className="row" style={{ gap: 8, alignItems: 'center' }}>
                    <ChevronDown size={16} /> Xem thêm
                  </span>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ padding: 56, textAlign: 'center', color: 'var(--ink-3)' }}>
          <Search size={30} style={{ marginBottom: 10 }} />
          <p style={{ fontWeight: 600, color: 'var(--ink-2)' }}>Không tìm thấy chứng chỉ phù hợp</p>
          <p style={{ fontSize: 13, marginTop: 4, color: 'var(--ink-3)' }}>Thử thay đổi bộ lọc hoặc từ khóa</p>
        </div>
      )}
    </div>
  )
}
