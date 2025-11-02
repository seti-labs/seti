import { useState } from 'react';
import { Market } from '@/types/contract';

export interface PredictionReceipt {
  id: string;
  marketId: string;
  marketQuestion: string;
  outcome: 'YES' | 'NO';
  amount: number;
  price: number;
  potentialPayout: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

export function usePredictionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO' | null>(null);
  const [receipt, setReceipt] = useState<PredictionReceipt | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const openModal = (market: Market, outcome: 'YES' | 'NO') => {
    console.log('usePredictionModal: Opening modal with:', { market: market.question, outcome });
    setSelectedMarket(market);
    setSelectedOutcome(outcome);
    setIsOpen(true);
    setShowReceipt(false);
    setReceipt(null);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedMarket(null);
    setSelectedOutcome(null);
    setShowReceipt(false);
    setReceipt(null);
  };

  const showPredictionReceipt = (receiptData: PredictionReceipt) => {
    setReceipt(receiptData);
    setShowReceipt(true);
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setReceipt(null);
    closeModal();
  };

  return {
    isOpen,
    selectedMarket,
    selectedOutcome,
    receipt,
    showReceipt,
    openModal,
    closeModal,
    showPredictionReceipt,
    closeReceipt,
  };
}
