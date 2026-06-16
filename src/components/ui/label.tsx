import React from 'react'

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`text-sm font-semibold leading-none text-zinc-900 dark:text-white select-none ${className}`}
      {...props}
    />
  )
}
