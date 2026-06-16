import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

// Edge sheet on Radix Dialog (ADR-0002 + ADR-0003), flat + token-driven.
// Public API preserved: Sheet(open/onOpenChange), SheetTrigger, SheetContent(side),
// SheetHeader/Title/Description.

export function Sheet({ open, onOpenChange, children }: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  )
}

export function SheetTrigger({ children }: { children: React.ReactElement }) {
  return <DialogPrimitive.Trigger asChild>{children}</DialogPrimitive.Trigger>
}

type Side = 'left' | 'right' | 'top' | 'bottom'

const SIDE_CLASSES: Record<Side, string> = {
  right: 'inset-y-0 right-0 h-full w-80 max-w-[85vw]',
  left: 'inset-y-0 left-0 h-full w-80 max-w-[85vw]',
  top: 'inset-x-0 top-0 w-full',
  bottom: 'inset-x-0 bottom-0 w-full',
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: Side
}

export function SheetContent({ side = 'right', children, className, ...props }: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn('fixed z-50 overflow-y-auto bg-surface p-6 text-ink shadow-none', SIDE_CLASSES[side], className)}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function SheetHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-2 text-left', className)} {...props}>{children}</div>
}

export function SheetTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <DialogPrimitive.Title className={cn('text-lg font-bold text-ink', className)} {...props}>
      {children}
    </DialogPrimitive.Title>
  )
}

export function SheetDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <DialogPrimitive.Description className={cn('text-sm text-ink-soft', className)} {...props}>
      {children}
    </DialogPrimitive.Description>
  )
}
