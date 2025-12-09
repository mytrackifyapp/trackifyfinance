# Mono Integration Setup Guide

This guide explains how to set up Mono API for Nigerian bank connections in Trackify Finance.

## Overview

Mono is a Nigerian fintech API that allows users to connect their Nigerian bank accounts. It's integrated alongside Plaid to provide:
- **Plaid**: For international users (US, Canada, UK, etc.)
- **Mono**: For Nigerian users

## Prerequisites

1. **Mono Account**: Sign up at [https://mono.co](https://mono.co)
2. **Mono API Keys**: Get your Secret Key from the Mono Dashboard

## Environment Variables

Add these to your `.env.local` file:

```env
# Mono Configuration
MONO_PUBLIC_KEY=test_pk_xxxxxxxxxxxxx  # Public key for widget (starts with test_pk_ for sandbox)
MONO_SECRET_KEY=test_sk_xxxxxxxxxxxxx  # Secret key for API calls (starts with test_sk_ for sandbox)
MONO_API_URL=https://api.withmono.com  # Optional, defaults to this

# Existing Plaid config
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
PLAID_ENCRYPTION_KEY=your_encryption_key
```

## Getting Mono API Keys

1. **Sign up for Mono**:
   - Go to [https://mono.co](https://mono.co)
   - Create an account
   - Complete verification

2. **Get API Keys**:
   - Navigate to Dashboard → API Keys
   - Copy your Secret Key (starts with `test_` for sandbox, `live_` for production)

3. **Configure Webhook** (for production):
   - In Mono Dashboard → Settings → Webhooks
   - Add: `https://yourdomain.com/api/bank-providers/mono/webhook`

## Database Migration

Run the migration to add provider fields:

```bash
npx prisma migrate deploy
```

This adds:
- `bankProvider` - Stores 'PLAID' or 'MONO'
- `providerAccountId` - Mono-specific account ID
- `providerItemId` - Mono connection ID

## How It Works

### 1. User Flow

1. User clicks "Connect Bank Account"
2. System detects country (or user selects provider)
3. For Nigeria: Shows Mono option (recommended)
4. For others: Shows Plaid option (recommended)
5. User can manually switch providers

### 2. Mono Connection Process

1. **Create Link Token**: 
   - API: `POST /api/bank-providers/mono/create-link-token`
   - Returns a `code` for Mono widget

2. **Open Mono Widget**:
   - User is redirected to `https://connect.withmono.com/?code={code}`
   - User selects bank and authenticates

3. **Callback**:
   - Mono redirects to `/api/bank-providers/mono/callback?code={code}`
   - This redirects to exchange endpoint

4. **Exchange Code**:
   - API: `POST /api/bank-providers/mono/exchange-code`
   - Exchanges code for account access
   - Creates accounts in database

### 3. Transaction Syncing

- Uses same `syncPlaidAccount()` function (works for both providers)
- Automatically detects provider and uses correct API
- Syncs transactions from last 90 days

## Supported Nigerian Banks

Mono supports major Nigerian banks including:
- Access Bank
- GTBank
- First Bank
- UBA
- Zenith Bank
- Fidelity Bank
- And many more...

## Testing

### Sandbox Mode

1. Use Mono test credentials
2. Test with various Nigerian banks
3. Verify transaction syncing

### Production Checklist

- [ ] Switch to production Mono API key
- [ ] Configure webhook URL
- [ ] Test with real bank accounts
- [ ] Monitor connection success rate
- [ ] Set up error alerting

## API Endpoints

### Create Link Token
```
POST /api/bank-providers/mono/create-link-token
Body: { context: "PERSONAL" | "COMPANY" }
Returns: { link_token: string, expiration: string }
```

### Exchange Code
```
POST /api/bank-providers/mono/exchange-code
Body: { 
  code: string,
  institution_id?: string,
  institution_name?: string,
  context: "PERSONAL" | "COMPANY"
}
Returns: { success: true, accounts: Array, item_id: string }
```

### Callback (Internal)
```
GET /api/bank-providers/mono/callback?code={code}&context={context}
Redirects to exchange endpoint
```

## Provider Selection Logic

The system automatically recommends providers based on:
- **Nigeria**: Mono (recommended)
- **Other countries**: Plaid (recommended)

Users can manually switch providers if needed.

## Troubleshooting

### "MONO_SECRET_KEY is not configured"
- Add `MONO_SECRET_KEY` to `.env.local`
- Restart your dev server

### Connection Fails
- Verify Mono API key is correct
- Check if bank is supported by Mono
- Review Mono dashboard for API status

### Transactions Not Syncing
- Check account `bankProvider` field is set to 'MONO'
- Verify `providerAccountId` is set
- Check `lastSyncedAt` timestamp
- Review sync errors in account card

### Widget Not Opening
- Verify `MONO_API_URL` is correct
- Check network connectivity
- Ensure code is valid (not expired)

## Security

- **Access Tokens**: Encrypted using same encryption as Plaid
- **API Keys**: Stored in environment variables
- **Data**: Bank credentials never stored
- **Compliance**: Mono is CBN-licensed and compliant

## Support

- [Mono Documentation](https://docs.mono.co)
- [Mono Support](https://mono.co/support)
- [Mono Status](https://status.mono.co)

## Next Steps

1. Add `MONO_SECRET_KEY` to environment variables
2. Test connection in sandbox mode
3. Configure production webhook
4. Monitor connection success rates
5. Add more providers as needed (Okra, OnePipe, etc.)

