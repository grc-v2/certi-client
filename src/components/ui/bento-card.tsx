import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BentoCardProps = {
  icon: LucideIcon
  title: string
  /** Optional element rendered at the far right of the fixed header. */
  action?: ReactNode
  /** Grid placement classes (col/row span) supplied by the layout. */
  className?: string
  /** When true the body scrolls instead of growing the card. */
  scrollBody?: boolean
  children: ReactNode
}

/**
 * Shared card shell (personal-tracker style, ADR-0003): flat surface, large
 * rounding, no shadow, fixed-height header (icon + title left, action right).
 */
export function BentoCard({
  icon: Icon,
  title,
  action,
  className,
  scrollBody = true,
  children,
}: BentoCardProps) {
  return (
    <section className={cn('flex min-h-0 flex-col rounded-[var(--radius-card)] bg-surface', className)}>
      <header className="flex h-16 shrink-0 items-center gap-3 px-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-inner)] bg-surface-muted text-ink">
          <Icon size={18} strokeWidth={2} />
        </span>
        <h2 className="flex-1 truncate text-[15px] font-semibold tracking-tight text-ink">{title}</h2>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </header>
      <div className={cn('min-h-0 flex-1 px-5 pb-5', scrollBody && 'overflow-y-auto')}>
        {children}
      </div>
    </section>
  )
}
