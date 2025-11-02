"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Market } from "@/types/contract"

export interface PredictionReceipt {
  id: string
  marketId: string
  marketQuestion: string
  outcome: "YES" | "NO"
  amount: number
  price: number
  potentialPayout: number
  timestamp: Date
  status: "confirmed" | "pending" | "failed"
}

interface PredictionModalContextType {
  isOpen: boolean
  selectedMarket: Market | null
  selectedOutcome: "YES" | "NO" | null
  receipt: PredictionReceipt | null
  showReceipt: boolean
  openModal: (market: Market, outcome: "YES" | "NO") => void
  closeModal: () => void
  showPredictionReceipt: (receipt: PredictionReceipt) => void
  closeReceipt: () => void
}

const PredictionModalContext = createContext<PredictionModalContextType | undefined>(undefined)

export function PredictionModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO" | null>(null)
  const [receipt, setReceipt] = useState<PredictionReceipt | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  const openModal = (market: Market, outcome: "YES" | "NO") => {
    console.log("[v0] PredictionModalContext: Opening modal", { market: market.question, outcome })
    setSelectedMarket(market)
    setSelectedOutcome(outcome)
    setIsOpen(true)
  }

  const closeModal = () => {
    console.log("[v0] PredictionModalContext: Closing modal")
    setIsOpen(false)
    // Don't clear market/outcome immediately to allow for smooth closing animation
    setTimeout(() => {
      setSelectedMarket(null)
      setSelectedOutcome(null)
    }, 300)
  }

  const showPredictionReceipt = (newReceipt: PredictionReceipt) => {
    console.log("[v0] PredictionModalContext: Showing receipt", newReceipt)
    setReceipt(newReceipt)
    setIsOpen(false)
    setShowReceipt(true)
  }

  const closeReceipt = () => {
    console.log("[v0] PredictionModalContext: Closing receipt")
    setShowReceipt(false)
    setTimeout(() => {
      setReceipt(null)
      setSelectedMarket(null)
      setSelectedOutcome(null)
    }, 300)
  }

  return (
    <PredictionModalContext.Provider
      value={{
        isOpen,
        selectedMarket,
        selectedOutcome,
        receipt,
        showReceipt,
        openModal,
        closeModal,
        showPredictionReceipt,
        closeReceipt,
      }}
    >
      {children}
    </PredictionModalContext.Provider>
  )
}

export function usePredictionModalContext() {
  const context = useContext(PredictionModalContext)
  if (context === undefined) {
    throw new Error("usePredictionModalContext must be used within a PredictionModalProvider")
  }
  return context
}
