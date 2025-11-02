import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
import { Market, calculatePrices, formatTimeRemaining } from "@/types/contract";
import { usePrediction } from "@/hooks/usePrediction";
import { useWalletConnection } from "@/hooks/useWalletConnection";

interface PredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: Market | null;
  outcome: 'YES' | 'NO' | null;
}

export function PredictionModal({ isOpen, onClose, market, outcome }: PredictionModalProps) {
  const { isConnected } = useWalletConnection();
  const { placePrediction, isLoading, error } = usePrediction();
  const [amount, setAmount] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO' | null>(outcome);

  if (!isOpen || !market || !outcome) {
    console.log('PredictionModal not rendering:', { isOpen, market: !!market, outcome });
    return null;
  }

  console.log('PredictionModal rendering:', { market: market.question, selectedOutcome });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setLocalError("Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setLocalError("Please enter a valid amount");
      return;
    }


    setLocalError(null);

    try {
        const success = await placePrediction({
          marketId: market.id,
          outcome: outcome,
          amount: parseFloat(amount)
        });

      if (success) {
        alert(`Successfully placed ${outcome} prediction for ${amount} USDC on "${market.question}"`);
        onClose();
        setAmount("");
      }
      
    } catch (err) {
      setLocalError("Failed to place prediction. Please try again.");
    }
  };

  const handleClose = () => {
    setAmount("");
    setLocalError(null);
    onClose();
  };

  const { yesPrice, noPrice } = calculatePrices(market.outcome_a_shares, market.outcome_b_shares);
  const outcomePrice = outcome === 'YES' ? yesPrice : noPrice;

  const potentialPayout = amount ? (parseFloat(amount) * 100 / outcomePrice).toFixed(4) : "0";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-2 sm:p-4 min-h-screen">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full mx-auto my-auto max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gradient-gold font-orbitron">
              Place Prediction
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Market Info - Slideshow Style */}
          <div className="mb-6">
            {/* Market Category */}
            <div className="mb-3">
              <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full border border-primary/30">
                {market.category}
              </span>
            </div>

            {/* Market Question */}
            <h3 className="text-xl md:text-2xl font-bold mb-4 leading-tight">
              <span className="text-gradient-gold font-orbitron">
                {market.question}
              </span>
            </h3>

            {/* Market Description */}
            <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed">
              {market.description}
            </p>
          </div>

          {(error || localError) && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-destructive text-sm">{error || localError}</p>
              </div>
            </div>
          )}

          {/* Market Stats - Exact Slideshow Style */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="flex items-center gap-2">
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-gradient-gold">
                {yesPrice}¢ / {noPrice}¢
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">YES / NO</div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-gradient-neon">
                ${(market.volume_24h / 1_000_000).toFixed(2)}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">24h Volume (USDC)</div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-accent">
                {formatTimeRemaining(market.end_time)}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Time Left</div>
            </div>
          </div>

          {/* Selected Outcome Display */}
          <div className="mb-6 p-4 bg-muted/20 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient-gold mb-2">
                {outcome} - {outcomePrice}¢
              </div>
              <div className="text-sm text-muted-foreground">
                You selected {outcome} outcome
              </div>
            </div>
          </div>

          {/* Amount Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Amount (USDC) *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="0.1"
                    step="0.1"
                    className="pl-10 bg-muted/30 border-border/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum: 0.1 USDC
                </p>
              </div>

              {/* Potential Payout */}
              {amount && parseFloat(amount) > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Potential Payout</Label>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-foreground">
                      {potentialPayout} USDC
                    </div>
                    <div className="text-xs text-muted-foreground">
                      If {outcome} wins (excluding fees)
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Note */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 dark:text-blue-400 text-sm">ℹ️</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Transaction Note:</p>
                    <p>MetaMask will show ETH in the transaction modal, but this represents USDC value. The amount shown in ETH equals your USDC bet amount.</p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose} 
                  className="flex-1 transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className={`flex-1 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    outcome === 'YES' 
                      ? 'btn-market-success' 
                      : 'btn-market-danger'
                  }`}
                  disabled={isLoading || !isConnected || !amount || parseFloat(amount) <= 0}
                >
                  {isLoading ? "Placing..." : `Place ${outcome} Prediction`}
                </Button>
              </div>
            </form>

          {/* Disclaimer */}
          <div className="mt-6 p-3 bg-muted/10 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              Predictions are final once placed. Please review all details before confirming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
