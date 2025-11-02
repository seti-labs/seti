import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, ExternalLink, Copy, RefreshCw } from 'lucide-react'
import { CONTRACT_VERIFICATION, verifyContractConnection, getContractInfo } from '@/utils/contractVerification'

export function ContractStatus() {
  const [status, setStatus] = useState<{
    isConnected: boolean
    network: string
    address: string
    error?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const checkConnection = async () => {
    setIsLoading(true)
    try {
      const result = await verifyContractConnection()
      setStatus(result)
    } catch (error) {
      console.error('Failed to verify contract connection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_VERIFICATION.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  const contractInfo = getContractInfo()

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Smart Contract Status</span>
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={isLoading}
            className="ml-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          Verification of deployed smart contract connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contract Address */}
        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
          <div>
            <div className="text-sm font-medium">Contract Address</div>
            <div className="text-xs text-muted-foreground font-mono">
              {CONTRACT_VERIFICATION.address}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="h-8 w-8 p-0"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(CONTRACT_VERIFICATION.explorer, '_blank')}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Network Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Network</span>
          <Badge variant="outline" className="capitalize">
            {CONTRACT_VERIFICATION.network}
          </Badge>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection</span>
          <div className="flex items-center gap-2">
            {status?.isConnected ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">Disconnected</span>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {status?.error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="text-sm text-destructive">{status.error}</div>
          </div>
        )}

        {/* Contract Info */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/20">
          <div>
            <div className="text-xs text-muted-foreground">Functions</div>
            <div className="text-sm font-medium">{contractInfo.functions.length}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Events</div>
            <div className="text-sm font-medium">{contractInfo.events.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
