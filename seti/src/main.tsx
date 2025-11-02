import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { baseSepolia } from 'wagmi/chains'
import { injected, coinbaseWallet } from 'wagmi/connectors'
import App from './App.tsx'
import './index.css'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { ThemePreferencesSync } from './components/ThemePreferencesSync'


// Suppress common wallet and analytics errors
const originalConsoleError = console.error
console.error = (...args) => {
  const message = args[0]?.toString() || ''
  if (
    message.includes('Analytics SDK') ||
    message.includes('Failed to fetch') ||
    message.includes('ERR_BLOCKED_BY_CLIENT') ||
    message.includes('cca-lite.coinbase.com') ||
    message.includes('coinbase.com/amp') ||
    message.includes('coinbase.com/metrics') ||
    message.includes('chrome.runtime.sendMessage') ||
    message.includes('Extension ID') ||
    message.includes('inpage.js') ||
    message.includes('inject.js') ||
    message.includes('Enkrypt') ||
    message.includes('MetaMask') ||
    message.includes('WalletConnect') ||
    message.includes('Error in invocation of runtime.sendMessage') ||
    message.includes('Please use @farcaster/miniapp-sdk instead') ||
    message.includes('must specify an Extension ID') ||
    message.includes('runtime.sendMessage() called from a webpage') ||
    message.includes('TypeError: Error in invocation of runtime.sendMessage') ||
    message.includes('Cannot read properties of undefined') ||
    message.includes('reading \'bind\'') ||
    message.includes('hydrate2') ||
    message.includes('createStoreImpl') ||
    message.includes('createConfig') ||
    message.includes('Wallet Connection State') ||
    message.includes('Access to fetch at') ||
    message.includes('CORS policy') ||
    message.includes('429 (Too Many Requests)') ||
    message.includes('net::ERR_FAILED') ||
    message.includes('withTimeout.errorInstance.TimeoutError') ||
    message.includes('base-sepolia.g.alchemy.com') ||
    message.includes('API Error: Internal Server Error') ||
    message.includes('API Error: Failed to fetch') ||
    message.includes('Failed to load preferences from backend') ||
    message.includes('Failed to load favorites from backend') ||
    message.includes('Error fetching markets') ||
    message.includes('Failed to connect to MetaMask') ||
    message.includes('MetaMask extension not found')
  ) {
    // Suppress these non-critical errors
    return
  }
  originalConsoleError.apply(console, args)
}

// Suppress console warnings for wallet extensions
const originalConsoleWarn = console.warn
console.warn = (...args) => {
  const message = args[0]?.toString() || ''
  if (
    message.includes('wallet') ||
    message.includes('extension') ||
    message.includes('inpage') ||
    message.includes('inject')
  ) {
    return
  }
  originalConsoleWarn.apply(console, args)
}

// Global error handler for extension conflicts
window.addEventListener('error', (event) => {
  const message = event.message || ''
  const filename = event.filename || ''
  
  if (
    message.includes('chrome.runtime.sendMessage') ||
    message.includes('Extension ID') ||
    message.includes('runtime.sendMessage') ||
    message.includes('must specify an Extension ID') ||
    message.includes('Cannot read properties of undefined') ||
    message.includes('reading \'bind\'') ||
    message.includes('hydrate2') ||
    message.includes('createStoreImpl') ||
    message.includes('createConfig') ||
    message.includes('Access to fetch at') ||
    message.includes('CORS policy') ||
    message.includes('429 (Too Many Requests)') ||
    message.includes('net::ERR_FAILED') ||
    message.includes('withTimeout.errorInstance.TimeoutError') ||
    filename.includes('inpage.js') ||
    filename.includes('inject.js') ||
    filename.includes('extension') ||
    filename.includes('base-sepolia.g.alchemy.com')
  ) {
    event.preventDefault()
    return
  }
})

