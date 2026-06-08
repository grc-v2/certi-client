import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

const SelectContext = createContext<{
  value: string
  setValue: (val: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  labels: Record<string, ReactNode>
} | null>(null)

export function Select({ defaultValue, value, onValueChange, children }: any) {
  const [selectedValue, setSelectedValue] = useState(defaultValue || '')
  const [open, setOpen] = useState(false)
  const currentVal = value !== undefined ? value : selectedValue
  const setCurrentVal = onValueChange || setSelectedValue

  // Extract labels from SelectItem children so SelectValue can display them
  const labels: Record<string, ReactNode> = {}
  function traverse(node: ReactNode) {
    React.Children.forEach(node, child => {
      if (!React.isValidElement(child)) return
      const element = child as React.ReactElement<{ value?: string; children?: ReactNode }>
      if (element.type === SelectItem && element.props.value !== undefined) {
        labels[element.props.value] = element.props.children
      } else if (element.props && element.props.children) {
        traverse(element.props.children)
      }
    })
  }
  traverse(children)

  return (
    <SelectContext.Provider value={{ value: currentVal, setValue: setCurrentVal, open, setOpen, labels }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className, children, ...props }: any) {
  const context = useContext(SelectContext)
  if (!context) return null
  return (
    <button
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={`flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export function SelectValue({ placeholder }: any) {
  const context = useContext(SelectContext)
  if (!context) return null
  
  const displayLabel = context.labels[context.value] !== undefined 
    ? context.labels[context.value] 
    : (context.value || placeholder)
    
  return <span>{displayLabel}</span>
}

export function SelectContent({ className, children, ...props }: any) {
  const context = useContext(SelectContext)
  if (!context) return null
  if (!context.open) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => context.setOpen(false)} />
      <div
        className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-md ${className}`}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

export function SelectItem({ value, children, ...props }: any) {
  const context = useContext(SelectContext)
  if (!context) return null
  const isSelected = context.value === value

  return (
    <div
      onClick={() => {
        context.setValue(value)
        context.setOpen(false)
      }}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-3 pr-9 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-800 ${
        isSelected ? 'bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-blue-400' : 'text-slate-900 dark:text-slate-200'
      }`}
      {...props}
    >
      {children}
    </div>
  )
}
