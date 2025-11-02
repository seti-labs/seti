"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { ConfirmationModal } from "@/components/ConfirmationModal"

interface ConfirmationState {
  isOpen: boolean
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title: string
  message: string
  action?: string
  onAction?: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

interface ConfirmationContextType {
  showConfirmation: (config: Omit<ConfirmationState, 'isOpen'>) => void
  hideConfirmation: () => void
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined)

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  })

  const showConfirmation = (config: Omit<ConfirmationState, 'isOpen'>) => {
    setConfirmation({
      isOpen: true,
      ...config,
    })
  }

  const hideConfirmation = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }))
  }

  return (
    <ConfirmationContext.Provider value={{ showConfirmation, hideConfirmation }}>
      {children}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={hideConfirmation}
        type={confirmation.type}
        title={confirmation.title}
        message={confirmation.message}
        action={confirmation.action}
        onAction={confirmation.onAction}
        autoClose={confirmation.autoClose}
        autoCloseDelay={confirmation.autoCloseDelay}
      />
    </ConfirmationContext.Provider>
  )
}

export function useConfirmation() {
  const context = useContext(ConfirmationContext)
  if (context === undefined) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider')
  }
  return context
}
