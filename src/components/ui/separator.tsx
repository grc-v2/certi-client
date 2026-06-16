import React from 'react'

export function Separator({ className, orientation = 'horizontal', ...props }: any) {
  return (
    <div
      className={`bg-zinc-200 dark:bg-zinc-800 shrink-0 ${
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'
      } ${className}`}
      {...props}
    />
  )
}
