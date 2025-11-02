import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { PredictionModalProvider } from "@/contexts/PredictionModalContext"
import { MarketSidebarProvider } from "@/contexts/MarketSidebarContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { ConfirmationProvider } from "@/contexts/ConfirmationContext"
import { GeographicalRestrictionProvider, useGeographicalRestriction } from "@/contexts/GeographicalRestrictionContext"
import { GeographicalRestrictionModal } from "@/components/GeographicalRestrictionModal"
import Index from "./pages/Index"
import NotFound from "./pages/NotFound"
import Dashboard from "./pages/Dashboard"
import Activity from "./pages/Activity"
import Profile from "./pages/Profile"
import Notifications from "./pages/Notifications"
import PredictionDetails from "./pages/PredictionDetails"
import Drafts from "./pages/Drafts"
import FailedPredictions from "./pages/FailedPredictions"
import { SimpleChainlinkApp } from "./components/SimpleChainlinkApp"

// Component that handles geographical restrictions
const AppWithGeoRestrictions = () => {
  const { showGeoRestrictionModal, setShowGeoRestrictionModal, setHasAcceptedGeoRestrictions } = useGeographicalRestriction()

  const handleAcceptGeoRestrictions = () => {
    setHasAcceptedGeoRestrictions(true)
  }

  const handleDeclineGeoRestrictions = () => {
    // Redirect to a page explaining why they can't use the platform
    window.location.href = 'https://example.com/geo-restricted'
  }

  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/drafts" element={<Drafts />} />
          <Route path="/failed-predictions" element={<FailedPredictions />} />
          <Route path="/prediction/:id" element={<PredictionDetails />} />
          <Route path="/chainlink" element={<SimpleChainlinkApp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      
      <GeographicalRestrictionModal
        isOpen={showGeoRestrictionModal}
        onAccept={handleAcceptGeoRestrictions}
        onDecline={handleDeclineGeoRestrictions}
      />
    </>
  )
}

const App = () => {
  return (
    <TooltipProvider>
      <GeographicalRestrictionProvider>
        <PredictionModalProvider>
          <MarketSidebarProvider>
            <NotificationProvider>
              <ConfirmationProvider>
                <AppWithGeoRestrictions />
              </ConfirmationProvider>
            </NotificationProvider>
          </MarketSidebarProvider>
        </PredictionModalProvider>
      </GeographicalRestrictionProvider>
    </TooltipProvider>
  )
}

export default App