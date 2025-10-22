# seti: Native Prediction Markets

<div align="center">

![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Build](https://img.shields.io/badge/Build-Passing-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Create, trade, and resolve markets on real-world events — secured by the Sui blockchain**

</div>

## 🌟 Overview

Seti is a professional-grade prediction market platform that lets anyone launch a market, add liquidity, and trade YES/NO outcomes with transparent on-chain settlement. Built for speed and usability on Sui, it features real-time pricing, wallet-native flows, and a clean, responsive interface.

> 🚀 **Live Demo**: https://seti-live.vercel.app/

## ✨ Key Features

### 🏪 Marketplace & Discovery
- **Browse live markets** across multiple categories (Crypto, Stocks, Sports, Politics, Tech, and more)
- **Real-time pricing** for YES/NO outcomes with dynamic liquidity
- **Structured analytics**: 24h volume, total liquidity, and performance signals

### 📊 Market Analytics
- **24h volume tracking** and market-level liquidity metrics
- **Performance visualization** to understand price momentum and risk

### 🧰 Market Creation
- **One-click launch** of markets with question, description, end time, category, image, and tags
- **Initial liquidity** supplied in SUI with on-chain settlement

### 💧 Liquidity & Trading
- **Add liquidity** to deepen markets and earn fees
- **Fast trades** with clear pre-trade payout and risk visibility

## 🛠️ Tech Stack

### Frontend & Framework
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### Styling & UI
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge)
![Radix](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge)

### Blockchain & Data
![Sui](https://img.shields.io/badge/Sui-6FBCF0?style=for-the-badge)
![Mysten dapp-kit](https://img.shields.io/badge/@mysten/dapp--kit-0A7AFF?style=for-the-badge)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- A Sui-compatible wallet (Sui Wallet, Suiet)

### Installation
```bash
# Clone repository
git clone https://github.com/Talent-Index/setiMVP.git
cd seti

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Setup
Edit `.env.local`:
```env
VITE_SUI_PACKAGE_ID=0x0
VITE_NETWORK=devnet
VITE_SUI_RPC_URL=https://fullnode.devnet.sui.io:443
```

## 🏗️ Architecture

### Project Structure
```
src/
├── components/           # UI components (shadcn/ui)
├── hooks/               # Blockchain interactions
├── pages/               # Page components  
├── types/               # Type definitions
├── App.tsx              # Main app component
└── main.tsx             # Entry point
contract/
└── sources/polymarket.move  # Move smart contracts
```

### Smart Contract Functions
| Function | Purpose | Parameters |
|----------|---------|------------|
| `create_market` | Initialize new market | question, description, end_time, category, image_url, tags, initial_liquidity |
| `get_market_info` | Retrieve market details | market object reference |
| `place_prediction` | Trade on market outcomes | market_id, outcome, amount |
| `add_liquidity` | Provide market liquidity | market_id, liquidity_amount |
| `resolve_market` | Resolve completed markets | market_id, winning_outcome |
| `withdraw_liquidity` | Remove liquidity | market_id, amount |
| `claim_winnings` | Claim payouts | market_id |

## 📱 User Guide

### Trading Workflow
1. **Connect Wallet** using the header connection
2. **Browse Markets** by category and liquidity
3. **Place Prediction** with YES/NO outcomes
4. **Manage Portfolio** and claim winnings

### Market Creation
1. **Prepare Details**: question, description, end time, category
2. **Set Parameters**: image, tags, initial liquidity
3. **Launch Market**: deploy to Sui blockchain

### Market Categories
| Category | Examples |
|----------|----------|
| **Crypto** | BTC price, L2 adoption |
| **Stocks** | Earnings beats, price targets |
| **Sports** | Match outcomes, standings |
| **Politics** | Election winners, bills passing |
| **Technology** | Feature releases, company metrics |
| **Economics** | GDP, CPI, employment |
| **Space** | Launches, missions |
| **Other** | Culture, entertainment |

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
```

### Environment Variables
**Required:**
```env
VITE_SUI_PACKAGE_ID=0x0
VITE_NETWORK=devnet
```

**Optional:**
```env
VITE_SUI_RPC_URL=https://fullnode.devnet.sui.io:443
VITE_APP_NAME=seti
VITE_APP_VERSION=1.0.0
```

## 🎯 Core Features

### Technical Architecture
- **TypeScript-first** implementation for strong typing
- **Custom React hooks** for blockchain interactions
- **Modular components** with clean separation of concerns
- **Robust error handling** and user-friendly feedback

### Wallet Integration
- **Sui wallet integration** via `@mysten/dapp-kit`
- **Session persistence** and smooth signing flows

### User Experience
- **Modern, responsive UI** powered by Tailwind and shadcn/ui
- **Accessible components** with Radix primitives

## 📸 Platform Preview

### Marketplace Overview
![Marketplace](https://github.com/user-attachments/assets/46e124ae-d73e-4720-a136-0c6457ad4779)

### Market Creation
![Market Creation](https://github.com/user-attachments/assets/ed4053fe-7830-4345-8b88-c3dc583fdb15)

### Trading Interface
![Trading](https://github.com/user-attachments/assets/04def0fe-73c3-4c44-912c-8e0946e4381b)

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/1671f66e-7010-4bce-b8ff-914bb8414d07)

## 👥 Team

| Name | Role | Contact |
|------|------|---------|
| Mary Njoroge | Frontend Developer | marrianapeters00@gmail.com |
| Graham | Full-stack Engineer | graham@gmail.com |
| John Mokaya | Frontend Developer | mokayaj857@gmail.com |
| Peter Njuguna | Smart Contract Developer | peternjuguna@gmail.com |
| Iano | Smart Contract Developer | inc3099@gmail.com |

## 📄 License

MIT — see `LICENSE` for details.

---

<div align="center">

**Built with ❤️ for the Sui ecosystem**

</div>
