# Crypto Portfolio & Trade Tracking System - Architecture Plan

## Overview
A comprehensive crypto portfolio tracking system integrated into Trackify Finance, supporting manual wallets, blockchain address tracking, and CEX integrations (Binance, Coinbase).

## Architecture Components

### 1. Database Schema (Prisma)
- **UserCryptoWallet**: Stores wallet/exchange connections
- **UserCryptoAsset**: Tracks token holdings per wallet
- **UserCryptoTransaction**: Records all crypto transactions

### 2. Backend Services
- **Server Actions** (`actions/crypto.js`): CRUD operations for wallets, assets, transactions
- **Crypto Service Layer** (`lib/crypto/`): 
  - Exchange API integrations (Binance, Coinbase)
  - Blockchain data fetching (via public APIs)
  - Price fetching (CoinGecko API)
  - Data synchronization logic

### 3. Background Jobs (Inngest)
- **Sync Portfolio**: Periodic sync of all wallets/exchanges
- **Update Prices**: Cache price data to reduce API calls

### 4. Frontend Pages
- `/dashboard/crypto` - Main portfolio dashboard
- `/dashboard/crypto/wallets` - Wallet management
- `/dashboard/crypto/wallet/[id]` - Individual wallet view
- `/dashboard/crypto/token/[symbol]` - Token detail page
- `/dashboard/crypto/trades` - Transaction history

### 5. UI Components
- Portfolio overview cards
- Allocation charts (donut/pie)
- Price history charts (line)
- Transaction table with filters
- Add wallet modal
- Add trade modal
- Token cards

## Data Flow

1. **User adds wallet** → Server action creates wallet → Triggers initial sync
2. **Periodic sync** → Inngest job → Fetches balances/trades → Updates database
3. **Price updates** → CoinGecko API → Cached prices → Displayed in UI
4. **Manual trades** → User input → Server action → Database update

## Security Considerations
- API keys encrypted at rest
- Rate limiting on external API calls
- Input validation for addresses and amounts
- User isolation (all queries scoped to userId)

## External APIs
- **CoinGecko**: Price data, token metadata
- **Binance API**: Exchange balances, trades
- **Coinbase API**: Exchange balances, trades
- **Blockchain APIs**: Etherscan, Blockchain.info, Solana RPC

## Technology Stack
- Next.js 15 App Router
- Prisma + PostgreSQL
- Inngest for background jobs
- Recharts for visualization
- Shadcn UI components
- Clerk for authentication

