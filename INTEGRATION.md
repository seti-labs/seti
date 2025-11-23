# 🔌 Seti Integration Guide

## Backend Integration

### API Endpoint
```
Production: https://seti-backend.onrender.com/api/v1
Local Dev: http://localhost:5001/api/v1
```

### Environment Variables
```bash
VITE_API_URL=https://seti-backend.onrender.com/api/v1
VITE_CONTRACT_ADDRESS=0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B
VITE_ADMIN_ADDRESSES=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

---

## Smart Contract Integration

### Contract Details
- **Network:** Base Sepolia Testnet
- **Address:** `0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B`
- **USDC Address:** `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

### Key Functions
- `createMarket(question, description, endTime)` - Create new market
- `placeBet(marketId, outcome, value)` - Place prediction (0=NO, 1=YES)
- `resolveMarket(marketId, winningOutcome)` - Resolve market
- `claimPayout(marketId)` - Claim winnings

---

## Wallet Integration

### Supported Wallets
- MetaMask
- Coinbase Wallet
- WalletConnect
- Brave Wallet
- Any EVM-compatible wallet

### Wallet Provider
Uses `wagmi` v2 with `@coinbase/onchainkit` for seamless wallet integration.

**Configuration:** `seti/src/main.tsx`

---

## API Integration

### Markets API
```typescript
// Get all markets
GET /markets?status=active&per_page=50

// Get market by ID
GET /markets/:id

// Create market (admin only)
POST /markets
```

### Users API
```typescript
// Get user balance
GET /users/:address/balance

// Sync balance from wallet
POST /users/:address/balance

// Get notifications
GET /users/:address/notifications

// Get user preferences
GET /users/:address/preferences
```

### Predictions API
```typescript
// Get user predictions
GET /predictions/:address

// Get prediction by ID
GET /predictions/:id
```

---

## State Management

### React Context Providers
- `ThemeProvider` - Light/Dark mode
- `WalletModalProvider` - Wallet connection state
- `PredictionModalProvider` - Prediction modals
- `MarketSidebarProvider` - Market details
- `NotificationProvider` - Notifications system
- `GeographicalRestrictionProvider` - Compliance

### Usage Example
```typescript
import { useWalletConnection } from '@/hooks/useWalletConnection'
import { usePredictionModalContext } from '@/contexts/PredictionModalContext'

function MyComponent() {
  const { isConnected, address, displayBalance } = useWalletConnection()
  const { openModal } = usePredictionModalContext()
  
  // Place a prediction
  const handlePredict = () => {
    openModal(market, 'YES')
  }
}
```

---

## Deployment

### Build
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel --prod
```

### Environment Setup
Set these in Vercel dashboard:
- `VITE_API_URL`
- `VITE_CONTRACT_ADDRESS`
- `VITE_ADMIN_ADDRESSES`

---

## Security

- Input validation using `SecurityUtils`
- CORS protection
- Rate limiting
- Wallet signature verification
- Error boundaries on critical components


