import { MarketCard } from "@/components/MarketCard"
import { MarketCardSkeleton } from "@/components/MarketCardSkeleton"
import { useMarkets } from "@/hooks/useMarkets"
import { TrendingUp, Star, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function FeaturedMarkets() {
  const { markets, isLoading } = useMarkets({
    sort_by: 'volume_24h',
    status: 'active'
  })

  // Get top 3 markets by volume for featured section
  const featuredMarkets = markets.slice(0, 3)

  return (
    <div className="w-full space-y-6">
      {/* Featured Markets Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5 text-yellow-500" />
            Featured Markets
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Today's top performing markets
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <MarketCardSkeleton key={index} />
              ))}
            </div>
          ) : featuredMarkets.length > 0 ? (
            <div className="space-y-3">
              {featuredMarkets.map((market, index) => (
                <div key={market.id} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1} Trending
                    </Badge>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs font-medium">Hot</span>
                    </div>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg border border-border/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
                    <h4 className="font-medium text-sm mb-2 line-clamp-2 leading-tight">
                      {market.question}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize bg-muted/50 px-2 py-1 rounded text-xs">
                        {market.category}
                      </span>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Zap className="w-3 h-3" />
                        <span className="font-medium">Hot</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No featured markets yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Market Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Markets</span>
            <Badge variant="outline">{markets.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Today</span>
            <Badge variant="outline" className="text-green-600 dark:text-green-400">
              {markets.filter(m => m.status === 'active').length}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Categories</span>
            <Badge variant="outline">
              {new Set(markets.map(m => m.category).filter(Boolean)).size}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
