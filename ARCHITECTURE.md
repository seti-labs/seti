# 🏗️ Seti Architecture

## System Overview

Seti is a decentralized prediction market platform built on Base Sepolia with a Web2.5 architecture combining fast backend queries with blockchain settlement.

---

## Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS + shadcn/ui
- **State Management:** React Context API
- **Routing:** React Router v6

### Blockchain
- **Network:** Base Sepolia (EVM-compatible)
- **Wallet Integration:** wagmi v2 + @coinbase/onchainkit
- **Smart Contract:** Solidity (Prediction Market)
- **Currency:** USDC (6 decimals)

### Backend
- **API:** Python Flask (REST)
- **Database:** PostgreSQL (Supabase)
- **Hosting:** Render.com
- **URL:** https://seti-backend.onrender.com/api/v1

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Layer   │  │  State Mgmt  │  │   Services   │      │
│  │  Components  │←→│   Contexts   │←→│   Hooks      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↓                 ↓                   ↓              │
└─────────┼─────────────────┼───────────────────┼─────────────┘
          │                 │                   │
          ↓                 ↓                   ↓
┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐
│   Wallet (EVM)  │  │   Backend    │  │  Smart Contract  │
│   - MetaMask    │  │   Flask API  │  │  Base Sepolia    │
│   - Coinbase    │  │  PostgreSQL  │  │  Solidity        │
└─────────────────┘  └──────────────┘  └──────────────────┘
         ↓                   ↓                    ↓
         └───────────────────┴────────────────────┘
                             ↓
                    ┌────────────────┐
                    │   Blockchain   │
                    │  Base Sepolia  │
                    └────────────────┘
```

---

## Data Flow

### Prediction Placement Flow

```
User Action (Click YES/NO)
  ↓
MarketDetailsSidebar
  ↓
PredictionModalContext.openModal()
  ↓
SharedPredictionModal (validates input)
  ↓
useContract.placeBet()
  ↓
wagmi.writeContract() → MetaMask Popup
  ↓
User Signs Transaction
  ↓
Smart Contract Execution
  ↓
Transaction Confirmed
  ↓
Backend Sync + Local State Update
  ↓
Notification + Receipt Shown
```

### Balance Reading Flow

```
Wallet Connection
  ↓
useWalletBalance (wagmi)
  ↓
Read USDC/ETH from blockchain
  ↓
Sync to Backend Database
  ↓
useWalletConnection displays backend balance
  ↓
Header shows balance
```

---

## Component Architecture

### Core Layout
```
App.tsx
└── Layout
    ├── Header (wallet, balance, theme toggle)
    ├── Main Content (router)
    │   ├── Index (markets grid)
    │   ├── Dashboard (user stats)
    │   ├── Activity (predictions)
    │   ├── Profile (settings)
    │   └── Notifications
    └── Footer
```

### Context Providers (Nested)
```
ThemeProvider
└── GeographicalRestrictionProvider
    └── WalletModalProvider
        └── PredictionModalProvider
            └── MarketSidebarProvider
                └── NotificationProvider
                    └── ConfirmationProvider
                        └── App Content
