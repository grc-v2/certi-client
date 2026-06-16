'use client'
import { useMemo } from 'react'
import { useQuery, useQueryClient, useIsFetching } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Users, FileText, GraduationCap, Sparkles,
  RefreshCw, UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { adminApi, type UserSummaryResponse } from '@/lib/api/admin'
import { postsApi, type PostResponse } from '@/lib/api/posts'
import { certificationsApi } from '@/lib/api/certifications'
import { adminQuestionsApi } from '@/lib/api/questions-admin'
import { formatRelativeTime } from '@/lib/utils'
import { StatusPill, RolePill } from '@/layouts/AdminLayout'

const DASHBOARD_QUERY_KEYS = [
  ['admin-users-summary'],
  ['admin-posts-summary'],
  ['certifications-summary'],
  ['admin-questions-summary'],
  ['admin-users-trend'],
] as const

export default function AdminDashboardPage() {
  const queryClient = useQueryClient()
  const isFetching = useIsFetching({ predicate: q =>
    DASHBOARD_QUERY_KEYS.some(k => q.queryKey[0] === k[0])
  })

  const { data: users } = useQuery({
    queryKey: ['admin-users-summary'],
    queryFn: () => adminApi.listUsers({ size: 5 }),
  })
  const { data: posts } = useQuery({
    queryKey: ['admin-posts-summary'],
    queryFn: () => postsApi.adminGetAll({ size: 5 }),
  })
  const { data: certifications } = useQuery({
    queryKey: ['certifications-summary'],
    queryFn: () => certificationsApi.search({ size: 1 }),
  })
  const { data: questions } = useQuery({
    queryKey: ['admin-questions-summary'],
    queryFn: () => adminQuestionsApi.search({ size: 1 }),
  })
  const { data: trendUsers } = useQuery({
    queryKey: ['admin-users-trend'],
    queryFn: () => adminApi.listUsers({ size: 200, sort: 'registrationDate,desc' }),
  })

  const recentUsers = users?.content ?? []
  const recentPosts = posts?.content ?? []

  function refreshAll() {
    DASHBOARD_QUERY_KEYS.forEach(k =>
      queryClient.invalidateQueries({ queryKey: k as unknown as string[] })
    )
  }

  const statsData = [
    {
      label: 'Người dùng',
      value: users?.totalElements ?? 0,
      icon: Users,
      iconBg: 'var(--color-accent-soft)',
      iconColor: 'var(--color-accent)',
      href: '/admin/users',
      enterClass: 'enter enter-1',
    },
    {
      label: 'Bài viết',
      value: posts?.totalElements ?? 0,
      icon: FileText,
      iconBg: 'var(--color-surface-muted)',
      iconColor: 'var(--color-ink-soft)',
      href: '/admin/posts',
      enterClass: 'enter enter-2',
    },
    {
      label: 'Chứng chỉ',
      value: certifications?.totalElements ?? 0,
      icon: GraduationCap,
      iconBg: 'var(--color-accent-soft)',
      iconColor: 'var(--color-accent)',
      href: '/admin/certifications',
      enterClass: 'enter enter-3',
    },
    {
      label: 'Câu hỏi',
      value: questions?.totalElements ?? 0,
      icon: Sparkles,
      iconBg: 'var(--color-surface-muted)',
      iconColor: 'var(--color-ink-soft)',
      href: '/admin/questions',
      enterClass: 'enter enter-4',
    },
  ]

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* Header */}
      <div className="row enter" style={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="eyebrow">Hệ thống</span>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-ink)', marginTop: 6 }}>Tổng quan quản trị</h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={isFetching > 0}
            title="Làm mới các số liệu trên trang"
          >
            <RefreshCw size={14} style={isFetching > 0 ? { animation: 'spin 1s linear infinite' } : undefined} />
            {isFetching > 0 ? 'Đang tải...' : 'Làm mới'}
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="stat-grid">
        {statsData.map((s, i) => (
          <Link key={i} to={s.href} style={{ textDecoration: 'none' }}>
            <div className={`bg-surface rounded-[var(--radius-card)] border border-line ${s.enterClass}`} style={{ padding: 18, cursor: 'pointer' }}>
              <div className="row" style={{ alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div
                  className="itile"
                  style={{ width: 40, height: 40, background: s.iconBg, color: s.iconColor }}
                >
                  <s.icon size={20} />
                </div>
              </div>
              <div className="mono tnum" style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-ink)', lineHeight: 1 }}>
                {typeof s.value === 'number' ? s.value.toLocaleString('vi-VN') : s.value}
              </div>
              <span className="eyebrow" style={{ marginTop: 6, display: 'block' }}>{s.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, alignItems: 'start' }} className="main-grid">
        {/* Left col */}
        <div className="col" style={{ gap: 16 }}>
          {/* Real registration trend (last 12 months) */}
          <div className="bg-surface rounded-[var(--radius-card)] border border-line enter enter-3" style={{ padding: 20 }}>
            <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <span className="eyebrow">Tăng trưởng</span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', marginTop: 2 }}>Người dùng mới — 12 tháng gần nhất</h3>
              </div>
            </div>
            <RegistrationTrendChart users={trendUsers?.content ?? []} />
          </div>

          {/* Recent users */}
          <div className="bg-surface rounded-[var(--radius-card)] border border-line enter enter-4" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--color-line)' }}>
              <div className="row" style={{ alignItems: 'center', gap: 8 }}>
                <UserCheck size={16} style={{ color: 'var(--color-accent)' }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-ink)' }}>Người dùng mới</span>
              </div>
              <Link to="/admin/users">
                <Button variant="outline" size="sm" style={{ fontSize: 12 }}>Xem tất cả</Button>
              </Link>
            </div>
            <div>
              {recentUsers.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-ink-faint)', fontSize: 13 }}>Chưa có dữ liệu</p>
              ) : recentUsers.map((u: UserSummaryResponse) => (
                <div
                  key={u.id}
                  className="row"
                  style={{ alignItems: 'center', padding: '10px 18px', borderBottom: '1px solid var(--color-line)', gap: 12 }}
                >
                  <div
                    className="itile"
                    style={{ width: 34, height: 34, background: 'var(--color-accent-soft)', color: 'var(--color-accent)', fontWeight: 700, fontSize: 12, flexShrink: 0, fontFamily: 'var(--font-mono)' }}
                  >
                    {u.fullName?.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--color-ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.fullName}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--color-ink-faint)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                  </div>
                  <StatusPill status={u.status} />
                  <RolePill role={u.roleCode} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="col" style={{ gap: 16 }}>
          {/* Moderation queue */}
          <div className="bg-surface rounded-[var(--radius-card)] border border-line enter enter-3" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--color-line)' }}>
              <div className="row" style={{ alignItems: 'center', gap: 8 }}>
                <FileText size={15} style={{ color: 'var(--color-accent)' }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-ink)' }}>Bài viết chờ duyệt</span>
              </div>
              <Link to="/admin/posts">
                <Button variant="outline" size="sm" style={{ fontSize: 12 }}>Xem tất cả</Button>
              </Link>
            </div>
            <div>
              {recentPosts.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-ink-faint)', fontSize: 13 }}>Chưa có dữ liệu</p>
              ) : recentPosts.map((p: PostResponse) => (
                <div
                  key={p.id}
                  className="row"
                  style={{ alignItems: 'center', padding: '10px 18px', borderBottom: '1px solid var(--color-line)', gap: 12 }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--color-ink-faint)', margin: 0 }}>{formatRelativeTime(p.publishedAt)}</p>
                  </div>
                  <StatusPill status={p.status} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function RegistrationTrendChart({ users }: { users: UserSummaryResponse[] }) {
  const data = useMemo(() => {
    const now = new Date()
    const buckets: { label: string; ym: string; count: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      buckets.push({ label: `T${d.getMonth() + 1}`, ym, count: 0 })
    }
    const idx = new Map(buckets.map((b, i) => [b.ym, i]))
    for (const u of users) {
      if (!u.registrationDate) continue
      const d = new Date(u.registrationDate)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const i = idx.get(ym)
      if (i != null) buckets[i].count += 1
    }
    return buckets
  }, [users])

  const max = Math.max(1, ...data.map(b => b.count))

  return (
    <div className="row" style={{ alignItems: 'flex-end', gap: 6, height: 100 }}>
      {data.map((b, i) => (
        <div key={i} className="col" style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <div
            title={`${b.count} người dùng mới`}
            style={{
              width: '100%',
              height: `${(b.count / max) * 80}px`,
              minHeight: b.count > 0 ? 4 : 1,
              background: b.count > 0 ? 'var(--color-accent-soft)' : 'var(--color-surface-hover)',
              borderRadius: 6,
              border: b.count > 0 ? '1.5px solid var(--color-accent)' : '1px solid var(--color-line)',
              transition: 'height .5s ease',
            }}
          />
          <span style={{ fontSize: 9, color: 'var(--color-ink-faint)', fontFamily: 'var(--font-mono)' }}>{b.label}</span>
        </div>
      ))}
    </div>
  )
}
