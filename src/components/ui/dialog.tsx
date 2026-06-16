import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Flat, token-driven dialog on Radix (ADR-0002 + ADR-0003). Public API preserved:
// Dialog(open/onOpenChange), DialogTrigger, DialogContent(size/width/closable/maskClosable),
// DialogHeader/Title/Description/Footer.

export function Dialog({ open, onOpenChange, children }: {
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

export function DialogTrigger({ children }: { children: React.ReactElement }) {
  return <DialogPrimitive.Trigger asChild>{children}</DialogPrimitive.Trigger>
}

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const SIZE_MAP: Record<DialogSize, number> = { sm: 420, md: 560, lg: 720, xl: 880, '2xl': 1040 }

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: DialogSize
  width?: number | string
  /** When false, hides the close button and disables ESC-to-close. */
  closable?: boolean
  /** When false, clicking the overlay does not close the dialog. */
  maskClosable?: boolean
}

export function DialogContent({
  children,
  className,
  size = 'md',
  width,
  closable = true,
  maskClosable = true,
  ...props
}: DialogContentProps) {
  // `size` sets the default width; a `max-w-*` className still caps it (max-width
  // overrides the inline width), preserving the prior antd behaviour.
  const resolvedWidth = typeof width === 'number'
    ? `${width}px`
    : width ?? `min(${SIZE_MAP[size]}px, calc(100vw - 32px))`

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-pop-in" />
      <DialogPrimitive.Content
        onEscapeKeyDown={(e) => { if (!closable) e.preventDefault() }}
        onPointerDownOutside={(e) => { if (!maskClosable) e.preventDefault() }}
        onInteractOutside={(e) => { if (!maskClosable) e.preventDefault() }}
        style={{ width: resolvedWidth }}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'max-h-[calc(100vh-160px)] overflow-y-auto rounded-[var(--radius-card)] bg-surface p-6 text-ink',
          'data-[state=open]:animate-pop-in',
          className,
        )}
        {...props}
      >
        {children}
        {closable && (
          <DialogPrimitive.Close
            aria-label="Đóng"
            className="absolute right-4 top-4 rounded-md text-ink-faint hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-1.5 text-left mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function DialogTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <DialogPrimitive.Title className={cn('text-xl font-bold leading-tight tracking-tight text-ink', className)} {...props}>
      {children}
    </DialogPrimitive.Title>
  )
}

export function DialogDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <DialogPrimitive.Description className={cn('text-sm text-ink-soft', className)} {...props}>
      {children}
    </DialogPrimitive.Description>
  )
}

export function DialogFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3', className)} {...props}>
      {children}
    </div>
  )
}
