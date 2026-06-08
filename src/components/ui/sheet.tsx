import { Drawer } from 'antd'
import React, { createContext, useContext } from 'react'

const SheetContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

export function Sheet({ open, onOpenChange, children }: any) {
  return (
    <SheetContext.Provider value={{ open: !!open, setOpen: onOpenChange || (() => {}) }}>
      {children}
    </SheetContext.Provider>
  )
}

export function SheetTrigger({ children }: any) {
  const context = useContext(SheetContext)
  if (!context) return null
  return React.cloneElement(children, {
    onClick: (e: any) => {
      if (children.props.onClick) children.props.onClick(e)
      context.setOpen(true)
    }
  })
}

export function SheetContent({ side = 'right', children, className, ...props }: any) {
  const context = useContext(SheetContext)
  if (!context) return null

  let placement: 'left' | 'right' | 'top' | 'bottom' = 'right'
  if (side === 'left') placement = 'left'
  else if (side === 'top') placement = 'top'
  else if (side === 'bottom') placement = 'bottom'

  return (
    <Drawer
      open={context.open}
      onClose={() => context.setOpen(false)}
      placement={placement}
      width={320}
      headerStyle={{ display: 'none' }}
      bodyStyle={{ padding: '1.5rem' }}
      className={className}
      {...props}
    >
      {children}
    </Drawer>
  )
}

export function SheetHeader({ className, children, ...props }: any) {
  return <div className={`flex flex-col space-y-2 text-left ${className}`} {...props}>{children}</div>
}

export function SheetTitle({ className, children, ...props }: any) {
  return <h2 className={`text-lg font-bold text-slate-900 dark:text-white ${className}`} {...props}>{children}</h2>
}

export function SheetDescription({ className, children, ...props }: any) {
  return <p className={`text-sm text-slate-500 dark:text-slate-400 ${className}`} {...props}>{children}</p>
}
