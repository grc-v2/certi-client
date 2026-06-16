import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

// Flat tooltip on Radix (ADR-0002 + ADR-0003). shadcn structure:
// <TooltipProvider><Tooltip><TooltipTrigger asChild>…</TooltipTrigger><TooltipContent>…</TooltipContent></Tooltip></TooltipProvider>

export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip = TooltipPrimitive.Root

export function TooltipTrigger({ children, asChild = true }: { children: React.ReactElement; asChild?: boolean }) {
  return <TooltipPrimitive.Trigger asChild={asChild}>{children}</TooltipPrimitive.Trigger>
}

interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {}

export function TooltipContent({ className, sideOffset = 6, ...props }: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 rounded-[var(--radius-inner)] bg-[var(--color-btn)] px-2.5 py-1.5 text-xs text-[var(--color-btn-ink)]',
          'data-[state=delayed-open]:animate-pop-in',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}
