import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  children: ReactNode
}

const variantModifiers: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'btn--primary',
  secondary: 'btn--secondary',
  danger: 'btn--danger',
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`btn ${variantModifiers[variant]}${className ? ` ${className}` : ''}`}
    >
      {children}
    </button>
  )
}
