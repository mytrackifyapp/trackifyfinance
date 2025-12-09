# Bank Connection Setup Guide

This guide will help you set up Plaid bank connections for your Trackify Finance app.

## Overview

The bank connection feature allows users to:
- Connect their bank accounts securely via Plaid
- Automatically sync transactions and balances
- View bank-connected accounts with sync status
- Manually sync or disconnect bank accounts

## Prerequisites

1. **Plaid Account**: Sign up at [https://dashboard.plaid.com/signup](https://dashboard.plaid.com/signup)
2. **Plaid API Keys**: Get your Client ID and Secret from the Plaid Dashboard

## Environment Variables

Add these to your `.env.local` file:

```env
# Plaid Configuration
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret_key
PLAID_ENV=sandbox  # Use 'sandbox' for development, 'production' for production

# Plaid Encryption Key (generate a random 32+ character string)
PLAID_ENCRYPTION_KEY=your_random_32_character_encryption_key_here

# App URL (for webhooks)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change for production
```

### Generating Encryption Key

Generate a secure random key for encrypting Plaid access tokens:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

## Database Migration

Run the migration to add Plaid fields to the Account model:

```bash
npx prisma migrate dev --name add_plaid_bank_connection
```

## Plaid Dashboard Setup

1. **Create an Application**:
   - Go to [Plaid Dashboard](https://dashboard.plaid.com)
   - Create a new application
   - Note your Client ID and Secret

2. **Configure Products**:
   - Enable "Transactions" product
   - Enable "Auth" product (optional, for account verification)

3. **Set Webhook URL** (for production):
   - In Plaid Dashboard → Settings → Webhooks
   - Add: `https://yourdomain.com/api/plaid/webhook`

4. **Sandbox Testing**:
   - Use Plaid's test credentials:
     - Username: `user_good`
     - Password: `pass_good`
   - Or use institution-specific test credentials from Plaid docs

## Features Implemented

### 1. Bank Connection Flow
- Users can click "Connect Bank Account" when adding an account
- Plaid Link opens in a secure modal
- After connection, accounts are automatically created
- Transactions are synced automatically

### 2. Account Management
- Bank-connected accounts show a "Bank" badge
- Display institution name and last sync time
- Show sync errors if connection fails

### 3. Manual Sync
- Users can manually sync accounts via dropdown menu
- Syncs transactions from the last 90 days
- Updates account balance

### 4. Disconnect
- Users can disconnect bank accounts
- Transactions remain, but auto-sync stops
- Account becomes a manual account

## API Routes

### `/api/plaid/create-link-token`
- Creates a Plaid Link token for the connection flow
- Requires authentication
- Returns link token and expiration

### `/api/plaid/exchange-public-token`
- Exchanges public token for access token
- Creates accounts in database
- Encrypts and stores access token

### `/api/plaid/webhook`
- Handles Plaid webhooks for transaction updates
- Automatically syncs new transactions
- Updates account balances

## Server Actions

### `syncPlaidAccount(accountId)`
- Manually sync transactions for a bank-connected account
- Returns count of new transactions created

### `disconnectPlaidAccount(accountId)`
- Disconnects a bank account
- Removes Plaid connection data
- Keeps account and transactions

## Security

- **Access Tokens**: Encrypted using AES-256-GCM before storage
- **Encryption Key**: Stored in environment variable
- **Webhooks**: Verify webhook authenticity (add verification in production)
- **Data**: Bank credentials never stored, only access tokens

## Testing

### Sandbox Mode
1. Use Plaid sandbox credentials
2. Test with various institutions
3. Test error scenarios (invalid credentials, etc.)

### Production Checklist
- [ ] Switch `PLAID_ENV` to `production`
- [ ] Update webhook URL in Plaid Dashboard
- [ ] Test with real bank accounts
- [ ] Monitor webhook delivery
- [ ] Set up error alerting

## Troubleshooting

### Link Token Creation Fails
- Check `PLAID_CLIENT_ID` and `PLAID_SECRET` are correct
- Verify Plaid environment matches your keys
- Check Plaid Dashboard for API status

### Connection Fails
- Verify institution is supported by Plaid
- Check user's bank credentials
- Review Plaid error messages in console

### Transactions Not Syncing
- Check webhook URL is accessible
- Verify webhook is configured in Plaid Dashboard
- Check `lastSyncedAt` timestamp
- Review sync errors in account card

### Encryption Errors
- Verify `PLAID_ENCRYPTION_KEY` is set
- Ensure key is at least 32 characters
- Don't change key after accounts are connected (will break decryption)

## Support

- [Plaid Documentation](https://plaid.com/docs/)
- [Plaid Support](https://support.plaid.com/)
- [Plaid Status](https://status.plaid.com/)

## Next Steps

1. Complete database migration
2. Add environment variables
3. Test in sandbox mode
4. Configure production webhooks
5. Monitor sync performance

