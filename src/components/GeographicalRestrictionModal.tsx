import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Globe, Shield, X } from 'lucide-react'
import { useScrollLock } from '@/hooks/useScrollLock'

interface GeographicalRestrictionModalProps {
  isOpen: boolean
  onAccept: () => void
  onDecline: () => void
}

export function GeographicalRestrictionModal({ isOpen, onAccept, onDecline }: GeographicalRestrictionModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when modal is open
  useScrollLock(isOpen)

  // Check if user has scrolled to bottom
  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px threshold
    
    setHasScrolledToBottom(isAtBottom)
  }

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      // Reset scroll state when modal opens
      setHasScrolledToBottom(false)
      scrollContainerRef.current.addEventListener('scroll', handleScroll)
      // Check initial state
      handleScroll()
      
      return () => {
        scrollContainerRef.current?.removeEventListener('scroll', handleScroll)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAccept = () => {
    if (hasScrolledToBottom) {
      onAccept()
    }
  }

  const handleDecline = () => {
    onDecline()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <Card className="bg-background/95 backdrop-blur-md border-2 border-orange-500/20 shadow-2xl flex flex-col h-full">
          <CardHeader className="text-center pb-4 flex-shrink-0">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-500" />
              </div>
              <CardTitle className="text-xl font-bold text-orange-600">
                Geographical Restrictions
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              Please scroll to the bottom to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col overflow-hidden">
            {/* Scrollable Content */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto space-y-4 text-sm pr-2 scrollbar-hide"
              style={{ maxHeight: '60vh' }}
            >
              {/* Warning Alert */}
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    This platform is restricted in certain jurisdictions. You confirm you are not in a restricted location and comply with local laws.
                  </p>
                </div>
              </div>

              {/* Main Content - Minimized */}
              <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-1 text-sm flex items-center gap-2">
                    <Shield className="w-3 h-3 text-blue-500" />
                    Restricted: US, China, North Korea, Iran, Syria, Cuba
                  </h4>
                  <p className="text-xs">
                    By proceeding, you confirm you are not a resident or citizen of any restricted jurisdiction, 
                    are accessing from a permitted location, are of legal age, and will not circumvent restrictions.
                  </p>
                </div>

                <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                    <strong>Warning:</strong> Violations may result in account termination.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed at Bottom */}
            <div className="flex gap-3 pt-4 mt-4 border-t border-border flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleDecline}
                className="flex-1 h-11"
              >
                <X className="w-4 h-4 mr-2" />
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!hasScrolledToBottom}
                className="flex-1 h-11 bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shield className="w-4 h-4 mr-2" />
                Accept & Continue
              </Button>
            </div>

            {!hasScrolledToBottom && (
              <div className="text-xs text-muted-foreground text-center pt-2 flex-shrink-0">
                Please scroll to the bottom to enable the Accept button
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
