import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Flat, token-driven button (personal-tracker style, ADR-0002 + ADR-0003).
// No antd, no shadows. `default` is the solid dark primary; `link` uses the accent.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ' +
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ' +
    'disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-btn)] text-[var(--color-btn-ink)] hover:opacity-90',
        outline: 'border border-line bg-surface text-ink hover:bg-surface-muted',
        secondary: 'bg-surface-muted text-ink hover:bg-surface-hover',
        ghost: 'text-ink hover:bg-surface-muted',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4',
        xs: 'h-7 px-2.5 text-xs',
        sm: 'h-8 px-3',
        lg: 'h-11 px-6',
        icon: 'h-9 w-9 p-0',
        'icon-xs': 'h-7 w-7 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-11 w-11 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)

Button.displayName = 'Button'
