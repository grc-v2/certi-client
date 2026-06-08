import React from 'react'

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`text-sm font-semibold leading-none text-slate-900 dark:text-white select-none ${className}`}
      {...props}
    />
  )
}
