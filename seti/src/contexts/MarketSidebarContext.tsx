"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { type Market } from '@/types/contract'

interface MarketSidebarContextType {
  isOpen: boolean
  selectedMarket: Market | null
  openSidebar: (market: Market) => void
  closeSidebar: () => void
}

const MarketSidebarContext = createContext<MarketSidebarContextType | undefined>(undefined)

export function MarketSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)

  const openSidebar = (market: Market) => {
    console.log("[MarketSidebar] Opening sidebar for market:", market.question)
    setSelectedMarket(market)
    setIsOpen(true)
  }

  const closeSidebar = () => {
    console.log("[MarketSidebar] Closing sidebar")
    setIsOpen(false)
    // Don't clear market immediately to allow for smooth closing animation
    setTimeout(() => {
      setSelectedMarket(null)
    }, 300)
  }

  return (
    <MarketSidebarContext.Provider
      value={{
        isOpen,
        selectedMarket,
        openSidebar,
        closeSidebar,
      }}
    >
      {children}
    </MarketSidebarContext.Provider>
  )
}

export function useMarketSidebar() {
  const context = useContext(MarketSidebarContext)
  if (context === undefined) {
    throw new Error("useMarketSidebar must be used within a MarketSidebarProvider")
  }
  return context
}
