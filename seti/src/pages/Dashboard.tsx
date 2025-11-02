"use client"

import { Layout } from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, DollarSign, Activity, BarChart3, Plus, Clock, TrendingDown, Target, Award, Zap, Eye } from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useUserPredictions } from "@/hooks/useUserPredictions"
import { usersApi } from "@/services/api"
import { useWalletConnection } from "@/hooks/useWalletConnection"

export default function Dashboard() {
  const { isConnected, address, isConnecting, isReady, shouldShowConnectPrompt, isWalletReady } = useWalletConnection()
  const { predictions, isLoading: loadingPredictions } = useUserPredictions(address)
  
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalPayout: 0,
    totalProfit: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    activePositions: 0,
    closedPositions: 0,
    activeValue: 0,
    avgPositionSize: 0,
    bestWin: 0,
    worstLoss: 0,
    streak: 0,
    totalMarkets: 0,
    roi: 0,
  })

  useEffect(() => {
    if (address) {
      loadStats()
    }
  }, [address])

  const loadStats = async () => {
    if (!address) return
    
    try {
      const response = await usersApi.getStats(address)
      if (response.stats) {
        // Calculate additional metrics from predictions
        const activePredictions = predictions.filter(p => p.market && !p.market.resolved)
        const closedPredictions = predictions.filter(p => p.market && p.market.resolved)
        const wonPredictions = closedPredictions.filter(p => p.market?.winning_outcome === p.outcome)
        
        const totalInvested = response.stats.total_volume / 1000000000
        const totalPayout = wonPredictions.reduce((sum, p) => sum + (p.shares || 0) / 1000000000, 0)
        const totalProfit = totalPayout - totalInvested
        const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0
        
        // Calculate best win and worst loss
        const profits = closedPredictions.map(p => {
          const isWin = p.market?.winning_outcome === p.outcome
          return isWin ? (p.shares || 0) / 1000000000 - (p.amount || 0) / 1000000000 : 0
        })
        const bestWin = Math.max(...profits, 0)
        const worstLoss = Math.min(...profits, 0)
        
        // Calculate average position size
        const avgPositionSize = predictions.length > 0 
          ? predictions.reduce((sum, p) => sum + (p.amount || 0) / 1000000000, 0) / predictions.length 
          : 0
        
        // Calculate current streak (simplified)
        const recentPredictions = closedPredictions.slice(-5)
        const recentWins = recentPredictions.filter(p => p.market?.winning_outcome === p.outcome).length
        const streak = recentWins === recentPredictions.length ? recentWins : 0
        
        setStats({
          totalInvested,
          totalPayout,
          totalProfit,
          wins: response.stats.wins,
          losses: response.stats.losses,
          winRate: response.stats.win_rate,
          activePositions: activePredictions.length,
          closedPositions: closedPredictions.length,
          activeValue: activePredictions.reduce((sum, p) => sum + (p.amount || 0) / 1000000000, 0),
          avgPositionSize,
          bestWin,
          worstLoss,
          streak,
          totalMarkets: predictions.length,
          roi,
        })
      }
    } catch (error: any) {
      // If user doesn't exist yet, that's fine - show zero stats
      if (error.message?.includes('User not found')) {
        console.log('New user - no stats yet. Place your first prediction!');
        // Stats already initialized to zeros
      } else {
        console.error('Error loading stats:', error)
      }
    }
  }
  
  // Split predictions into active and closed
  const activePredictions = predictions.filter(p => p.market && !p.market.resolved)
  const closedPredictions = predictions.filter(p => p.market && p.market.resolved)

  // Show loading state while wallet is initializing
  if (!isReady || isConnecting) {
    return (
      <Layout>
        <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-16 max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">Dashboard</h1>
            <p className="text-muted-foreground mb-8">Loading wallet connection...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Show connect prompt if wallet is not connected
  if (shouldShowConnectPrompt) {
    return (
      <Layout>
        <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-16 max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">Dashboard</h1>
            <p className="text-muted-foreground mb-8">Connect your wallet to view your dashboard</p>
            <Button className="btn-market-gold">Connect Wallet</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your predictions and portfolio performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.activeValue.toFixed(2)} USDC</div>
              <p className="text-sm text-muted-foreground mt-1">Active positions</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
                {stats.totalProfit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stats.totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                {stats.totalProfit >= 0 ? "+" : ""}{stats.totalProfit.toFixed(2)} USDC
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ROI: {stats.roi.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.winRate.toFixed(0)}%</div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.wins}W / {stats.losses}L
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Positions</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.activePositions}</div>
              <p className="text-sm text-muted-foreground mt-1">Open trades</p>
            </CardContent>
          </Card>
        </div>

        {/* Win/Loss Chart */}
        {stats.wins > 0 || stats.losses > 0 ? (
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">Win/Loss History</CardTitle>
              <CardDescription>Your prediction performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Win/Loss Comparison Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">Wins</span>
                    <span className="text-sm font-medium">{stats.wins}</span>
                  </div>
                  <div className="h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-end pr-2"
                      style={{
                        width: `${stats.wins + stats.losses > 0 ? (stats.wins / (stats.wins + stats.losses)) * 100 : 0}%`,
                      }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {stats.wins + stats.losses > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-600">Losses</span>
                    <span className="text-sm font-medium">{stats.losses}</span>
                  </div>
                  <div className="h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-end pr-2"
                      style={{
                        width: `${stats.wins + stats.losses > 0 ? (stats.losses / (stats.wins + stats.losses)) * 100 : 0}%`,
                      }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {stats.wins + stats.losses > 0 ? ((stats.losses / (stats.wins + stats.losses)) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.winRate.toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{stats.wins + stats.losses}</div>
                    <div className="text-sm text-muted-foreground">Total Closed</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Positions */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="bg-muted/30 border border-border/50">
            <TabsTrigger value="active">Active Positions</TabsTrigger>
            <TabsTrigger value="closed">Closed Positions</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Active Positions</CardTitle>
                <CardDescription>Your current market positions</CardDescription>
              </CardHeader>
              <CardContent>
                {activePredictions.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No active positions</h3>
                    <p className="text-muted-foreground mb-6">Start trading to see your positions here</p>
                    <Link to="/">
                      <Button className="bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background transition-all duration-200 hover:scale-105 gap-2">
                        <Plus className="w-4 h-4" />
                        Browse Markets
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activePredictions.map((prediction) => (
                      <Link key={prediction.id} to={`/prediction/${prediction.id}`}>
                        <div className="p-4 bg-muted/20 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-block px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded border border-primary/30">
                                  {prediction.market?.category || 'Unknown'}
                                </span>
                                <span
                                  className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${prediction.outcome_label === "YES"
                                      ? "bg-success/20 text-success border border-success/30"
                                      : "bg-danger/20 text-danger border border-danger/30"
                                    }`}
                                >
                                  {prediction.outcome_label}
                                </span>
                              </div>
                              <h4 className="font-semibold text-sm mb-1 line-clamp-2">{prediction.market?.question || 'Market data unavailable'}</h4>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(prediction.timestamp * 1000).toLocaleDateString()}
                                </span>
                                <span>Amount: {(prediction.amount / 1000000000).toFixed(2)} USDC</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-foreground mb-1">{(prediction.amount / 1000000000).toFixed(2)} USDC</div>
                              <div className="text-xs text-muted-foreground">
                                Shares: {(prediction.shares / 1000000000).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="closed" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Closed Positions</CardTitle>
                <CardDescription>Your resolved market positions</CardDescription>
              </CardHeader>
              <CardContent>
                {closedPredictions.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No closed positions</h3>
                    <p className="text-muted-foreground">Your trading history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {closedPredictions.map((prediction) => {
                      const profit = (prediction.actualPayout || 0) - prediction.amount
                      const isWin = prediction.status === "won"

                      return (
                        <Link key={prediction.id} to={`/prediction/${prediction.id}`}>
                          <div className="p-4 bg-muted/20 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="inline-block px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded border border-primary/30">
                                    {prediction.marketCategory}
                                  </span>
                                  <span
                                    className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${prediction.outcome === "YES"
                                        ? "bg-success/20 text-success border border-success/30"
                                        : "bg-danger/20 text-danger border border-danger/30"
                                      }`}
                                  >
                                    {prediction.outcome}
                                  </span>
                                  <span
                                    className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${isWin
                                        ? "bg-success/20 text-success border border-success/30"
                                        : "bg-muted text-muted-foreground border border-border"
                                      }`}
                                  >
                                    {isWin ? "WON" : "LOST"}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-sm mb-1 line-clamp-2">{prediction.marketQuestion}</h4>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span>
                                    Settled:{" "}
                                    {prediction.settledAt ? new Date(prediction.settledAt).toLocaleDateString() : "N/A"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-foreground mb-1">{prediction.amount} USDC</div>
                                <div
                                  className={`text-xs font-semibold ${profit >= 0 ? "text-success" : "text-danger"}`}
                                >
                                  {profit >= 0 ? "+" : ""}
                                  {profit.toFixed(2)} USDC
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
