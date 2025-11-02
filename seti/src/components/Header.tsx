"use client"

import { Button } from "@/components/ui/button"
import { Search, Plus, User, BarChart3, Activity, ChevronDown, Bell, Menu, X, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { CreateMarketModal } from "./CreateMarketModal"
import { Link, useLocation } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./ThemeToggle"
import { useWalletConnection } from '@/hooks/useWalletConnection'
import { useDisconnect } from 'wagmi'
import { WalletModal } from "./WalletModal"
import { NotificationDropdown } from './NotificationDropdown'
import { WalletStatusIndicator } from './WalletStatusIndicator'


export function Header() {
  const location = useLocation()
  const [isCreateMarketOpen, setIsCreateMarketOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { 
    isConnected, 
    address, 
    displayBalance,
    formattedUsdcBalance,
    usdcSymbol,
    formattedEthBalance,
    ethSymbol,
    isLoadingBalance,
    balanceError,
    walletError
  } = useWalletConnection()
  const { disconnect } = useDisconnect()
  
  // Handle balance display with error states
  const getBalanceDisplay = () => {
    if (balanceError) {
      return 'Error loading balance'
    }
    if (isLoadingBalance) {
      return 'Loading...'
    }
    if (displayBalance) {
      return `${displayBalance.value} ${displayBalance.symbol}`
    }
    return '0.00 USDC'
  }

  // Admin addresses - only these can create markets
  const ADMIN_ADDRESSES = [
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Replace with actual admin address
  ];

  const isAdmin = address && ADMIN_ADDRESSES.some(admin => 
    admin.toLowerCase() === address.toLowerCase()
  );

  return (
    <div className="flex flex-col">
      <header
        className="fixed top-0 z-50 w-full border-b border-border/20 bg-background/80 backdrop-blur flex justify-center overflow-visible"
      >
        <div className="container mx-auto px-2 sm:px-4 h-14 flex items-center justify-between max-w-7xl w-full overflow-visible relative header-mobile md:header-tablet lg:header-desktop">
          {/* Left Section - Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity gap-2 logo">
              <img src="./seti_.svg" alt="Seti logo" className="h-6 w-6 sm:h-8 sm:w-8" />
              <span
                className="text-lg sm:text-2xl font-bold text-snow"
                style={{
                  fontFamily: "'Fortune Variable'",
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                Seti
              </span>
            </Link>
          </div>

          {/* Center Section - Search (Desktop Only) */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4 flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search Seti..."
                className="pl-10 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-muted/50 rounded-xl"
                onChange={(e) => {
                  // Dispatch a custom event that other components can listen to
                  const searchEvent = new CustomEvent('marketSearch', {
                    detail: { query: e.target.value.toLowerCase() }
                  });
                  window.dispatchEvent(searchEvent);
                }}
              />
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 mobile-actions md:actions">
            {/* Mobile Theme Toggle */}
            <div className="md:hidden">
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {isConnected && isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                className="items-center gap-1 lg:gap-2 rounded-xl bg-transparent hover:bg-[hsl(208,65%,75%)] hover:text-background border-[hsl(208,65%,75%)]"
                onClick={() => setIsCreateMarketOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden lg:inline">Create Market</span>
                <span className="lg:hidden">Create</span>
              </Button>
            )}

            {/* Notifications Dropdown - Only show when logged in */}
            {isConnected && <NotificationDropdown />}

            {/* Wallet Error Display */}
            {walletError && (
              <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
                {walletError}
              </div>
            )}

            {/* Wallet Connection */}
            {!isConnected ? (
              <Button
                onClick={() => setIsWalletModalOpen(true)}
                className="bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background rounded-xl"
              >
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                {/* Clean Balance Display */}
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">
                    {getBalanceDisplay()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnect()}
                  className="rounded-xl"
                >
                  Disconnect
                </Button>
              </div>
            )}

            {/* User Menu Dropdown - Only shown when connected, positioned after wallet */}
            {isConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="items-center gap-2 rounded-xl bg-transparent hover:bg-[hsl(208,65%,75%)] hover:text-background border-[hsl(208,65%,75%)]"
                  >
                    <User className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/dashboard" 
                      className={`flex items-center gap-2 w-full ${location.pathname === '/dashboard' ? 'bg-[hsl(208,65%,75%)] text-background' : ''}`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/activity" 
                      className={`flex items-center gap-2 w-full ${location.pathname === '/activity' ? 'bg-[hsl(208,65%,75%)] text-background' : ''}`}
                    >
                      <Activity className="w-4 h-4" />
                      Activity
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/profile" 
                      className={`flex items-center gap-2 w-full ${location.pathname === '/profile' ? 'bg-[hsl(208,65%,75%)] text-background' : ''}`}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur border-b border-border/20">
          <div className="container mx-auto px-2 sm:px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search Seti..."
                className="pl-10 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-muted/50 rounded-xl"
                onChange={(e) => {
                  const searchEvent = new CustomEvent('marketSearch', {
                    detail: { query: e.target.value.toLowerCase() }
                  });
                  window.dispatchEvent(searchEvent);
                }}
              />
            </div>

            {/* Mobile Navigation */}
            <div className="flex flex-col space-y-1">
              <Link
                to="/"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === "/" 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Link>
              
              <Link
                to="/activity"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === "/activity" 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Activity className="w-4 h-4" />
                Activity
              </Link>

              {isConnected && (
                <Link
                  to="/profile"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === "/profile" 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              )}
            </div>

            {/* Mobile Wallet Actions */}
            <div className="pt-4 border-t border-border/20">
              {!isConnected ? (
                <Button
                  onClick={() => {
                    setIsWalletModalOpen(true)
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background rounded-xl"
                >
                  Connect Wallet
                </Button>
              )               : (
                <div className="space-y-2">
                  {isAdmin && (
                    <Button
                      onClick={() => {
                        setIsCreateMarketOpen(true)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full bg-transparent hover:bg-[hsl(208,65%,75%)] hover:text-background border-[hsl(208,65%,75%)] rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Market
                    </Button>
                  )}
                  
                  <div className="text-center py-2">
                    <div className="text-lg font-bold text-foreground mb-1">
                      {getBalanceDisplay()}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
                    </div>
                    <WalletStatusIndicator />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateMarketModal
        isOpen={isCreateMarketOpen}
        onClose={() => setIsCreateMarketOpen(false)}
        onSuccess={(marketId) => {
          console.log('Market created:', marketId)
          setIsCreateMarketOpen(false)
        }}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  )
}