import React from 'react'

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className}`} {...props} />
    </div>
  )
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`border-b border-zinc-200 dark:border-zinc-800 ${className}`} {...props} />
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`divide-y divide-zinc-200 dark:divide-zinc-800 ${className}`} {...props} />
}

export function TableFooter({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot className={`border-t bg-zinc-50/50 font-medium ${className}`} {...props} />
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`border-b border-zinc-200 dark:border-zinc-800 transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 ${className}`}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`h-10 px-4 text-left align-middle font-semibold text-zinc-500 dark:text-zinc-400 [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props} />
}

export function TableCaption({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={`mt-4 text-sm text-zinc-500 dark:text-zinc-400 ${className}`} {...props} />
}
