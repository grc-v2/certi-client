import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

type SelectContextValue = {
  value: string
  setValue: (val: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  labels: Record<string, ReactNode>
  registerTrigger: (el: HTMLButtonElement | null) => void
  triggerEl: HTMLButtonElement | null
}

const SelectContext = createContext<SelectContextValue | null>(null)

export function Select({ defaultValue, value, onValueChange, children }: any) {
  const [selectedValue, setSelectedValue] = useState(defaultValue || '')
  const [open, setOpen] = useState(false)
  const [triggerEl, setTriggerEl] = useState<HTMLButtonElement | null>(null)
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
    <SelectContext.Provider
      value={{
        value: currentVal,
        setValue: setCurrentVal,
        open,
        setOpen,
        labels,
        registerTrigger: setTriggerEl,
        triggerEl,
      }}
    >
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className, children, ...props }: any) {
  const context = useContext(SelectContext)
  const localRef = useRef<HTMLButtonElement | null>(null)

  // Bridge the ref into context so SelectContent can position relative to it.
  const setRef = useCallback(
    (el: HTMLButtonElement | null) => {
      localRef.current = el
      context?.registerTrigger(el)
    },
    [context]
  )

  if (!context) return null
  return (
    <button
      type="button"
      ref={setRef}
      onClick={() => context.setOpen(!context.open)}
      className={`flex h-10 w-full items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
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

  const displayLabel =
    context.labels[context.value] !== undefined
      ? context.labels[context.value]
      : context.value || placeholder

  return <span>{displayLabel}</span>
}

type Rect = { top: number; left: number; width: number; height: number }

function useTriggerRect(triggerEl: HTMLButtonElement | null, open: boolean): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null)

  const measure = useCallback(() => {
    if (!triggerEl) return
    const r = triggerEl.getBoundingClientRect()
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [triggerEl])

  useLayoutEffect(() => {
    if (!open) {
      setRect(null)
      return
    }
    measure()
  }, [open, measure])

  useEffect(() => {
    if (!open) return
    const onChange = () => measure()
    window.addEventListener('scroll', onChange, true)
    window.addEventListener('resize', onChange)
    return () => {
      window.removeEventListener('scroll', onChange, true)
      window.removeEventListener('resize', onChange)
    }
  }, [open, measure])

  return rect
}

export function SelectContent({ className, children, style, ...props }: any) {
  const context = useContext(SelectContext)
  const rect = useTriggerRect(context?.triggerEl ?? null, !!context?.open)

  if (!context || !context.open || typeof document === 'undefined') return null

  // Until the trigger rect is measured, hide the menu to avoid a flicker at (0,0).
  const positionStyle: React.CSSProperties = rect
    ? {
        position: 'fixed',
        top: rect.top + rect.height + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 1000,
      }
    : { position: 'fixed', visibility: 'hidden', zIndex: 1000 }

  return createPortal(
    <>
      <div
        className="fixed inset-0"
        style={{ zIndex: 999 }}
        onClick={() => context.setOpen(false)}
      />
      <div
        className={`max-h-60 overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-md ${className ?? ''}`}
        style={{ ...positionStyle, ...style }}
        {...props}
      >
        {children}
      </div>
    </>,
    document.body
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
      className={`relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-3 pr-9 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
        isSelected
          ? 'bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-blue-400'
          : 'text-zinc-900 dark:text-zinc-200'
      }`}
      {...props}
    >
      {children}
    </div>
  )
}
