import type { CSSProperties, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface BentoCardProps {
  icon: LucideIcon
  title: string
  /** Optional right-aligned action area in the header (buttons, toggles…) */
  action?: ReactNode
  children?: ReactNode
  /** Extra classes merged onto the card root (e.g. `enter enter-2`) */
  className?: string
  /** Inline overrides, mainly for grid placement from the dashboard shell */
  style?: CSSProperties
  /** When true, body renders a centered "coming soon" placeholder */
  comingSoon?: boolean
}

/**
 * Shared card frame for the Personal Tracker bento grid.
 *
 * Built on the Certi `.card` token surface but flattened (no shadow) to match the
 * tracker's minimalist language. Header has a fixed layout — icon tile + title on
 * the left, optional action on the right — so every card lines up consistently.
 */
export function BentoCard({
  icon: Icon,
  title,
  action,
  children,
  className = '',
  style,
  comingSoon = false,
}: BentoCardProps) {
  return (
    <section
      className={`card col ${className}`}
      style={{
        boxShadow: 'none',
        borderRadius: 'var(--radius-xl)',
        padding: 0,
        minWidth: 0,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Header — fixed height, icon + title left, action right */}
      <header
        className="row"
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '16px 18px',
          minHeight: 60,
          flexShrink: 0,
        }}
      >
        <div className="row" style={{ alignItems: 'center', gap: 11, minWidth: 0 }}>
          <span
            className="itile"
            style={{ width: 34, height: 34, background: 'var(--brand-soft)', color: 'var(--brand-deep)', flexShrink: 0 }}
          >
            <Icon size={18} />
          </span>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--ink)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </h2>
        </div>
        {action && <div className="row" style={{ alignItems: 'center', gap: 8, flexShrink: 0 }}>{action}</div>}
      </header>

      {/* Body */}
      <div className="col" style={{ flex: 1, minHeight: 0, padding: '0 18px 18px' }}>
        {comingSoon ? <ComingSoon /> : children}
      </div>
    </section>
  )
}

function ComingSoon() {
  return (
    <div
      className="col"
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        minHeight: 120,
        border: '1px dashed var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--ink-3)',
      }}
    >
      <span className="eyebrow">Sắp ra mắt</span>
      <span style={{ fontSize: 12.5 }}>Tính năng đang được phát triển</span>
    </div>
  )
}

export default BentoCard
