/**
 * Binance API integration
 * Handles fetching balances and trades from Binance exchange
 */

import { decrypt } from "../encryption";

const BINANCE_API_URL = "https://api.binance.com";

export async function validateBinanceCredentials(apiKey, apiSecret) {
  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = await generateSignature(apiSecret, queryString);

    const response = await fetch(
      `${BINANCE_API_URL}/api/v3/account?${queryString}&signature=${signature}`,
      {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Binance validation error:", error);
    return false;
  }
}

export async function getBinanceBalances(apiKey, apiSecret) {
  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = await generateSignature(apiSecret, queryString);

    const response = await fetch(
      `${BINANCE_API_URL}/api/v3/account?${queryString}&signature=${signature}`,
      {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter out zero balances and format
    return data.balances
      .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map((balance) => ({
        symbol: balance.asset,
        free: parseFloat(balance.free),
        locked: parseFloat(balance.locked),
        total: parseFloat(balance.free) + parseFloat(balance.locked),
      }));
  } catch (error) {
    console.error("Error fetching Binance balances:", error);
    throw error;
  }
}

export async function getBinanceTrades(apiKey, apiSecret, symbol, limit = 500) {
  try {
    const timestamp = Date.now();
    const queryString = `symbol=${symbol}&limit=${limit}&timestamp=${timestamp}`;
    const signature = await generateSignature(apiSecret, queryString);

    const response = await fetch(
      `${BINANCE_API_URL}/api/v3/myTrades?${queryString}&signature=${signature}`,
      {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const trades = await response.json();
    
    return trades.map((trade) => ({
      id: trade.id,
      symbol: trade.symbol,
      type: trade.isBuyer ? "BUY" : "SELL",
      amount: parseFloat(trade.qty),
      price: parseFloat(trade.price),
      totalValue: parseFloat(trade.quoteQty),
      fee: parseFloat(trade.commission),
      feeToken: trade.commissionAsset,
      timestamp: new Date(trade.time),
      exchangeTxId: trade.id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching Binance trades:", error);
    throw error;
  }
}

// Helper function to generate HMAC SHA256 signature
// Note: This uses Node.js crypto module. For Edge runtime, you may need to use Web Crypto API
async function generateSignature(secret, queryString) {
  // Try to use Node.js crypto if available (server-side)
  if (typeof require !== 'undefined') {
    try {
      const crypto = require('crypto');
      return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
    } catch (e) {
      // Fall through to Web Crypto API
    }
  }
  
  // Fallback to Web Crypto API (for Edge runtime)
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const message = encoder.encode(queryString);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, message);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  return hashHex;
}

