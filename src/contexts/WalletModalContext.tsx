import React, { createContext, useContext, useState, ReactNode } from 'react'

interface WalletModalContextType {
  isWalletModalOpen: boolean
  openWalletModal: () => void
  closeWalletModal: () => void
}

const WalletModalContext = createContext<WalletModalContextType | undefined>(undefined)

export function WalletModalProvider({ children }: { children: ReactNode }) {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  const openWalletModal = () => {
    setIsWalletModalOpen(true)
  }

  const closeWalletModal = () => {
    setIsWalletModalOpen(false)
  }

  return (
    <WalletModalContext.Provider
      value={{
        isWalletModalOpen,
        openWalletModal,
        closeWalletModal,
      }}
    >
      {children}
    </WalletModalContext.Provider>
  )
}

export function useWalletModal() {
  const context = useContext(WalletModalContext)
  if (context === undefined) {
    throw new Error('useWalletModal must be used within a WalletModalProvider')
  }
  return context
}

