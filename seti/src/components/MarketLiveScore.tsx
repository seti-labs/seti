import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Clock, Trophy } from 'lucide-react'
import { type Market } from '@/types/contract'

interface MarketLiveScoreProps {
  market: Market
  className?: string
}

export function MarketLiveScore({ market, className = "" }: MarketLiveScoreProps) {
  // Don't render if not a sports market
  if (!market.category?.toLowerCase().includes('sport')) {
    return null
  }

  // Simple visual indicators without API calls
  return (
    <div className={`${className}`}>
      <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {market.category}
          </Badge>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <Badge className="text-xs bg-red-500 text-white">
              LIVE
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Trophy className="w-4 h-4" />
              <span>Sports Event</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="w-4 h-4 text-red-500" />
              <span className="text-red-500">Live Now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}