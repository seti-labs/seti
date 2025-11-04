"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { sportsApi } from "@/services/api"
import { TrendingUp, Gift, Target, Loader2, RefreshCw } from "lucide-react"

export function SportsIntelligence() {
  const [intelligence, setIntelligence] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchIntelligence = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await sportsApi.getMarketIntelligence()
      
      if (response.success) {
        setIntelligence(response)
        setLastUpdated(response.last_updated)
      } else {
        setError('Failed to fetch market intelligence')
      }
    } catch (err) {
      console.error('Error fetching intelligence:', err)
      setError('Failed to fetch market intelligence')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIntelligence()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchIntelligence, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading intelligence...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-sm text-destructive mb-2">{error}</div>
        <Button size="sm" variant="outline" onClick={fetchIntelligence}>
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Market Intelligence</h3>
          <Button size="sm" variant="ghost" onClick={fetchIntelligence}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </Card>

      {/* Arbitrage Opportunities */}
      {intelligence?.arbitrage_opportunities?.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-sm">Arbitrage Opportunities</h4>
            <Badge variant="secondary" className="text-xs">
              {intelligence.arbitrage_opportunities.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {intelligence.arbitrage_opportunities.slice(0, 3).map((opp: any) => (
              <div key={opp.market_id} className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <div className="text-xs font-medium text-green-800 dark:text-green-200">
                  {opp.home_team} vs {opp.away_team}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  Potential profit: {opp.potential_profit.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Confidence: {(opp.confidence * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Trending Markets */}
      {intelligence?.trending_markets?.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-sm">Trending Markets</h4>
            <Badge variant="secondary" className="text-xs">
              {intelligence.trending_markets.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {intelligence.trending_markets.slice(0, 5).map((market: any) => (
              <div key={market.market_id} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <div className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  {market.home_team} vs {market.away_team}
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                  <span>Score: {market.trending_score.toFixed(2)}</span>
                  <span>•</span>
                  <span>Vol: ${(market.volume_24h / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Market Confidence */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-purple-600" />
          <h4 className="font-semibold text-sm">Market Insights</h4>
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Opportunities:</span>
            <span className="font-medium">
              {intelligence?.arbitrage_opportunities?.length || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active Markets:</span>
            <span className="font-medium">
              {intelligence?.trending_markets?.length || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Update:</span>
            <span className="font-medium">
              {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}

