import { Flame, Star, Target, Clock } from 'lucide-react'

interface QuickStatsProps {
  streak?: number
  xp?: number
  accuracy?: number
  timeSpent?: string
  isLoading?: boolean
}

const STATS = (streak: number, xp: number, accuracy: number, timeSpent: string) => [
  {
    label: 'Chuỗi ngày học',
    value: streak,
    unit: 'ngày',
    icon: Flame,
    iconColor: 'var(--gold)',
    iconBg: 'var(--gold-soft)',
    valueColor: 'var(--gold-deep)',
  },
  {
    label: 'Kinh nghiệm (XP)',
    value: xp,
    unit: 'XP',
    icon: Star,
    iconColor: 'var(--brand)',
    iconBg: 'var(--brand-soft)',
    valueColor: 'var(--ink)',
  },
  {
    label: 'Độ chính xác',
    value: accuracy,
    unit: '%',
    icon: Target,
    iconColor: 'var(--brand-deep)',
    iconBg: 'var(--brand-soft)',
    valueColor: 'var(--ink)',
  },
  {
    label: 'Thời gian học',
    value: timeSpent,
    unit: '',
    icon: Clock,
    iconColor: 'var(--violet)',
    iconBg: 'var(--violet-soft)',
    valueColor: 'var(--ink)',
  },
]

export function QuickStats({
  streak = 12, xp = 2450, accuracy = 78, timeSpent = '14h 30m', isLoading = false
}: QuickStatsProps) {
  const stats = STATS(streak, xp, accuracy, timeSpent)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="stat-grid">
      {stats.map((s, i) => (
        <div key={i} className={`card enter enter-${i + 1}`} style={{ padding: '16px 17px' }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="eyebrow">{s.label}</span>
            <div className="itile" style={{ width: 34, height: 34, background: s.iconBg }}>
              <s.icon size={17} style={{ color: s.iconColor }} />
            </div>
          </div>
          {isLoading ? (
            <div style={{ height: 36, background: 'var(--surface-3)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ) : (
            <div className="row" style={{ alignItems: 'baseline', gap: 5 }}>
              <span className="mono tnum" style={{ fontSize: 30, fontWeight: 700, color: s.valueColor, lineHeight: 1 }}>
                {s.value}
              </span>
              {s.unit && (
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)' }}>{s.unit}</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
