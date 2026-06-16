import { cn } from '@/lib/utils'

// Flat, token-driven progress bar (ADR-0003) — a plain div track + fill, no antd.
// API preserved: value, className, strokeColor (fill), trailColor (track), strokeWidth (height).
export interface ProgressProps {
  value?: number
  className?: string
  strokeColor?: string
  trailColor?: string
  strokeWidth?: number
}

export function Progress({
  value = 0,
  className,
  strokeColor = 'var(--color-accent)',
  trailColor = 'var(--color-surface-muted)',
  strokeWidth = 8,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      className={cn('w-full overflow-hidden rounded-full', className)}
      style={{ height: strokeWidth, background: trailColor }}
    >
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: strokeColor }} />
    </div>
  )
}
