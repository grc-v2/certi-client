import { Tooltip as AntdTooltip } from 'antd'
import React from 'react'

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function Tooltip({ children, ...props }: any) {
  // Find trigger and content
  let triggerElement: React.ReactNode = null
  let contentElement: React.ReactNode = null

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const element = child as React.ReactElement<any>
      if ((element.type as any).displayName === 'TooltipTrigger' || (element.type as any).name === 'TooltipTrigger') {
        triggerElement = element.props.children
      } else if ((element.type as any).displayName === 'TooltipContent' || (element.type as any).name === 'TooltipContent') {
        contentElement = element.props.children
      }
    }
  })

  // Fallback if not used exactly with trigger/content children
  if (!triggerElement) triggerElement = children

  return (
    <AntdTooltip title={contentElement} {...props}>
      <span className="cursor-pointer">{triggerElement}</span>
    </AntdTooltip>
  )
}

export function TooltipTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
TooltipTrigger.displayName = 'TooltipTrigger'

export function TooltipContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
TooltipContent.displayName = 'TooltipContent'
