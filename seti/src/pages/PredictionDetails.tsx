"use client"

import { Layout } from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { getPredictionById } from "@/hooks/usePrediction"
import { useMarket } from "@/hooks/useMarket"
import { calculatePrices } from "@/types/contract"
import { MarketChart } from "@/components/MarketChart"
import { useEffect, useState } from "react"
import type { Prediction } from "@/hooks/usePrediction"

export default function PredictionDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  // Fetch full market data for this prediction's market (used to render the chart)
  const marketResult = useMarket(prediction?.marketId ?? "")
  const market = marketResult.data
  const prices = market ? calculatePrices(market.outcome_a_shares, market.outcome_b_shares) : { yesPrice: 50, noPrice: 50 }

  useEffect(() => {
    if (id) {
      const pred = getPredictionById(id)
      setPrediction(pred || null)
    }
  }, [id])

  if (!prediction) {
    return (
      <Layout>
        <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-16 max-w-4xl">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Prediction Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The prediction you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/dashboard">
              <Button className="btn-market-gold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const isActive = prediction.status === "active"
  const isWon = prediction.status === "won"
  const isLost = prediction.status === "lost"
  const profit = (prediction.actualPayout || 0) - prediction.amount

  return (
    <Layout>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 md:py-12 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold">Prediction Details</h1>
            {isActive && (
              <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full border border-blue-500/30">
                ACTIVE
              </span>
            )}
            {isWon && (
              <span className="inline-flex px-3 py-1 bg-success/20 text-success text-sm font-bold rounded-full border border-success/30 items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                WON
              </span>
            )}
            {isLost && (
              <span className="inline-flex px-3 py-1 bg-muted text-muted-foreground text-sm font-bold rounded-full border border-border items-center gap-1">
                <XCircle className="w-4 h-4" />
                LOST
              </span>
            )}
          </div>
          <p className="text-muted-foreground">View your prediction details and status</p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Market Info Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Market Information</CardTitle>
              <CardDescription>Details about the prediction market</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full border border-primary/30 mb-3">
                  {prediction.marketCategory}
                </span>
                <h3 className="text-xl font-bold mb-2">{prediction.marketQuestion}</h3>
                <p className="text-sm text-muted-foreground">Market ID: {prediction.marketId}</p>
              </div>
            </CardContent>
          </Card>

          {/* Market Price Chart (only shown on individual market page) */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Market Price Chart</CardTitle>
              <CardDescription>24h price movement for this market</CardDescription>
            </CardHeader>
            <CardContent>
              <MarketChart
                marketId={prediction.marketId}
                currentYesPrice={prices.yesPrice}
                currentNoPrice={prices.noPrice}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Prediction Details Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Your Prediction</CardTitle>
              <CardDescription>Details about your position</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Outcome</div>
                    <div
                      className={`text-2xl font-bold ${prediction.outcome === "YES" ? "text-success" : "text-danger"}`}
                    >
                      {prediction.outcome}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Amount Invested</div>
                    <div className="text-2xl font-bold text-foreground">{prediction.amount} USDC</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Price at Purchase</div>
                    <div className="text-xl font-bold text-foreground">{prediction.price}¢</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {isActive ? "Potential Payout" : "Actual Payout"}
                    </div>
                    <div className="text-2xl font-bold text-gradient-gold">
                      {isActive
                        ? `${prediction.potentialPayout.toFixed(2)} USDC`
                        : `${(prediction.actualPayout || 0).toFixed(2)} USDC`}
                    </div>
                  </div>

                  {!isActive && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Profit/Loss</div>
                      <div className={`text-2xl font-bold ${profit >= 0 ? "text-success" : "text-danger"}`}>
                        {profit >= 0 ? "+" : ""}
                        {profit.toFixed(2)} USDC
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <div className="text-lg font-semibold text-foreground capitalize">
                      {prediction.status.replace("_", " ")}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Important dates for this prediction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Prediction Placed</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(prediction.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                {prediction.settledAt && (
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${isWon ? "bg-success/20" : "bg-muted"
                        }`}
                    >
                      {isWon ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">Market Settled</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(prediction.settledAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Receipt ID Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Receipt Information</CardTitle>
              <CardDescription>Your unique prediction identifier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Receipt ID</div>
                  <div className="font-mono text-sm">{prediction.id}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(prediction.id)
                  }}
                >
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