```

### Modal System
```
├── WalletModal (wallet connection)
├── PredictionModal (standalone)
├── SharedPredictionModal (shared flow)
├── CreateMarketModal (admin only)
├── PredictionReceiptModal (confirmation)
├── GeographicalRestrictionModal (compliance)
└── ConfirmationModal (notifications)
```

---

## State Management

### Global Contexts

1. **ThemeContext**
   - Light/Dark mode
   - Persists to localStorage
   - Syncs with backend preferences

2. **WalletModalContext**
   - Wallet connection modal state
   - Opens from multiple components

3. **PredictionModalContext**
   - Prediction modal state
   - Receipt handling
   - Shared across app

4. **MarketSidebarContext**
   - Market details sidebar
   - Selected market state

5. **NotificationContext**
   - Notification queue
   - Backend sync
   - localStorage persistence

6. **GeographicalRestrictionContext**
   - Compliance modal
   - User acceptance state

---

## Custom Hooks

### Wallet Hooks
- `useWalletConnection` - Connection state + backend balance
- `useWalletBalance` - On-chain balance reading
- `useWalletModal` - Modal control

### Contract Hooks
- `useContract` - Smart contract interactions
- `usePrediction` - Prediction placement
- `useCreateMarket` - Market creation
- `useMarketResolution` - Market resolution
- `useLiquidity` - Liquidity management

### Data Hooks
- `useMarkets` - Fetch markets from backend
- `useUserPredictions` - User's predictions
- `useFavoritesBackend` - Favorites system
- `useUserPreferences` - User settings

### UI Hooks
- `usePredictionModal` - Modal state
- `useCountdown` - Timer display
- `useScrollLock` - Prevent body scroll
- `useMarketPrices` - Price calculations

---

## Services Layer

### API Service (`services/api.ts`)
- **Markets API** - CRUD operations
- **Users API** - Balance, preferences, notifications
- **Predictions API** - Tracking and history
- **Analytics API** - Stats and insights
- **Favorites API** - User favorites
- **Comments API** - Market discussions

### Contract Service (`services/contract.ts`)
- Wallet balance reading
- USDC token integration
- Transaction tracking

---

## Security Architecture

### Input Validation
**File:** `utils/security.ts`
- Address validation
- Amount validation
- String sanitization
- XSS prevention

### Error Boundaries
- `ErrorBoundary` - Page-level errors
- `ModalErrorBoundary` - Modal-specific errors

### Rate Limiting
- Client-side rate limiting (100 req/min)
- Backend API rate limiting

---

## Performance Optimizations

### Code Splitting
- Lazy loading for routes
- Dynamic imports for heavy components

### Memoization
- `React.memo` on heavy components (Header, MarketCard)
- `useCallback` for stable functions
- `useMemo` for expensive calculations

### Caching
- React Query for API caching
- localStorage for user preferences
- sessionStorage for sync tracking

---

## Build & Deployment

### Development
```bash
npm run dev     # Start dev server
npm run build   # Production build
npm run preview # Preview production build
```

### Production
```bash
npm run build
vercel --prod
```

### Environment
- **Dev:** Vite dev server (HMR enabled)
- **Prod:** Static build deployed to Vercel

---

## File Structure

```
seti/
├── src/
│   ├── components/       # React components
│   ├── contexts/         # Global state
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Route pages
│   ├── services/         # API & contract services
│   ├── utils/            # Utilities
│   ├── types/            # TypeScript types
│   ├── config/           # Configuration
│   └── lib/              # Shared libraries
├── public/               # Static assets
├── contracts/            # Smart contracts
└── api/                  # API routes (frames/og)
```

---

## Key Design Decisions

### 1. Backend Balance Priority
App displays backend balance (what's saved in the app) instead of on-chain balance for UX consistency.

### 2. wagmi for Wallet
Using wagmi v2 provides best-in-class wallet integration with auto-reconnect and state management.

### 3. Context over Redux
React Context API sufficient for app size, avoiding Redux complexity.

### 4. shadcn/ui Components
Accessible, customizable components with Radix primitives.

### 5. TypeScript Strict Mode
Full type safety throughout the codebase.

---

## Integration Points

### External Services
- **Blockchain:** Base Sepolia (EVM)
- **Backend API:** Flask REST API
- **Wallet:** EVM-compatible wallets
- **Storage:** localStorage + PostgreSQL

### Internal Systems
- **State:** React Context
- **Data Fetching:** React Query
- **Routing:** React Router
- **Styling:** Tailwind + CSS

---

## Monitoring & Analytics

### User Actions Tracked
- Wallet connections
- Predictions placed
- Markets created
- Favorites added
- Theme changes

### Error Tracking
- Component errors (Error Boundaries)
- API errors (Console + Backend)
- Transaction errors (wagmi)

---

## Future Enhancements

### Planned Features
- Real-time price updates (WebSocket)
- Advanced analytics dashboard
- Social features (comments, sharing)
- Mobile app (React Native)
- Multi-chain support

### Technical Debt
- Migrate from ETH to native USDC in contract
- Add Sentry for error tracking
- Implement comprehensive testing
- Add i18n for internationalization

---

## Developer Guide

### Adding a New Feature

1. **Create components** in `src/components/`
2. **Add hooks** in `src/hooks/`
3. **Update contexts** if needed in `src/contexts/`
4. **Add API calls** in `src/services/api.ts`
5. **Add routes** in `src/App.tsx`
6. **Test** thoroughly
7. **Update this doc** with changes

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Component names: PascalCase
- Hooks: useCamelCase
- Files: kebab-case

---

## Support

For issues or questions, refer to:
- **Integration:** `INTEGRATION.md`
- **Architecture:** This file
- **README:** `README.md`

