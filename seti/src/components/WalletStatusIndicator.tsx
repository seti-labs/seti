"use client"

import { useWalletConnection } from '@/hooks/useWalletConnection'
import { Loader2, Wifi, WifiOff, AlertCircle } from 'lucide-react'

export function WalletStatusIndicator() {
  const { isConnected, isConnecting, isReconnecting, isStable, address } = useWalletConnection()

  if (!isConnected) return null

  return (
    <div className="flex items-center gap-2 text-xs">
      {isConnecting && (
        <div className="flex items-center gap-1 text-blue-600">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Connecting...</span>
        </div>
      )}
      
      {isReconnecting && (
        <div className="flex items-center gap-1 text-yellow-600">
          <WifiOff className="w-3 h-3" />
          <span>Reconnecting...</span>
        </div>
      )}
      
      {isStable && isConnected && (
        <div className="flex items-center gap-1 text-green-600">
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </div>
      )}
      
      {!isStable && !isConnecting && !isReconnecting && (
        <div className="flex items-center gap-1 text-orange-600">
          <AlertCircle className="w-3 h-3" />
          <span>Unstable</span>
        </div>
      )}
    </div>
  )
}
