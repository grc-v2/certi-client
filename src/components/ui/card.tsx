import React from 'react'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col space-y-1.5 p-5 sm:p-6 ${className}`} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`font-semibold leading-none tracking-tight text-zinc-900 dark:text-white ${className}`} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-zinc-500 dark:text-zinc-400 m-0 ${className}`} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-5 sm:p-6 pt-0 ${className}`} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex items-center p-5 sm:p-6 pt-0 ${className}`} {...props} />
}
