import React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// Flat, token-driven checkbox on Radix (ADR-0002 + ADR-0003). API: checked + onCheckedChange.
// Renders a bare box, or a labelled row when `children` are provided.
interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'onCheckedChange' | 'children'> {
  onCheckedChange?: (checked: boolean) => void
  children?: React.ReactNode
}

export function Checkbox({ checked, onCheckedChange, children, className, ...props }: CheckboxProps) {
  const box = (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={(v) => onCheckedChange?.(v === true)}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded border border-line bg-surface',
        'data-[state=checked]:bg-accent data-[state=checked]:border-accent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (children == null) return box
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-ink">
      {box}
      {children}
    </label>
  )
}
