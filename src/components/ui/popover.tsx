import React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'

// Flat, token-driven popover on Radix (ADR-0002 + ADR-0003). shadcn structure:
// <Popover open onOpenChange><PopoverTrigger asChild>…</PopoverTrigger><PopoverContent>…</PopoverContent></Popover>

export const Popover = PopoverPrimitive.Root

export function PopoverTrigger({ children, asChild = true }: { children: React.ReactElement; asChild?: boolean }) {
  return <PopoverPrimitive.Trigger asChild={asChild}>{children}</PopoverPrimitive.Trigger>
}

interface PopoverContentProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {}

export function PopoverContent({ className, align = 'center', sideOffset = 6, ...props }: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 rounded-[var(--radius-inner)] border border-line bg-surface p-3 text-ink',
          'data-[state=open]:animate-pop-in',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}
