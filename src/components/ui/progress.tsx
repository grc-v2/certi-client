import { Progress as AntdProgress } from 'antd'
import React from 'react'

export interface ProgressProps {
  value?: number
  className?: string
  strokeColor?: string
  trailColor?: string
  strokeWidth?: number
}

export function Progress({ value = 0, className, strokeColor = "#0A66C2", trailColor = "rgba(0, 0, 0, 0.06)", strokeWidth = 8, ...props }: ProgressProps) {
  return (
    <div className={`w-full ${className || ''}`}>
      <AntdProgress
        percent={value}
        showInfo={false}
        strokeColor={strokeColor}
        trailColor={trailColor}
        strokeWidth={strokeWidth}
        {...props}
      />
    </div>
  )
}
