import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BarChart2, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import { resultsApi } from '@/lib/api/results'
import { examSessionsApi } from '@/lib/api/exam-sessions'
import { useAuthStore } from '@/store/auth-store'

import { CertHero } from '@/components/dashboard/cert-hero'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { DomainsBreakdown } from '@/components/dashboard/domains-breakdown'
import { PracticeModes } from '@/components/dashboard/practice-modes'
import { RecommendedNext } from '@/components/dashboard/recommended-next'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['results-history', user?.id],
    queryFn: () => resultsApi.getHistory(user!.id, { size: 10 }),
    enabled: !!user?.id,
  })
  const history = historyData?.results ?? []
  const stats = historyData?.statistics

  const { data: activeSessions } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => examSessionsApi.getActive(),
    enabled: !!user?.id,
  })

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* Page header */}
      <div>
        <span className="eyebrow">Bảng điều khiển</span>
        <h1 style={{ fontSize: 25, fontWeight: 800, marginTop: 6, color: 'var(--ink)' }}>
          Chào {user?.fullName || 'bạn'} 👋
        </h1>
      </div>

      {/* Hero */}
      <CertHero
        userName={user?.fullName?.split(' ').pop() || 'bạn'}
        progress={65}
        certName="AWS Certified Solutions Architect – Associate"
        certCode="SAA-C03"
      />

      {/* Quick stats */}
      <QuickStats
        streak={12}
        xp={2450}
        accuracy={stats?.passRate ? Math.round(Number(stats.passRate) * 100) : 78}
        timeSpent="14h 30m"
        isLoading={isHistoryLoading}
      />

      {/* Main two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 18 }} className="main-grid">

        {/* Left column */}
        <div className="col" style={{ gap: 18 }}>
          <RecommendedNext />
          <PracticeModes />

          {/* Activity feed */}
          <div className="card enter enter-3" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 12px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                Hoạt động gần đây
              </h3>
              <Link
                to="/certifications/exam-history"
                className="row"
                style={{ gap: 4, fontSize: 13, color: 'var(--brand-deep)', fontWeight: 600, alignItems: 'center' }}
              >
                Xem tất cả <ChevronRight size={14} />
              </Link>
            </div>

            {isHistoryLoading ? (
              <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1, 2, 3].map(n => (
                  <div key={n} style={{ height: 56, background: 'var(--surface-2)', borderRadius: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            ) : history.length > 0 ? (
              <div>
                {history.slice(0, 5).map((result) => {
                  const isPassed = result.status === 'PASSED'
                  const date = new Date(result.completedAt).toLocaleDateString('vi-VN', {
                    month: 'short', day: 'numeric',
                  })
                  return (
                    <Link
                      key={result.resultId}
                      to={`/certifications/results/${result.resultId}`}
                      className="row"
                      style={{
                        padding: '12px 20px', gap: 12, alignItems: 'center',
                        borderTop: '1px solid var(--border)', cursor: 'pointer',
                        transition: 'background .15s', textDecoration: 'none',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="itile" style={{
                        width: 36, height: 36, flexShrink: 0,
                        background: isPassed ? 'var(--easy-soft)' : 'var(--hard-soft)',
                      }}>
                        {isPassed
                          ? <CheckCircle2 size={19} style={{ color: 'var(--easy)' }} />
                          : <XCircle size={19} style={{ color: 'var(--hard)' }} />
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {result.examTitle}
                        </div>
                        <div className="row" style={{ gap: 7, fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>
                          <span className="mono">{result.correctAnswers}/{result.totalQuestions}</span>
                          <span>·</span>
                          <span>{date}</span>
                        </div>
                      </div>
                      <div className="col" style={{ alignItems: 'flex-end' }}>
                        <span className="mono tnum" style={{ fontSize: 16, fontWeight: 700, color: isPassed ? 'var(--brand-deep)' : 'var(--hard)' }}>
                          {Math.round(Number(result.percentage))}%
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
                <BarChart2 size={32} style={{ marginBottom: 10, opacity: .4 }} />
                <p style={{ fontWeight: 600, color: 'var(--ink-2)', fontSize: 13 }}>Chưa có kết quả thi nào</p>
                <Link to="/certifications">
                  <button className="btn-3d" style={{ marginTop: 14, padding: '10px 18px', fontSize: 13 }}>
                    Luyện thi ngay
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="col" style={{ gap: 18 }}>
          <DomainsBreakdown />

          {/* Active sessions */}
          {activeSessions && activeSessions.length > 0 && (
            <div className="card enter enter-2" style={{ padding: 0, overflow: 'hidden', borderColor: 'color-mix(in srgb, var(--brand) 40%, var(--border))' }}>
              <div style={{ height: 4, background: 'var(--brand)' }} />
              <div style={{ padding: '18px 20px' }}>
                <div className="row" style={{ gap: 9, alignItems: 'center', marginBottom: 14 }}>
                  <span className="pill brand" style={{ padding: '3px 9px', fontSize: 11 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block' }} />
                    Đang làm · {activeSessions.length} phiên
                  </span>
                </div>
                {activeSessions.slice(0, 2).map(session => (
                  <div key={session.id} className="col" style={{ gap: 10, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{session.examTitle}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{session.certificationName}</div>
                    </div>
                    <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                      <div className="ch-track" style={{ flex: 1, height: 7 }}>
                        <i style={{ width: `${session.totalQuestions > 0 ? Math.round((session.answeredCount / session.totalQuestions) * 100) : 0}%` }} />
                      </div>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                        {session.answeredCount}/{session.totalQuestions}
                      </span>
                    </div>
                    <Link to={`/exam/${session.id}`}>
                      <button className="btn-3d" style={{ width: '100%', padding: '9px 14px', fontSize: 13 }}>
                        Tiếp tục
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="card enter enter-4" style={{ padding: '18px 20px' }}>
            <span className="eyebrow" style={{ marginBottom: 12, display: 'block' }}>Lối tắt nhanh</span>
            <div className="col" style={{ gap: 4 }}>
              {[
                { href: '/certifications', label: 'Tra cứu chứng chỉ' },
                { href: '/community',     label: 'Cộng đồng & Chia sẻ' },
                { href: '/profile/me',    label: 'Thiết lập mục tiêu' },
              ].map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="row"
                  style={{
                    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                    justifyContent: 'space-between', alignItems: 'center',
                    fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)',
                    background: 'var(--surface-2)', transition: 'background .15s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                >
                  {link.label}
                  <ChevronRight size={16} style={{ color: 'var(--ink-3)' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
