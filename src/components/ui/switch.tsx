import { Switch as AntdSwitch } from 'antd'
import React from 'react'

export function Switch({ checked, onCheckedChange, className, ...props }: any) {
  return (
    <AntdSwitch
      checked={checked}
      onChange={onCheckedChange}
      className={className}
      {...props}
    />
  )
}
