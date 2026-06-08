import React, { createContext, useContext, useState } from 'react'

const TabsContext = createContext<{
  value: string
  setValue: (val: string) => void
} | null>(null)

export function Tabs({ defaultValue, value, onValueChange, className, children, ...props }: any) {
  const [activeTab, setActiveTab] = useState(defaultValue || '')
  const currentTab = value !== undefined ? value : activeTab
  const setCurrentTab = onValueChange || setActiveTab

  return (
    <TabsContext.Provider value={{ value: currentTab, setValue: setCurrentTab }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }: any) {
  return (
    <div
      className={`inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-slate-500 dark:text-slate-400 ${className}`}
      {...props}
    />
  )
}

export function TabsTrigger({ value, className, children, ...props }: any) {
  const context = useContext(TabsContext)
  if (!context) return null
  const isActive = context.value === value

  return (
    <button
      onClick={() => context.setValue(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${
        isActive
          ? 'bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 shadow-sm font-semibold'
          : 'hover:text-slate-900 dark:hover:text-slate-200'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children, ...props }: any) {
  const context = useContext(TabsContext)
  if (!context) return null
  if (context.value !== value) return null

  return (
    <div className={`mt-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${className}`} {...props}>
      {children}
    </div>
  )
}
