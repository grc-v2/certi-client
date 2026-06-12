import React from 'react'

/**
 * Refreshed Badge — soft "pill" style matching the new design system.
 * API is unchanged (same `variant` values) so this is a drop-in replacement
 * for src/components/ui/badge.tsx. Soft tinted background + colored text
 * instead of a solid fill reads cleaner and matches status pills app-wide.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'
}

const TONES: Record<string, { bg: string; fg: string; border?: string }> = {
    // brand green
    default:     { bg: 'rgba(21,190,105,.12)',  fg: '#0E9D55' },
    success:     { bg: 'rgba(21,190,105,.12)',  fg: '#0E9D55' },
    // neutral
    secondary:   { bg: 'rgba(100,116,139,.14)', fg: '#475569' },
    // rose
    destructive: { bg: 'rgba(242,84,107,.12)',  fg: '#E11D48' },
    // bordered
    outline:     { bg: 'transparent',           fg: '#475569', border: '1px solid var(--ch-border, #e2e8f0)' },
}

export function Badge({ className = '', children, variant = 'default', style, ...props }: BadgeProps) {
    const t = TONES[variant] ?? TONES.default
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide select-none transition-colors ${className}`}
            style={{ backgroundColor: t.bg, color: t.fg, border: t.border ?? 'none', ...style }}
            {...props}
        >
      {children}
    </span>
    )
}
