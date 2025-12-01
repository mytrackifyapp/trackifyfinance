# Crypto Portfolio Tracking - Setup Guide

## Overview
This guide explains how to set up and use the Crypto Portfolio & Trade Tracking system in Trackify Finance.

## Prerequisites
- PostgreSQL database
- Node.js and pnpm installed
- Environment variables configured

## Database Migration

1. **Run the Prisma migration:**
   ```bash
   npx prisma migrate dev --name add_crypto_models
   ```

2. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

## Environment Variables

Add the following to your `.env` file:

```env
# Encryption key for API credentials (generate a secure random string)
ENCRYPTION_KEY=your-secure-encryption-key-here

# Optional: Etherscan API key for Ethereum blockchain data
ETHERSCAN_API_KEY=your-etherscan-api-key

# Optional: CoinGecko API key (free tier available)
COINGECKO_API_KEY=your-coingecko-api-key
```

### Generating Encryption Key
```bash
# Generate a secure random key
openssl rand -base64 32
```

## Features

### 1. Wallet Management
- **Manual Wallets**: Enter balances manually
- **Blockchain Wallets**: Auto-sync from public addresses (Ethereum, Bitcoin, Solana)
- **Exchange Wallets**: Connect Binance or Coinbase via API keys

### 2. Portfolio Dashboard
- Total portfolio value
- P&L analytics (24h, 7d, 30d)
- Real-time price updates
- Token allocation charts
- Portfolio value history

### 3. Transaction Tracking
- Support for: Buy, Sell, Swap, Transfer, Staking, Fees
- Manual entry
- Auto-sync from exchanges
- Transaction history with filters
- Export capabilities

### 4. Analytics
- Average cost basis per asset
- Unrealized & Realized P&L
- Token allocation
- Risk exposure
- Gain/loss charts

## Usage

### Adding a Wallet

1. Navigate to **Crypto → Wallets**
2. Click **Add Wallet**
3. Choose wallet type:
   - **Manual**: Enter balances manually
   - **Blockchain**: Provide address and network
   - **Exchange**: Enter API credentials

### Adding a Transaction

1. Navigate to **Crypto → Trades**
2. Click **Add Transaction**
3. Fill in transaction details
4. Save

### Viewing Portfolio

1. Navigate to **Crypto** dashboard
2. View overview cards, charts, and recent transactions
3. Click on any token to see detailed information

## API Integrations

### Binance
1. Create API key in Binance account settings
2. Enable "Read" permissions only
3. Add API key and secret when creating wallet

### Coinbase
1. Create API key in Coinbase account settings
2. Enable "View" permissions only
3. Add API key, secret, and passphrase when creating wallet

### Blockchain Addresses
- **Ethereum**: Enter Ethereum address (0x...)
- **Bitcoin**: Enter Bitcoin address
- **Solana**: Enter Solana address

## Background Jobs

The system includes an Inngest function that automatically syncs all wallets every 15 minutes. This:
- Fetches latest balances from exchanges
- Updates blockchain wallet balances
- Syncs recent transactions
- Updates token prices

## Security

- API keys are encrypted at rest using the `ENCRYPTION_KEY`
- Only read permissions are required for exchange APIs
- All database queries are scoped to the authenticated user
- Input validation on all forms

## Troubleshooting

### Wallet Sync Fails
- Check API credentials are correct
- Verify API keys have read permissions
- Check network connectivity
- Review error message in wallet details

### Prices Not Updating
- CoinGecko API may be rate-limited
- Check API key is valid
- Prices are cached for 1 minute

### Missing Transactions
- Some exchanges require additional permissions
- Blockchain transactions may take time to appear
- Manual entry is always available

## Future Enhancements

- Additional exchange integrations (Kraken, Gemini, etc.)
- More blockchain networks (Polygon, BSC, etc.)
- Tax reporting features
- Advanced analytics and insights
- Mobile app support

