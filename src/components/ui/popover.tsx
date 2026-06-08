import { Popover as AntdPopover } from 'antd'
import React, { createContext, useContext, useState } from 'react'

const PopoverContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

export function Popover({ open, onOpenChange, children }: any) {
  const [localOpen, setLocalOpen] = useState(false)
  const isControlled = open !== undefined
  const currentOpen = isControlled ? open : localOpen
  const setCurrentOpen = onOpenChange || setLocalOpen

  return (
    <PopoverContext.Provider value={{ open: currentOpen, setOpen: setCurrentOpen }}>
      {children}
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({ children, asChild }: any) {
  const context = useContext(PopoverContext)
  if (!context) return null

  // Ant Design handles the trigger inside its Popover component,
  // but to preserve Shadcn's structure we just render the children
  return children
}

export function PopoverContent({ children, className, ...props }: any) {
  const context = useContext(PopoverContext)
  if (!context) return null

  return (
    <AntdPopover
      open={context.open}
      onOpenChange={context.setOpen}
      content={<div className={className}>{children}</div>}
      trigger="click"
      {...props}
    >
      {/* We need a trigger element, so we render a small transparent anchor if needed, 
          but usually the Popover wraps the PopoverTrigger. 
          To support Shadcn's nested JSX structure perfectly in AntD, we can render 
          the children directly inside a popover panel if needed. */}
      {children}
    </AntdPopover>
  )
}
