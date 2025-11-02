# 🔄 Seti Workflow Analysis

## Current Architecture Overview

### 🏗️ **Backend (Flask + PostgreSQL)**
```
┌─────────────────────────────────────────────────────────────┐
│                    SETI BACKEND                             │
├─────────────────────────────────────────────────────────────┤
│  Flask App (run.py)                                        │
│  ├── API Endpoints (/api/v1/*)                             │
│  │   ├── /markets     - Market data & sync                 │
│  │   ├── /predictions - User predictions                   │
│  │   ├── /users       - User profiles & stats              │
│  │   ├── /analytics   - Platform analytics                 │
│  │   └── /comments    - Market comments                    │
│  │                                                         │
│  ├── Models (SQLAlchemy)                                   │
│  │   ├── Market      - Market data cache                   │
│  │   ├── Prediction  - User predictions                    │
│  │   ├── User        - User profiles                       │
│  │   ├── Comment     - Market comments                     │
│  │   └── Liquidity   - Liquidity providers                 │
│  │                                                         │
│  └── Services                                            │
│      ├── SuiService  - Sui blockchain interaction          │
│      └── SupabaseService - Additional data layer          │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 **Frontend (React + Vite + Sui)**
```
┌─────────────────────────────────────────────────────────────┐
│                    SETI FRONTEND                            │
├─────────────────────────────────────────────────────────────┤
│  React App (App.tsx)                                       │
│  ├── SuiClientProvider - Sui wallet connection             │
│  ├── WalletProvider    - Wallet management                 │
│  ├── Pages:                                               │
│  │   ├── Index        - Landing page                      │
│  │   ├── Dashboard    - User dashboard                    │
│  │   ├── Activity     - User activity                    │
│  │   ├── Profile      - User profile                     │
│  │   └── PredictionDetails - Market details              │
│  │                                                         │
│  ├── Services:                                            │
│  │   └── api.ts       - Backend API client               │
│  │                                                         │
│  └── Hooks:                                               │
│      └── useMarkets.ts - Market data fetching             │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Current Data Flow

### 1. **Market Creation Flow**
```
User → Frontend → Sui Blockchain → Backend Sync → Database
  │       │            │              │            │
  │       │            │              │            └── Cache in PostgreSQL
  │       │            │              └── SuiService.fetch_all_markets()
  │       │            └── Smart Contract Execution
  │       └── Wallet Transaction
  └── Create Market Form
```

### 2. **Prediction Flow**
```
User → Frontend → Sui Blockchain → Backend Sync → Database
  │       │            │              │            │
  │       │            │              │            └── Store prediction record
  │       │            │              └── syncTransactionToBackend()
  │       │            └── Trade Execution
  │       └── Prediction Button
  └── Select Outcome + Amount
```

### 3. **Data Fetching Flow**
```
Frontend → Backend API → Database → Response
    │           │           │          │
    │           │           │          └── JSON response
    │           │           └── SQLAlchemy query
    │           └── Flask route handler
    └── useMarkets() hook
```

## 🔧 Current Technology Stack

### **Backend Stack**
- **Framework**: Flask (Python)
- **Database**: PostgreSQL + SQLAlchemy
- **Blockchain**: Sui (via JSON-RPC)
- **Caching**: Flask-Caching
- **API**: REST endpoints

### **Frontend Stack**
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Wallet**: @mysten/dapp-kit (Sui only)
- **State**: React Query + Context

## 🎯 Integration Points for Multi-Wallet + Oracle

### **1. Wallet Integration Points**
```typescript
// Current: Sui-only
<SuiClientProvider>
  <WalletProvider>
    // App components
  </WalletProvider>
</SuiClientProvider>

// Target: Multi-wallet
<MultiWalletProvider>
  <BaseWalletProvider>
  <SuiWalletProvider>
  <EthereumWalletProvider>
  <SolanaWalletProvider>
    // App components
  </MultiWalletProvider>
```

### **2. Backend Service Integration**
```python
# Current: SuiService only
class SuiService:
    def get_market(self, market_id: str):
        # Sui blockchain calls

# Target: Multi-chain service
class BlockchainService:
    def get_market(self, market_id: str, chain: str):
        if chain == 'sui':
            return self.sui_service.get_market(market_id)
        elif chain == 'base':
            return self.base_service.get_market(market_id)
        # ... other chains
```

### **3. Oracle Integration Points**
```python
# Current: Database queries
@bp.route('/markets', methods=['GET'])
def get_markets():
    markets = Market.query.filter(...).all()
    return jsonify({'markets': markets})

# Target: Oracle + Database hybrid
@bp.route('/markets', methods=['GET'])
def get_markets():
    # Try oracle first
    oracle_markets = oracle_service.get_markets()
    if oracle_markets:
        return jsonify({'markets': oracle_markets})
    
    # Fallback to database
    markets = Market.query.filter(...).all()
    return jsonify({'markets': markets})
```

## 🚀 Migration Strategy

### **Phase 1: Multi-Wallet Foundation**
1. **Frontend**: Add multi-wallet providers
2. **Backend**: Create blockchain service abstraction
3. **Database**: Add chain_id to existing models

### **Phase 2: Oracle Integration**
1. **Backend**: Integrate Chainlink oracles
2. **API**: Add oracle-first data fetching
3. **Caching**: Implement oracle data caching

### **Phase 3: Cross-Chain Markets**
1. **Smart Contracts**: Deploy on Base, Ethereum
2. **Frontend**: Chain selection UI
3. **Backend**: Multi-chain market sync

## 🔍 Key Files to Modify

### **Backend Files**
- `app/services/sui_service.py` → `app/services/blockchain_service.py`
- `app/models/market.py` → Add `chain_id` field
- `app/api/markets.py` → Add oracle integration
- `requirements.txt` → Add oracle dependencies

### **Frontend Files**
- `src/App.tsx` → Multi-wallet providers
- `src/services/api.ts` → Multi-chain API calls
- `src/hooks/useMarkets.ts` → Chain-aware data fetching
- `package.json` → Add wallet libraries

## 📊 Current Limitations

1. **Single Chain**: Only Sui blockchain support
2. **Single Wallet**: Only Sui wallet integration
3. **Database Dependent**: No oracle integration
4. **Limited Scalability**: No cross-chain markets

## 🎯 Next Steps

1. **Analyze current workflow** ✅
2. **Create multi-wallet architecture**
3. **Integrate Chainlink oracles**
4. **Implement cross-chain markets**
5. **Add Base blockchain support**
6. **Test and deploy**

---

*This analysis provides the foundation for implementing multi-wallet + oracle architecture while maintaining the existing Seti functionality.*
