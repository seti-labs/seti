"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title: string
  message: string
  action?: string
  onAction?: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export function ConfirmationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  action,
  onAction,
  autoClose = false,
  autoCloseDelay = 3000
}: ConfirmationModalProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case 'error':
        return <XCircle className="w-8 h-8 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-8 h-8 text-yellow-500" />
      case 'info':
        return <Info className="w-8 h-8 text-blue-500" />
      case 'loading':
        return <Loader2 className="w-8 h-8 text-primary animate-spin" />
      default:
        return <Info className="w-8 h-8 text-blue-500" />
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white'
      case 'error':
        return 'bg-red-500 hover:bg-red-600 text-white'
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white'
      case 'info':
        return 'bg-blue-500 hover:bg-blue-600 text-white'
      case 'loading':
        return 'bg-primary hover:bg-primary/90 text-white'
      default:
        return 'bg-primary hover:bg-primary/90 text-white'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-background rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Icon and Title */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-muted-foreground leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          {type === 'loading' ? (
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6"
            >
              Cancel
            </Button>
          ) : (
            <>
              <Button
                onClick={onClose}
                variant="outline"
                className="px-6"
              >
                Close
              </Button>
              {action && onAction && (
                <Button
                  onClick={onAction}
                  className={`px-6 ${getButtonColor()}`}
                >
                  {action}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
