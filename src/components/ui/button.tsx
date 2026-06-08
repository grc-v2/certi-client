import { Button as AntdButton } from 'antd'
import type { ButtonProps as AntdButtonProps } from 'antd'
import React from 'react'

export interface ButtonProps extends Omit<AntdButtonProps, 'type' | 'size' | 'variant'> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'
  type?: 'submit' | 'button' | 'reset' | AntdButtonProps['type']
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', className, children, ...props }, ref) => {
    let type: 'primary' | 'dashed' | 'link' | 'text' | 'default' = 'default'
    let danger = false
    let ghost = false

    if (variant === 'default') {
      type = 'primary'
    } else if (variant === 'outline') {
      type = 'default'
    } else if (variant === 'secondary') {
      type = 'default'
    } else if (variant === 'ghost') {
      type = 'text'
    } else if (variant === 'destructive') {
      type = 'primary'
      danger = true
    } else if (variant === 'link') {
      type = 'link'
    }

    let antdSize: 'small' | 'middle' | 'large' = 'middle'
    if (size === 'sm' || size === 'xs' || size === 'icon-xs' || size === 'icon-sm') {
      antdSize = 'small'
    } else if (size === 'lg' || size === 'icon-lg') {
      antdSize = 'large'
    }

    let htmlType: 'submit' | 'button' | 'reset' | undefined = undefined
    if (props.type === 'submit' || props.type === 'button' || props.type === 'reset') {
      htmlType = props.type as any
    }

    const { type: _, ...restProps } = props

    return (
      <AntdButton
        ref={ref as any}
        type={type}
        danger={danger}
        ghost={ghost}
        size={antdSize}
        htmlType={htmlType}
        className={className}
        {...restProps}
      >
        {children}
      </AntdButton>
    )
  }
)

Button.displayName = 'Button'
