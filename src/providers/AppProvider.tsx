import type { ReactNode } from 'react'

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {
  // AnimatePresence removed - it can cause layout shifts on initial mount
  // and conflicts with Framer Motion's viewport detection
  return <>{children}</>
}
