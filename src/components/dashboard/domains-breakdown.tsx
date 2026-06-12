import { Grid, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Domain {
  id: string
  name: string
  code?: string
  mastery: number
  solved?: number
  total?: number
  trend?: number
  diff?: 'easy' | 'medium' | 'hard'
}

const PLACEHOLDER_DOMAINS: Domain[] = [
  { id: '1', name: 'Cloud Concepts',           code: 'D1', mastery: 85, solved: 42, total: 50, trend: 5,  diff: 'easy'   },
  { id: '2', name: 'Security & Compliance',    code: 'D2', mastery: 60, solved: 30, total: 50, trend: -2, diff: 'medium' },
  { id: '3', name: 'Technology',               code: 'D3', mastery: 45, solved: 22, total: 50, trend: 3,  diff: 'hard'   },
  { id: '4', name: 'Billing & Pricing',        code: 'D4', mastery: 90, solved: 45, total: 50, trend: 8,  diff: 'easy'   },
]

const DIFF_LABEL: Record<string, string> = { easy: 'Dễ', medium: 'TB', hard: 'Khó' }

export function DomainsBreakdown({ domains = PLACEHOLDER_DOMAINS }: { domains?: Domain[] }) {
  return (
    <div className="card enter enter-3" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px 14px' }}>
        <div className="row" style={{ gap: 9, alignItems: 'center' }}>
          <Grid size={18} style={{ color: 'var(--ink-2)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Độ thành thạo theo chủ đề</h3>
        </div>
        <span className="codechip">{domains.length} domains</span>
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }}>
        {/* Header row */}
        <div className="row" style={{
          padding: '9px 22px', gap: 14, fontSize: 11, fontWeight: 800,
          letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)',
          background: 'var(--surface-2)',
        }}>
          <span style={{ width: 34 }}>#</span>
          <span style={{ flex: 1 }}>Chủ đề</span>
          <span style={{ width: 62, textAlign: 'center' }}>Độ khó</span>
          <span style={{ width: 150 }}>Thành thạo</span>
        </div>

        {domains.map((d, i) => (
          <div
            key={d.id}
            className="row domain-item"
            style={{
              padding: '14px 22px', gap: 14, alignItems: 'center',
              borderTop: i ? '1px solid var(--border)' : 'none',
              cursor: 'pointer', transition: 'background .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span className="codechip" style={{ width: 34, textAlign: 'center', padding: '3px 0' }}>
              {d.code || `D${i + 1}`}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {d.name}
              </div>
              {(d.solved !== undefined && d.total !== undefined) && (
                <div className="row" style={{ gap: 8, marginTop: 3, fontSize: 11.5, color: 'var(--ink-3)' }}>
                  <span className="mono">{d.solved}/{d.total} câu</span>
                  {d.trend !== undefined && (
                    <span className="row" style={{
                      alignItems: 'center', gap: 2,
                      color: d.trend >= 0 ? 'var(--brand-deep)' : 'var(--hard)',
                    }}>
                      <TrendingUp size={12} strokeWidth={2.2} style={{ transform: d.trend < 0 ? 'scaleY(-1)' : 'none' }} />
                      {d.trend >= 0 ? '+' : ''}{d.trend}%
                    </span>
                  )}
                </div>
              )}
            </div>

            {d.diff && (
              <span style={{ width: 62, textAlign: 'center' }}>
                <span className={`pill ${d.diff}`} style={{ padding: '3px 9px' }}>
                  {DIFF_LABEL[d.diff]}
                </span>
              </span>
            )}

            <div className="row" style={{ gap: 9, alignItems: 'center', width: 150 }}>
              <div className="ch-track" style={{ flex: 1 }}>
                <i style={{
                  width: `${d.mastery}%`,
                  background: d.mastery >= 72 ? 'var(--brand)' : d.mastery >= 55 ? 'var(--medium)' : 'var(--hard)',
                }} />
              </div>
              <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', width: 34, textAlign: 'right' }}>
                {d.mastery}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
