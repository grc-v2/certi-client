import { Modal } from 'antd'
import React, { createContext, useContext } from 'react'

const DialogContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

export function Dialog({ open, onOpenChange, children }: any) {
  return (
    <DialogContext.Provider value={{ open: !!open, setOpen: onOpenChange || (() => {}) }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogTrigger({ children }: any) {
  const context = useContext(DialogContext)
  if (!context) return null
  return React.cloneElement(children, {
    onClick: (e: any) => {
      if (children.props.onClick) children.props.onClick(e)
      context.setOpen(true)
    }
  })
}

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// Sizes in px — capped at viewport-32px at render time so they stay responsive
// on small screens (no horizontal scroll, no clipped content).
const SIZE_MAP: Record<DialogSize, number> = {
  sm: 420,
  md: 560,
  lg: 720,
  xl: 880,
  '2xl': 1040,
}

interface DialogContentProps {
  children?: React.ReactNode
  className?: string
  size?: DialogSize
  width?: number | string
  closable?: boolean
  maskClosable?: boolean
  [key: string]: any
}

export function DialogContent({
  children,
  className,
  size = 'md',
  width,
  ...props
}: DialogContentProps) {
  const context = useContext(DialogContext)
  if (!context) return null

  // Resolve responsive width: prefer caller-provided `width`, otherwise the named
  // `size`. On very narrow viewports the value is clamped via CSS calc().
  const resolvedWidth = width ?? `min(${SIZE_MAP[size]}px, calc(100vw - 32px))`

  return (
    <Modal
      open={context.open}
      onCancel={() => context.setOpen(false)}
      footer={null}
      destroyOnClose
      centered
      width={resolvedWidth}
      className={className}
      styles={{
        // Comfortable padding + cap body height so long content scrolls inside
        // the modal instead of pushing the whole modal off-screen.
        body: {
          maxHeight: 'calc(100vh - 160px)',
          overflowY: 'auto',
          padding: '20px 24px 24px',
        },
      }}
      {...props}
    >
      {children}
    </Modal>
  )
}

export function DialogHeader({ className, children, ...props }: any) {
  return (
    <div
      className={`flex flex-col gap-1.5 text-left mb-4 ${className ?? ''}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function DialogTitle({ className, children, ...props }: any) {
  return (
    <h2
      className={`text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white ${className ?? ''}`}
      {...props}
    >
      {children}
    </h2>
  )
}

export function DialogDescription({ className, children, ...props }: any) {
  return (
    <p className={`text-sm text-slate-500 dark:text-slate-400 ${className ?? ''}`} {...props}>
      {children}
    </p>
  )
}

export function DialogFooter({ className, children, ...props }: any) {
  return (
    <div
      className={`mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 ${className ?? ''}`}
      {...props}
    >
      {children}
    </div>
  )
}
