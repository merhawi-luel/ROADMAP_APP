import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold transition rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = {
    sm: 'px-3 py-1.5 text-[13px]',
    md: 'px-4 py-2 text-[13px]',
  }
  const variants = {
    primary: 'bg-[#8177f2] text-white hover:brightness-110',
    secondary: 'border border-[#252a35] bg-transparent text-[#b0b8cc] hover:border-[#8177f2] hover:text-[#eef0f5]',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
