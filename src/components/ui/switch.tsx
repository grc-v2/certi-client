import React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

// Flat, token-driven switch on Radix (ADR-0002 + ADR-0003). API: checked + onCheckedChange.
interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, 'onCheckedChange'> {
  onCheckedChange?: (checked: boolean) => void
}

export function Switch({ checked, onCheckedChange, className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors',
        'data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-5 w-5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5" />
    </SwitchPrimitive.Root>
  )
}
