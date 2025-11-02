"use client"

import { Button } from "@/components/ui/button"
import { MarketBadge } from "./MarketBadge"
import { TrendingUp, TrendingDown, Users, Clock, ImageIcon, Gift, Bookmark, BookmarkCheck } from "lucide-react"
import { type Market, calculatePrices, formatTimeRemaining, formatVolume } from "@/types/contract"
import { useMarketSidebar } from "@/contexts/MarketSidebarContext"
import { useCountdown } from "@/hooks/useCountdown"
import { useFavoritesBackend } from "@/hooks/useFavoritesBackend"
import { useConfirmation } from "@/contexts/ConfirmationContext"
import { useState } from "react"

interface MarketCardProps {
  market: Market
  trending?: "up" | "down"
}


export function MarketCard({ market, trending }: MarketCardProps) {
  const { yesPrice, noPrice } = calculatePrices(market.outcome_a_shares || 0, market.outcome_b_shares || 0)
  const { timeLeft, isEnded, isUrgent } = useCountdown(market.end_time)
  const volume = formatVolume(market.volume_24h)
  const [isAnimating, setIsAnimating] = useState(false)

  // Calculate liquidity in USDC (divide by 1,000,000 for 6 decimals)
  const liquidityUSDC = (market.total_liquidity || 0) / 1_000_000

  // Check if it's a sports market
  const isSportsMarket = market.category?.toLowerCase().includes('sport') || 
                        market.question?.toLowerCase().includes('football') ||
                        market.question?.toLowerCase().includes('soccer') ||
                        market.question?.toLowerCase().includes('basketball') ||
                        market.question?.toLowerCase().includes('baseball') ||
                        market.question?.toLowerCase().includes('hockey') ||
                        market.question?.toLowerCase().includes('tennis') ||
                        market.question?.toLowerCase().includes('cricket') ||
                        market.question?.toLowerCase().includes('rugby') ||
                        market.question?.toLowerCase().includes('match') ||
                        market.question?.toLowerCase().includes('game') ||
                        market.question?.toLowerCase().includes('vs') ||
                        market.question?.toLowerCase().includes('v ')

  // Get sidebar context
  const { openSidebar } = useMarketSidebar()
  const { isFavorite, toggleFavorite } = useFavoritesBackend()
  const { showConfirmation } = useConfirmation()

  const handlePredictionClick = (outcome: "YES" | "NO") => {
    console.log("[MarketCard] Opening sidebar for market:", market.question)
    openSidebar(market)
  }

  const handleFavoriteClick = () => {
    console.log("[v0] MarketCard: Favorite clicked:", market.id)
    
    // Start animation
    setIsAnimating(true)
    
    setTimeout(() => {
      setIsAnimating(false)
      toggleFavorite(market.id)
      
      showConfirmation({
        type: 'success',
        title: isFavorite(market.id) ? 'Removed from Favorites' : 'Added to Favorites',
        message: isFavorite(market.id) 
          ? 'This market has been removed from your favorites.'
          : 'This market has been added to your favorites.',
        autoClose: true,
        autoCloseDelay: 1500
      })
    }, 300)
  }

  return (
    <div className={`market-card group p-3 sm:p-4 w-full max-w-sm mx-auto bg-background/30 dark:bg-black/20 backdrop-blur-sm border border-border/40 dark:border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 hover:bg-background/40 dark:hover:bg-black/30 ${
      isAnimating ? 'animate-prediction-pulse' : ''
    }`}>
      {/* Market Header */}
      <div className="mb-3 sm:mb-4">
        {/* Market Question */}
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200 leading-tight line-clamp-2 mb-2 sm:mb-3">
            {market.question}
          </h3>
          
          {/* Market Status */}
          <div className="flex items-center gap-2 flex-wrap">
            {market.resolved ? (
              <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                RESOLVED
              </div>
            ) : (
              <div className={`flex items-center gap-2 text-sm ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                <Clock className={`w-4 h-4 ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`} />
                <span className={isUrgent ? 'font-semibold' : ''}>
                  {isUrgent ? 'Ends soon' : 'Ends'} {timeLeft}
                </span>
              </div>
            )}
            
            {/* LIVE tag for sports markets */}
            {isSportsMarket && !market.resolved && (
              <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded border border-red-200">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                LIVE
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prediction Buttons */}
      <div className="flex gap-2 mb-3">
        <Button
          className="flex-1 h-10 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 btn-prediction border-2 border-green-400/30"
          disabled={market.resolved}
          onClick={() => handlePredictionClick("YES")}
        >
          <span className="text-base font-bold">YES</span>
          <span className="text-xs font-bold bg-white/25 px-2 py-1 rounded-full">{yesPrice}%</span>
        </Button>
        <Button
          className="flex-1 h-10 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 btn-prediction border-2 border-red-400/30"
          disabled={market.resolved}
          onClick={() => handlePredictionClick("NO")}
        >
          <span className="text-base font-bold">NO</span>
          <span className="text-xs font-bold bg-white/25 px-2 py-1 rounded-full">{noPrice}%</span>
        </Button>
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border/50">
        {/* Volume */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Vol.</span>
          <span className="text-xs sm:text-sm font-bold text-card-foreground">${volume}</span>
        </div>

        {/* Bookmark Icon */}
          <button 
          className={`p-1.5 sm:p-2 rounded-md transition-colors duration-200 hover:scale-105 group ${
              isFavorite(market.id) 
              ? 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30' 
              : 'hover:bg-muted/50'
          } ${isAnimating ? 'animate-favorite-heart' : ''}`}
            onClick={handleFavoriteClick}
            title={isFavorite(market.id) ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite(market.id) ? (
            <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 group-hover:text-yellow-700 dark:text-yellow-400 dark:group-hover:text-yellow-300 transition-colors" />
            ) : (
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-yellow-500 transition-colors" />
            )}
          </button>
      </div>
    </div>
  )
}
