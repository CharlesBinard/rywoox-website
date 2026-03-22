import { motion } from 'framer-motion'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-neon-cyan to-neon-purple text-black',
  secondary: 'glass glow-border text-white',
  ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled,
  className = '',
  type = 'button',
  onClick,
}: ButtonProps) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
      disabled={disabled || isLoading}
      className={`
        rounded-xl font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {isLoading ? '...' : children}
    </motion.button>
  )
}
