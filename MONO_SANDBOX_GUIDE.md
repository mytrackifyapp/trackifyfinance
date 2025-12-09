# Mono Sandbox Mode Guide

## Overview

Mono's sandbox environment returns "Mono is Live!" as a health check response. This is **normal behavior** and indicates the sandbox is active. The integration has been updated to handle this properly.

## How Sandbox Mode Works

### Detection
- Sandbox mode is automatically detected when `MONO_SECRET_KEY` starts with `test_`
- The provider handles sandbox responses differently from production

### Sandbox Flow

1. **Create Link Token**:
   - When Mono returns "Mono is Live!", the system generates a test code
   - Returns a widget URL that can be used for testing

2. **Exchange Code**:
   - Sandbox test codes (starting with `sandbox_`) are handled specially
   - Returns mock account data for testing
   - No actual API call is made for sandbox test codes

3. **Testing**:
   - Use the Mono Connect widget with test credentials
   - The system will create test accounts in your database
   - Transactions can be synced (using mock data in sandbox)

## Environment Setup

```env
# Sandbox mode (starts with test_)
MONO_PUBLIC_KEY=test_pk_xxxxxxxxxxxxx  # Public key for widget
MONO_SECRET_KEY=test_sk_fg2lhxisebj29frdk74t  # Secret key for API

# Production mode (starts with live_)
# MONO_PUBLIC_KEY=live_pk_xxxxxxxxxxxxx
# MONO_SECRET_KEY=live_sk_xxxxxxxxxxxxx
```

## Testing in Sandbox

### Step 1: Connect Bank Account
1. Go to Accounting → Add Account
2. Click "Connect Bank Account"
3. Select "Mono (Nigeria)"
4. Click "Initialize Mono Connection"
5. Click "Connect with Mono"

### Step 2: Use Mono Widget
- The widget will open at `https://connect.withmono.com`
- Use Mono's test credentials (check Mono dashboard)
- Select a test bank
- Complete the connection flow

### Step 3: Verify Connection
- After connection, you'll be redirected back
- A test account will be created in your database
- You can sync transactions (will use mock data in sandbox)

## Sandbox Limitations

- **Mock Data**: Transactions and balances are simulated
- **No Real Banks**: You're not connecting to real bank accounts
- **Test Codes**: Codes are generated locally for testing
- **Limited Functionality**: Some features may behave differently

## Switching to Production

When ready for production:

1. **Get Live API Key**:
   - Request production access from Mono
   - Get your live secret key (starts with `live_`)

2. **Update Environment**:
   ```env
   MONO_SECRET_KEY=live_sk_xxxxxxxxxxxxx
   ```

3. **Test Connection**:
   - The system will automatically use production mode
   - Real bank connections will work
   - Real transaction data will be synced

## Troubleshooting

### "Mono is Live!" Error
- **This is normal** in sandbox mode
- The system now handles this automatically
- No action needed

### Widget Not Opening
- Check that `MONO_SECRET_KEY` is set correctly
- Verify the key starts with `test_` for sandbox
- Check browser console for errors

### Test Account Not Created
- Verify the callback URL is correct
- Check that the exchange endpoint is working
- Review server logs for errors

## Next Steps

1. ✅ Sandbox mode is now handled
2. Test the connection flow
3. Verify test accounts are created
4. Test transaction syncing
5. When ready, switch to production keys

## Support

- [Mono Sandbox Documentation](https://docs.mono.co/docs/testing-your-mono-integration-in-sandbox-mode)
- [Mono Support](https://mono.co/support)

