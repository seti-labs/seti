import { useEffect } from 'react'
import { useConnect, useAccount } from 'wagmi'

/**
 * Auto-connect wallet component
 * Automatically reconnects to previously connected wallet on page load
 */
export function AutoConnectWallet() {
  const { connect, connectors } = useConnect()
  const { isConnected } = useAccount()

  useEffect(() => {
    // Only auto-connect if not already connected
    if (isConnected) return

    // Check localStorage for previously connected wallet
    const storedConnectorId = localStorage.getItem('wagmi.wallet')
    
    if (storedConnectorId) {
      const connector = connectors.find(c => c.id === storedConnectorId || c.uid === storedConnectorId)
      
      if (connector) {
        // Small delay to ensure wagmi is fully initialized
        const timer = setTimeout(() => {
          try {
            connect({ connector })
          } catch (error) {
            // Silently fail and clear invalid stored connector
            localStorage.removeItem('wagmi.wallet')
          }
        }, 500)
        
        return () => clearTimeout(timer)
      }
    }
  }, [isConnected, connect, connectors])

  return null
}

