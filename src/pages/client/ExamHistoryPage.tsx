import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Trophy, Clock, Target, TrendingUp, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { resultsApi, type HistoryResultItem, type HistoryParams } from '@/lib/api/results'
import { useAuthStore } from '@/store/auth-store'
import { formatDate } from '@/lib/utils'

const PAGE_SIZE = 10

function formatSeconds(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}g ${m}ph`
  return `${m}ph`
}

const scoreColor = (s: number) =>
  s >= 72 ? 'var(--brand-deep)' : s >= 60 ? 'var(--medium)' : 'var(--hard)'

export default function ExamHistoryPage() {
  const { user } = useAuthStore()
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<'PASSED' | 'FAILED' | ''>('')
  const [q, setQ] = useState('')

  const params: HistoryParams = {
    page,
    size: PAGE_SIZE,
    sort: 'completedAt,desc',
    ...(status ? { status } : {}),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['exam-history', user?.id, params],
    queryFn: () => resultsApi.getHistory(user!.id, params),
    enabled: !!user?.id,
  })

  const stats = data?.statistics
  const results = data?.results ?? []
  const pagination = data?.pagination

  const FILTERS = [['', 'Tất cả'], ['PASSED', 'Đã đạt'], ['FAILED', 'Chưa đạt']] as const

  const filtered = q.trim()
    ? results.filter(r =>
        r.examTitle.toLowerCase().includes(q.toLowerCase()) ||
        r.certificationName.toLowerCase().includes(q.toLowerCase())
      )
    : results

  const summary = stats ? [
    { label: 'Lượt thi',   value: String(stats.totalExams),          icon: Trophy,     tone: 'brand' },
    { label: 'Tỷ lệ đạt', value: `${stats.passRate.toFixed(0)}%`,    icon: CheckCircle2, tone: 'brand' },
    { label: 'Điểm TB',   value: `${stats.averageScore.toFixed(0)}%`, icon: TrendingUp, tone: 'violet' },
    { label: 'Thời gian', value: formatSeconds(stats.totalTimeSpent), icon: Clock,      tone: 'gold'  },
  ] : []

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* Header */}
      <div>
        <span className="eyebrow">Kết quả</span>
        <h1 style={{ fontSize: 25, fontWeight: 800, color: 'var(--ink)', marginTop: 6 }}>
          Lịch sử thi &amp; luyện tập
        </h1>
      </div>

      {/* Summary stats */}
      {summary.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="stat-grid">
          {summary.map((s, i) => (
            <div key={i} className={`card enter enter-${i + 1}`} style={{ padding: '15px 17px' }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className="eyebrow">{s.label}</span>
                <s.icon size={16} style={{ color: `var(--${s.tone})` }} />
              </div>
              <span className="mono tnum" style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)' }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card enter enter-2" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div className="row" style={{ padding: '14px 16px', gap: 10, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
          {/* Search */}
          <div className="row" style={{
            alignItems: 'center', gap: 9, padding: '0 13px', height: 40,
            borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)',
            border: '1px solid var(--border)', flex: '1 1 200px',
          }}>
            <Search size={16} style={{ color: 'var(--ink-3)' }} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Tìm theo đề thi, chứng chỉ…"
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                color: 'var(--ink)', fontSize: 13.5, width: '100%',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {/* Status filter */}
          <div className="row" style={{ gap: 4, padding: 4, borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            {FILTERS.map(([k, l]) => (
              <button
                key={k}
                onClick={() => { setStatus(k as typeof status); setPage(0) }}
                style={{
                  padding: '7px 13px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, transition: 'all .12s',
                  background: status === k ? 'var(--surface)' : 'transparent',
                  color: status === k ? 'var(--ink)' : 'var(--ink-3)',
                  boxShadow: status === k ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {pagination && (
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)', marginLeft: 'auto' }}>
              {pagination.totalElements} kết quả
            </span>
          )}
        </div>

        {/* Scroll wrapper */}
        <div className="scroll-area" style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 700 }}>
            {/* Table header */}
            <div className="row" style={{
              padding: '10px 18px', gap: 12, fontSize: 11, fontWeight: 800, letterSpacing: '.07em',
              textTransform: 'uppercase', color: 'var(--ink-3)', background: 'var(--surface-2)',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ width: 90 }}>Ngày</span>
              <span style={{ flex: 1 }}>Bài thi</span>
              <span style={{ width: 78, textAlign: 'center' }}>Đúng</span>
              <span style={{ width: 84, textAlign: 'right' }}>Thời gian</span>
              <span style={{ width: 96, textAlign: 'right' }}>Điểm</span>
            </div>

            {isLoading ? (
              <div className="col" style={{ gap: 0 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ height: 62, background: i % 2 ? 'var(--surface)' : 'var(--surface-2)', borderBottom: '1px solid var(--border)' }} />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((r, i) => {
                const passed = r.status === 'PASSED'
                const score = Math.round(Number(r.percentage))
                return (
                  <Link
                    key={r.resultId}
                    to={`/certifications/results/${r.resultId}`}
                    className="row"
                    style={{
                      padding: '13px 18px', gap: 12, alignItems: 'center',
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer', transition: 'background .12s', textDecoration: 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: 90 }}>
                      <div className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>
                        {formatDate(r.completedAt)}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.examTitle}
                      </div>
                      <span className="codechip" style={{ marginTop: 3, display: 'inline-block', fontSize: 10.5 }}>
                        {r.certificationName}
                      </span>
                    </div>
                    <span className="mono tnum" style={{ width: 78, textAlign: 'center', fontSize: 13, color: 'var(--ink-2)' }}>
                      {r.correctAnswers}/{r.totalQuestions}
                    </span>
                    <span className="mono tnum" style={{ width: 84, textAlign: 'right', fontSize: 13, color: 'var(--ink-2)' }}>
                      {formatSeconds(r.timeSpent)}
                    </span>
                    <div style={{ width: 96, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <span className="mono tnum" style={{ fontSize: 15, fontWeight: 700, color: scoreColor(score) }}>
                        {score}%
                      </span>
                      {passed
                        ? <CheckCircle2 size={17} style={{ color: 'var(--brand)' }} />
                        : <XCircle size={17} style={{ color: 'var(--hard)' }} />
                      }
                    </div>
                  </Link>
                )
              })
            ) : (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)' }}>
                <Trophy size={28} style={{ marginBottom: 10 }} />
                <p style={{ fontWeight: 600, color: 'var(--ink-2)' }}>
                  {q ? 'Không có kết quả phù hợp' : 'Chưa có lịch sử thi nào'}
                </p>
                {!q && (
                  <Link to="/certifications">
                    <button className="btn3d" style={{ marginTop: 16, padding: '10px 18px', fontSize: 13 }}>
                      Bắt đầu thi thử
                    </button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="btn3d ghost sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={pagination.first}
          >
            <ChevronLeft size={16} /> Trước
          </button>
          <span className="mono" style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            Trang {pagination.pageNumber + 1} / {pagination.totalPages}
          </span>
          <button
            className="btn3d ghost sm"
            onClick={() => setPage(p => p + 1)}
            disabled={pagination.last}
          >
            Sau <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
