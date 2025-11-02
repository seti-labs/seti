"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  ExternalLink, 
  RefreshCw, 
  TrendingUp, 
  Network, 
  Copy,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ethers } from 'ethers';

interface PriceData {
  price: number;
  decimals: number;
  roundId: bigint;
  updatedAt: bigint;
  description: string;
}

export function SimpleChainlinkApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            await getBalance(accounts[0]);
            await getChainId();
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const getBalance = async (walletAddress: string) => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [walletAddress, 'latest'],
        });
        // Convert from wei to ETH
        const ethBalance = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
        setBalance(ethBalance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const getChainId = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainId, 16));
      }
    } catch (error) {
      console.error('Error fetching chain ID:', error);
    }
  };

  const connect = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask or another Ethereum wallet to continue.');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        await getBalance(accounts[0]);
        await getChainId();
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          if (newAccounts.length > 0) {
            setAddress(newAccounts[0]);
            getBalance(newAccounts[0]);
          } else {
            disconnect();
          }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', (newChainId: string) => {
          setChainId(parseInt(newChainId, 16));
          if (isConnected && address) {
            getBalance(address);
          }
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        alert('Please connect your wallet to continue.');
      }
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance('0');
    setChainId(null);
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGetPrice = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('No Ethereum provider found');
      }

      // Chainlink Price Feed ABI (AggregatorV3Interface)
      const CHAINLINK_ABI = [
        "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
        "function decimals() external view returns (uint8)",
        "function description() external view returns (string memory)"
      ];

      // Get the appropriate Chainlink feed address for current network
      let feedAddress: string;
      
      if (chainId === 1) {
        // Ethereum Mainnet
        feedAddress = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419'; // ETH/USD
      } else if (chainId === 11155111) {
        // Sepolia Testnet
        feedAddress = '0x694AA1769357215Ee4dEabC4f26d985d3BCA08'; // ETH/USD
      } else if (chainId === 8453) {
        // Base Mainnet
        feedAddress = '0x71041dddad3595f9ced3dccfbe3d1f4b0a16bb70'; // ETH/USD
      } else if (chainId === 84532) {
        // Base Sepolia
        feedAddress = '0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1'; // ETH/USD
      } else {
        // Default to Sepolia
        feedAddress = '0x694AA1769357215Ee4dEabC4f26d985d3BCA08';
      }

      // Create ethers provider and contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(feedAddress, CHAINLINK_ABI, provider);

      // Fetch price data from Chainlink
      const [roundData, decimals, description] = await Promise.all([
        contract.latestRoundData(),
        contract.decimals(),
        contract.description(),
      ]);

      const [roundId, answer, startedAt, updatedAt, answeredInRound] = roundData;

      // Convert price to decimal format
      const price = Number(answer) / (10 ** Number(decimals));

      setPriceData({
        price,
        decimals: Number(decimals),
        roundId,
        updatedAt,
        description,
      });

    } catch (err: any) {
      console.error('Error fetching Chainlink price:', err);
      setError(`Failed to fetch price data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const switchToSepolia = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // Sepolia
        });
      }
    } catch (error) {
      console.error('Error switching to Sepolia:', error);
    }
  };

  const switchToBase = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }], // Base
        });
      }
    } catch (error) {
      console.error('Error switching to Base:', error);
    }
  };

  const getNetworkName = () => {
    if (chainId === 1) return 'Ethereum Mainnet';
    if (chainId === 11155111) return 'Sepolia Testnet';
    if (chainId === 8453) return 'Base Mainnet';
    if (chainId === 84532) return 'Base Sepolia';
    return 'Unknown Network';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔗 Chainlink dApp
          </h1>
          <p className="text-slate-300 text-lg">
            Real-time price feeds powered by Chainlink oracles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallet Connection Card */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Wallet Connection
              </CardTitle>
              <CardDescription className="text-slate-300">
                Connect your wallet to interact with Chainlink
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <div className="space-y-4">
                  {/* Modal Header */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Connect a Wallet</h3>
                    <p className="text-slate-400 text-sm">Choose your preferred wallet</p>
                  </div>

                  {/* Popular Wallets Section */}
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Popular</h4>
                    <div className="space-y-2">
                      <button
                        onClick={connect}
                        className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors border border-slate-600/50"
                      >
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">🦊</span>
                        </div>
                        <span className="text-white font-medium">MetaMask</span>
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-4 border-t border-slate-600/50">
                    <p className="text-slate-400 text-sm">
                      New to Ethereum wallets?{' '}
                      <a 
                        href="https://ethereum.org/en/wallets/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Learn More
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Disconnect Button */}
                  <div className="text-center">
                    <Button
                      onClick={disconnect}
                      variant="outline"
                      className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                    >
                      Disconnect Wallet
                    </Button>
                  </div>

                  {/* Wallet Address */}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      Connected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAddress}
                      className="flex items-center gap-2 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      <span className="font-mono text-sm">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </span>
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>

                  {/* Balance */}
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Balance:</span>
                      <span className="text-white font-mono">
                        {balance} ETH
                      </span>
                    </div>
                  </div>

                  {/* Network Info */}
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Network:</span>
                      <div className="flex items-center gap-2">
                        <Network className="w-4 h-4 text-blue-400" />
                        <span className="text-white">{getNetworkName()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chainlink Price Feed Card */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                ETH/USD Price Feed
              </CardTitle>
              <CardDescription className="text-slate-300">
                Live price data from Chainlink oracles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price Display */}
              {priceData ? (
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    ${priceData.price.toFixed(2)}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {priceData.description}
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  No price data available
                </div>
              )}

              {/* Get Price Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleGetPrice}
                  disabled={!isConnected || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Get ETH Price
                </Button>
              </div>

              {/* Error Display */}
              {error && (
                <Alert className="bg-red-500/20 border-red-500/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Network Switch Buttons */}
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={switchToSepolia}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  Sepolia
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={switchToBase}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  Base
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chainlink Extensions Info */}
        <Card className="mt-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Chainlink Extensions</CardTitle>
            <CardDescription className="text-slate-300">
              Extend this dApp with additional Chainlink services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">🎲 VRF (Randomness)</h3>
                <p className="text-slate-300 text-sm mb-3">
                  Generate verifiable random numbers for games, NFTs, and lotteries.
                </p>
                <Button variant="outline" size="sm" className="bg-slate-600 border-slate-500 text-white">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Learn More
                </Button>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">⏰ Automation</h3>
                <p className="text-slate-300 text-sm mb-3">
                  Automate smart contract functions based on time or conditions.
                </p>
                <Button variant="outline" size="sm" className="bg-slate-600 border-slate-500 text-white">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Learn More
                </Button>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">🌉 CCIP (Cross-chain)</h3>
                <p className="text-slate-300 text-sm mb-3">
                  Send messages and tokens across different blockchains securely.
                </p>
                <Button variant="outline" size="sm" className="bg-slate-600 border-slate-500 text-white">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
