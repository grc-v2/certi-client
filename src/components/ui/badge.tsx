import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'
}

export function Badge({ className, children, variant = 'default', ...props }: BadgeProps) {
  let color = '#0A66C2' // primary
  let border = 'none'
  let textColor = 'white'

  if (variant === 'secondary') {
    color = '#475569' // slate-600
  } else if (variant === 'destructive') {
    color = '#EF4444' // red-500
  } else if (variant === 'success') {
    color = '#22C55E' // green-500
  } else if (variant === 'outline') {
    color = 'transparent'
    border = '1px solid #e2e8f0'
    textColor = '#475569'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold select-none transition-colors ${className}`}
      style={{
        backgroundColor: color,
        color: textColor,
        border: border,
        borderColor: variant === 'outline' ? undefined : 'transparent',
      }}
      {...props}
    >
      {children}
    </span>
  )
}
