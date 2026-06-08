import { Checkbox as AntdCheckbox } from 'antd'
import React from 'react'

export function Checkbox({ checked, onCheckedChange, children, className, ...props }: any) {
  return (
    <AntdCheckbox
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={className}
      {...props}
    >
      {children}
    </AntdCheckbox>
  )
}
