# Mono API Troubleshooting Guide

## Common Errors

### Error: "Mono is Live!" is not valid JSON

This error occurs when:
1. **MONO_SECRET_KEY is not set** - The API returns a health check message
2. **Wrong API endpoint** - The endpoint might be incorrect
3. **Invalid API key format** - The key might be malformed

### Solutions

#### 1. Check Environment Variables

Make sure `MONO_SECRET_KEY` is set in your `.env.local`:

```env
MONO_SECRET_KEY=test_xxxxxxxxxxxxx  # For sandbox
# or
MONO_SECRET_KEY=live_xxxxxxxxxxxxx   # For production
```

#### 2. Verify API Key Format

Mono API keys should:
- Start with `test_` for sandbox or `live_` for production
- Be at least 20 characters long
- Be obtained from [Mono Dashboard](https://app.withmono.com)

#### 3. Check API Endpoint

The correct endpoint is:
- **Sandbox**: `https://api.withmono.com`
- **Production**: `https://api.withmono.com` (same)

#### 4. Test API Key

You can test your API key by making a simple request:

```bash
curl -X POST https://api.withmono.com/v1/account/auth \
  -H "mono-sec-key: YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "success", "success_url": "https://example.com/callback"}'
```

If you get "Mono is Live!" or similar, your API key is likely invalid or not set.

## Getting Mono API Keys

1. **Sign up**: Go to [https://mono.co](https://mono.co) and create an account
2. **Create App**: In the dashboard, create a new application
3. **Get Keys**: Copy your Secret Key from the app settings
4. **Add to .env.local**: Add `MONO_SECRET_KEY=your_key_here`

## API Response Format

### Success Response
```json
{
  "code": "abc123xyz",
  "status": "success"
}
```

### Error Response
```json
{
  "message": "Invalid API key",
  "status": "error"
}
```

## Debugging Steps

1. **Check console logs** - Look for the actual response from Mono API
2. **Verify environment variables** - Make sure they're loaded correctly
3. **Test API key** - Use curl or Postman to test directly
4. **Check Mono dashboard** - Verify your app is active
5. **Review Mono docs** - Check [Mono Documentation](https://docs.mono.co) for updates

## Common Issues

### Issue: "MONO_SECRET_KEY is not configured"
**Solution**: Add the key to `.env.local` and restart your dev server

### Issue: "Invalid response from Mono API"
**Solution**: Check that your API key is correct and your app is active in Mono dashboard

### Issue: "Mono API did not return a code"
**Solution**: Verify the request format matches Mono's current API specification

## Support

- [Mono Documentation](https://docs.mono.co)
- [Mono Support](https://mono.co/support)
- [Mono Status](https://status.mono.co)

