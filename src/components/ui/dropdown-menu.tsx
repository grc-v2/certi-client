import React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

// Flat, token-driven dropdown menu on Radix (ADR-0002 + ADR-0003), shadcn shape.

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

interface ContentProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {}

export function DropdownMenuContent({ className, sideOffset = 6, align = 'start', ...props }: ContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-50 min-w-[10rem] overflow-hidden rounded-[var(--radius-inner)] border border-line bg-surface p-1 text-ink',
          'data-[state=open]:animate-pop-in',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownMenuItem({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-[calc(var(--radius-inner)-0.35rem)] px-2.5 py-2 text-sm outline-none',
        'focus:bg-surface-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuLabel({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>) {
  return <DropdownMenuPrimitive.Label className={cn('px-2.5 py-1.5 text-sm', className)} {...props} />
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-line', className)} {...props} />
}
