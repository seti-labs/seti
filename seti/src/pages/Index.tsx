"use client"
import { useState } from "react"
import { MarketCard } from "@/components/MarketCard"
import { MarketCardSkeleton } from "@/components/MarketCardSkeleton"
import { SharedPredictionModal, PredictionReceiptModal } from "@/components/SharedPredictionModal"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Plus, TrendingUp, BookmarkCheck } from "lucide-react"
import { useMarkets } from "@/hooks/useMarkets"
import { usePredictionModalContext } from "@/contexts/PredictionModalContext"
import { useFavoritesBackend } from "@/hooks/useFavoritesBackend"
import { useWalletConnection } from "@/hooks/useWalletConnection"
import { Layout } from "@/components/Layout"
import { MarketDetailsSidebar } from "@/components/MarketDetailsSidebar"
import { useMarketSidebar } from "@/contexts/MarketSidebarContext"
import { FailedPredictionsNotification } from "@/components/FailedPredictionsNotification"
const Index = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("created_timestamp");
  const [showSaved, setShowSaved] = useState(false);
  
  const { isConnected } = useWalletConnection()
  
  // Use backend filtering instead of frontend filtering
  const { markets, isLoading, error, refetch } = useMarkets({
    category: activeTab === "all" ? undefined : activeTab,
    sort_by: sortBy as 'volume_24h' | 'total_liquidity' | 'created_timestamp',
    status: 'active'
  })
  
  const { favorites, isFavorite } = useFavoritesBackend()
  
  const {
    isOpen,
    selectedMarket,
    selectedOutcome,
    receipt,
    showReceipt,
    closeModal,
    showPredictionReceipt,
    closeReceipt,
  } = usePredictionModalContext()

  const { isOpen: isSidebarOpen, selectedMarket: sidebarMarket, closeSidebar } = useMarketSidebar()

  // Filter markets based on saved state
  const filteredMarkets = showSaved 
    ? markets.filter(market => isFavorite(market.id))
    : markets;

  return (
    <Layout>
      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* Failed Predictions Notification */}
        <FailedPredictionsNotification />
        {/* Main Markets Section */}
        <section className="py-6 w-full overflow-x-hidden">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <div className="w-full">
                <Tabs value={activeTab} className="w-full mb-4 sm:mb-6 md:mb-8" onValueChange={setActiveTab}>


              {/* Controls with Saved Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-muted/30 border border-border/50 rounded-md px-3 py-2 text-sm text-foreground"
                    >
                      <option value="created_timestamp">Newest</option>
                      <option value="volume_24h">Volume</option>
                      <option value="total_liquidity">Liquidity</option>
                    </select>
                  </div>
                  <button 
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                      showSaved 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                    onClick={() => setShowSaved(!showSaved)}
                    title={showSaved ? 'Show All Markets' : 'Show Saved Markets'}
                  >
                    <BookmarkCheck className={`w-4 h-4 ${showSaved ? 'text-white' : 'text-muted-foreground'}`} />
                  </button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredMarkets.length} markets
                </div>
              </div>





              <TabsContent value={activeTab} className="mt-8">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                    {[...Array(8)].map((_, index) => (
                      <MarketCardSkeleton key={index} />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={refetch} className="rounded-xl bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background">
                      Try Again
                    </Button>
                  </div>
                ) : markets.length === 0 ? (
                  <div className="text-center py-12">
                    <Plus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No markets yet</h3>
                    <p className="text-muted-foreground mb-6">Be the first to create a prediction market!</p>
                    <Button
                      className="bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background gap-2"
                      onClick={() => {
                        if (!isConnected) {
                          window.scrollTo({ top: 0, behavior: "smooth" })
                          setTimeout(() => {
                            alert(
                              'Please connect your wallet first using the "Connect Wallet" button in the header to create markets',
                            )
                          }, 500)
                        } else {
                          // Wallet is connected, allow creating market
                          window.scrollTo({ top: 0, behavior: "smooth" })
                          // You can add logic here to open a create market modal or navigate to create market page
                          alert('Wallet is connected! You can now create markets.')
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      {isConnected ? 'Create Market' : 'Connect Wallet to Create Market'}
                    </Button>
                  </div>
                ) : (
                  <div>
                    {showSaved && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          📌 Showing {filteredMarkets.length} saved market{filteredMarkets.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                    {filteredMarkets.length === 0 ? (
                      <div className="text-center py-12">
                        <h3 className="text-xl font-semibold mb-2">
                          {showSaved ? 'No saved markets' : 'No markets found'}
                        </h3>
                        <p className="text-muted-foreground">
                          {showSaved 
                            ? 'Save some markets by clicking the bookmark icon on market cards' 
                            : 'Try adjusting your search terms'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                        {filteredMarkets.map((market, index) => (
                          <ErrorBoundary key={market.id}>
                            <MarketCard
                              market={market}
                              trending={index < 3 ? (index % 2 === 0 ? "up" : "down") : undefined}
                            />
                          </ErrorBoundary>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Load More - Simplified */}
            {!isLoading && markets.length > 0 && (
              <div className="text-center mt-8">
                <Button
                  size="lg"
                  className="gap-2 w-full sm:w-auto transition-all duration-200 hover:scale-105 bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background rounded-xl"
                  onClick={() => {
                    refetch();
                  }}
                >
                  Load More Markets
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
            </div>
          </div>
        </section>

        {/* Shared Prediction Modal */}
        <SharedPredictionModal
          isOpen={isOpen}
          onClose={closeModal}
          market={selectedMarket}
          outcome={selectedOutcome}
          onShowReceipt={showPredictionReceipt}
        />

        {/* Prediction Receipt Modal */}
        <PredictionReceiptModal isOpen={showReceipt} onClose={closeReceipt} receipt={receipt} />

        {/* Market Details Sidebar */}
        <MarketDetailsSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          market={sidebarMarket}
        />
      </div>
    </Layout>
  )
}

export default Index
