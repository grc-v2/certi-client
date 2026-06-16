import { type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  Library, MonitorPlay, Code2, Globe, StickyNote, FileText, ArrowRight, Plus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { BentoCard } from '@/components/tracker/bento-card'
import { useResources } from '@/hooks/queries/tracker-resources'
import type { ResourceKind } from '@/lib/api/tracker'

const KIND_ICON: Record<ResourceKind, LucideIcon> = {
  YOUTUBE: MonitorPlay,
  GITHUB: Code2,
  BLOG: Globe,
  NOTE: StickyNote,
  PDF: FileText,
}

function hostOf(url?: string | null): string {
  if (!url) return ''
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

const RECENT_LIMIT = 5

interface Props {
  className?: string
  style?: CSSProperties
}

/**
 * Compact Resource Hub card for the dashboard — shows the count and the most
 * recent items, then links to the full `/resources` page. The full add / filter
 * / CRUD experience lives there, so it is not duplicated here.
 */
export function ResourceHubSummaryCard({ className, style }: Props) {
  const { data: resources = [], isLoading } = useResources()
  const recent = resources.slice(0, RECENT_LIMIT)

  return (
    <BentoCard
      icon={Library}
      title="Resource Hub"
      className={className}
      style={style}
      action={
        resources.length > 0
          ? <span className="pill brand" style={{ padding: '3px 9px' }}>{resources.length}</span>
          : undefined
      }
    >
      <div className="col scroll-area" style={{ gap: 6, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {isLoading ? (
          <div className="col" style={{ gap: 6 }}>
            {[0, 1, 2].map((n) => (
              <div key={n} style={{ height: 40, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="col" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--ink-3)', minHeight: 100, textAlign: 'center' }}>
            <Library size={24} style={{ opacity: 0.4 }} />
            <span style={{ fontSize: 12.5 }}>Chưa có tài nguyên nào.</span>
            <Link to="/resources" className="row" style={addLinkStyle}>
              <Plus size={15} /> Thêm tài nguyên
            </Link>
          </div>
        ) : (
          recent.map((r) => {
            const Icon = KIND_ICON[r.kind]
            const isNote = r.kind === 'NOTE'
            const primary = isNote ? (r.content || r.title || 'Ghi chú') : (r.title || r.url || '')
            const secondary = isNote ? null : hostOf(r.url)
            return (
              <div key={r.id} className="row" style={rowStyle}>
                <span className="itile" style={{ width: 28, height: 28, flexShrink: 0, background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
                  <Icon size={15} />
                </span>
                <div className="col" style={{ flex: 1, minWidth: 0, gap: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{primary}</span>
                  {secondary && <span style={{ fontSize: 11, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{secondary}</span>}
                </div>
              </div>
            )
          })
        )}
      </div>

      {recent.length > 0 && (
        <Link to="/resources" className="row" style={openLinkStyle}>
          Mở Resource Hub <ArrowRight size={15} />
        </Link>
      )}
    </BentoCard>
  )
}

const rowStyle: CSSProperties = {
  gap: 9, alignItems: 'center', padding: '7px 9px', borderRadius: 'var(--radius-sm)',
  background: 'var(--surface)', border: '1px solid var(--border)',
}

const openLinkStyle: CSSProperties = {
  marginTop: 10, flexShrink: 0, alignItems: 'center', justifyContent: 'center', gap: 6,
  height: 38, borderRadius: 'var(--radius-sm)', textDecoration: 'none',
  fontSize: 13, fontWeight: 600, color: 'var(--brand-deep)', background: 'var(--brand-soft)',
}

const addLinkStyle: CSSProperties = {
  alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '8px 14px', borderRadius: 'var(--radius-sm)', textDecoration: 'none',
  fontSize: 13, fontWeight: 600, color: 'var(--brand-deep)', background: 'var(--brand-soft)',
}

export default ResourceHubSummaryCard