// Handle unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.toString() || ''
  
  if (
    reason.includes('chrome.runtime.sendMessage') ||
    reason.includes('Extension ID') ||
    reason.includes('runtime.sendMessage') ||
    reason.includes('must specify an Extension ID') ||
    reason.includes('Error in invocation of runtime.sendMessage') ||
    reason.includes('Cannot read properties of undefined') ||
    reason.includes('reading \'bind\'') ||
    reason.includes('hydrate2') ||
    reason.includes('createStoreImpl') ||
    reason.includes('createConfig') ||
    reason.includes('Access to fetch at') ||
    reason.includes('CORS policy') ||
    reason.includes('429 (Too Many Requests)') ||
    reason.includes('net::ERR_FAILED') ||
    reason.includes('withTimeout.errorInstance.TimeoutError') ||
    reason.includes('base-sepolia.g.alchemy.com') ||
    reason.includes('API Error: Internal Server Error') ||
    reason.includes('API Error: Failed to fetch') ||
    reason.includes('Failed to load preferences from backend') ||
    reason.includes('Failed to load favorites from backend') ||
    reason.includes('Error fetching markets') ||
    reason.includes('Failed to connect to MetaMask') ||
    reason.includes('MetaMask extension not found')
  ) {
    event.preventDefault()
    return
  }
})

const queryClient = new QueryClient()

// Get RPC URL from environment or use fallback
const getRpcUrl = () => {
  const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY
  const customRpc = import.meta.env.VITE_BASE_SEPOLIA_RPC
  const fallbackRpc = import.meta.env.VITE_FALLBACK_RPC
  
  if (apiKey && apiKey !== 'your_alchemy_api_key_here') {
    return `https://base-sepolia.g.alchemy.com/v2/${apiKey}`
  }
  
  if (customRpc) {
    return customRpc
  }
  
  // Use public RPCs as fallback
  return fallbackRpc || 'https://sepolia.base.org'
}

// Create wagmi config with error handling
let wagmiConfig
try {
  wagmiConfig = createConfig({
    chains: [baseSepolia],
    connectors: [
      injected({
        // Remove specific target to allow all injected wallets
        shimDisconnect: true,
      }),
      coinbaseWallet({
        appName: 'Seti',
        appLogoUrl: 'https://seti.app/logo.png',
      }),
    ],
    transports: {
      [baseSepolia.id]: http(getRpcUrl(), {
        retryCount: 2, // Reduce retry count
        retryDelay: 2000, // Increase retry delay
        timeout: 15000, // Increase timeout
        batch: true, // Enable batching
      }),
    },
    pollingInterval: 30000, // Increase polling interval to reduce API calls
    batch: {
      multicall: {
        wait: 32, // Increase batch wait time
        batchSize: 10, // Limit batch size
      },
    },
  })
} catch (error) {
  console.error('Failed to create wagmi config:', error)
  // Fallback to minimal config with public RPC
  wagmiConfig = createConfig({
    chains: [baseSepolia],
    connectors: [
      injected(),
      coinbaseWallet({
        appName: 'Seti',
      }),
    ],
    transports: {
      [baseSepolia.id]: http('https://sepolia.base.org', {
        timeout: 15000,
        retryCount: 1,
      }),
    },
  })
}

// Component that uses theme context for OnchainKit
function OnchainKitWrapper({ children }: { children: React.ReactNode }) {
  const { actualTheme } = useTheme()
  
  try {
    return (
      <OnchainKitProvider
        chain={baseSepolia}
        config={{
          appearance: { 
            mode: 'auto',
            theme: actualTheme
          },
          wallet: { 
            display: 'modal', 
            preference: 'all',
            // Reduce wallet conflicts
          },
          // Completely disable analytics
          analytics: false,
          features: {
            analytics: false,
          }
        }}
      >
        {children}
      </OnchainKitProvider>
    )
  } catch (error) {
    console.error('OnchainKit configuration error:', error)
    // Fallback to minimal OnchainKit config
    return (
      <OnchainKitProvider
        chain={baseSepolia}
        config={{
          appearance: { 
            mode: 'auto',
            theme: actualTheme
          },
          wallet: { 
            display: 'modal'
          },
          // Disable analytics in fallback config too
          analytics: false,
          features: {
            analytics: false,
          }
        }}
      >
        {children}
      </OnchainKitProvider>
    )
  }
}

// Initialize the app with error handling
try {
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
            <OnchainKitWrapper>
            <ThemePreferencesSync />
            <App />
            </OnchainKitWrapper>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
} catch (error) {
  console.error('App initialization error:', error)
  // Fallback rendering
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: system-ui;">
        <h1>Seti</h1>
        <p>Loading the prediction market...</p>
        <p style="color: #666; font-size: 14px;">If this persists, please refresh the page.</p>
      </div>
    `
  }
}
