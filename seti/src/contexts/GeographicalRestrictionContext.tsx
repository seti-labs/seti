import React, { createContext, useContext, useState, useEffect } from 'react'

interface GeographicalRestrictionContextType {
  hasAcceptedGeoRestrictions: boolean
  setHasAcceptedGeoRestrictions: (accepted: boolean) => void
  showGeoRestrictionModal: boolean
  setShowGeoRestrictionModal: (show: boolean) => void
}

const GeographicalRestrictionContext = createContext<GeographicalRestrictionContextType | undefined>(undefined)

const GEO_RESTRICTION_KEY = 'seti_geo_restrictions_accepted'

export function GeographicalRestrictionProvider({ children }: { children: React.ReactNode }) {
  const [hasAcceptedGeoRestrictions, setHasAcceptedGeoRestrictions] = useState(false)
  const [showGeoRestrictionModal, setShowGeoRestrictionModal] = useState(false)

  // Load acceptance status from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(GEO_RESTRICTION_KEY)
    if (saved === 'true') {
      setHasAcceptedGeoRestrictions(true)
    } else {
      // Show modal if user hasn't accepted yet
      setShowGeoRestrictionModal(true)
    }
  }, [])

  // Save acceptance status to localStorage when it changes
  const handleSetAccepted = (accepted: boolean) => {
    setHasAcceptedGeoRestrictions(accepted)
    if (accepted) {
      localStorage.setItem(GEO_RESTRICTION_KEY, 'true')
      setShowGeoRestrictionModal(false)
    } else {
      localStorage.removeItem(GEO_RESTRICTION_KEY)
    }
  }

  const value = {
    hasAcceptedGeoRestrictions,
    setHasAcceptedGeoRestrictions: handleSetAccepted,
    showGeoRestrictionModal,
    setShowGeoRestrictionModal,
  }

  return (
    <GeographicalRestrictionContext.Provider value={value}>
      {children}
    </GeographicalRestrictionContext.Provider>
  )
}

export function useGeographicalRestriction() {
  const context = useContext(GeographicalRestrictionContext)
  if (context === undefined) {
    throw new Error('useGeographicalRestriction must be used within a GeographicalRestrictionProvider')
  }
  return context
}
