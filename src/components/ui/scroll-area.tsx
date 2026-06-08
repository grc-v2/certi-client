import React from 'react'

export function ScrollArea({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`overflow-auto scrollbar-hide w-full h-full ${className}`} {...props}>
      {children}
    </div>
  )
}

export function ScrollBar() {
  return null
}
