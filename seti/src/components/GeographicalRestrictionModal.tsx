import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle, Globe, Shield, X } from 'lucide-react'
import { useScrollLock } from '@/hooks/useScrollLock'

interface GeographicalRestrictionModalProps {
  isOpen: boolean
  onAccept: () => void
  onDecline: () => void
}

export function GeographicalRestrictionModal({ isOpen, onAccept, onDecline }: GeographicalRestrictionModalProps) {
  const [hasRead, setHasRead] = useState(false)
  const [hasAccepted, setHasAccepted] = useState(false)

  // Lock body scroll when modal is open
  useScrollLock(isOpen)

  if (!isOpen) return null

  const handleAccept = () => {
    if (hasRead && hasAccepted) {
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
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card className="bg-background/95 backdrop-blur-md border-2 border-orange-500/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6 text-orange-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-orange-600">
                Geographical Restrictions Notice
              </CardTitle>
            </div>
            <CardDescription className="text-base text-muted-foreground">
              Important legal information regarding your location and platform access
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Warning Alert */}
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                    Legal Compliance Notice
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    This platform is subject to geographical restrictions and local regulations. 
                    Please read the following information carefully before proceeding.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Restricted Jurisdictions
                </h4>
                <p className="text-muted-foreground">
                  This platform is not available to residents or citizens of the following jurisdictions:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>United States (including all states and territories)</li>
                  <li>China (including Hong Kong and Macau)</li>
                  <li>North Korea</li>
                  <li>Iran</li>
                  <li>Syria</li>
                  <li>Cuba</li>
                  <li>Any jurisdiction where prediction markets are prohibited</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Your Responsibility</h4>
                <p className="text-muted-foreground">
                  By using this platform, you confirm that:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>You are not a resident or citizen of any restricted jurisdiction</li>
                  <li>You are accessing this platform from a permitted location</li>
                  <li>You understand and comply with all applicable local laws</li>
                  <li>You are of legal age to participate in your jurisdiction</li>
                  <li>You will not use VPNs or other methods to circumvent restrictions</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Legal Disclaimer</h4>
                <p className="text-muted-foreground">
                  This platform is provided for informational and entertainment purposes only. 
                  We do not provide financial, legal, or investment advice. Users are solely 
                  responsible for ensuring their compliance with all applicable laws and regulations 
                  in their jurisdiction.
                </p>
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  <strong>Warning:</strong> Violation of geographical restrictions may result in 
                  immediate account termination and potential legal consequences.
                </p>
              </div>
            </div>

            {/* Agreement Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="read-terms"
                  checked={hasRead}
                  onCheckedChange={(checked) => setHasRead(checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="read-terms" className="text-sm text-foreground cursor-pointer">
                  I have read and understood the geographical restrictions and legal requirements outlined above.
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-terms"
                  checked={hasAccepted}
                  onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="accept-terms" className="text-sm text-foreground cursor-pointer">
                  I confirm that I am not a resident or citizen of any restricted jurisdiction and 
                  that I am accessing this platform from a permitted location in compliance with local laws.
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleDecline}
                className="flex-1 h-12"
              >
                <X className="w-4 h-4 mr-2" />
                Decline & Exit
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!hasRead || !hasAccepted}
                className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                Accept & Continue
              </Button>
            </div>

            {/* Footer Note */}
            <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
              By continuing, you acknowledge that you have read, understood, and agree to comply 
              with all geographical restrictions and legal requirements.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
