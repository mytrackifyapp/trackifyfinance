/**
 * Coinbase API integration
 * Handles fetching balances and trades from Coinbase exchange
 */

import { decrypt } from "../encryption";

const COINBASE_API_URL = "https://api.coinbase.com/v2";

export async function validateCoinbaseCredentials(apiKey, apiSecret, apiPassphrase) {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const method = "GET";
    const path = "/accounts";
    const message = timestamp + method + path;
    
    const signature = await generateSignature(apiSecret, message);
    
    const response = await fetch(`${COINBASE_API_URL}${path}`, {
      method,
      headers: {
        "CB-ACCESS-KEY": apiKey,
        "CB-ACCESS-SIGN": signature,
        "CB-ACCESS-TIMESTAMP": timestamp,
        "CB-ACCESS-PASSPHRASE": apiPassphrase,
        "Content-Type": "application/json",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Coinbase validation error:", error);
    return false;
  }
}

export async function getCoinbaseBalances(apiKey, apiSecret, apiPassphrase) {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const method = "GET";
    const path = "/accounts";
    const message = timestamp + method + path;
    
    const signature = await generateSignature(apiSecret, message);
    
    const response = await fetch(`${COINBASE_API_URL}${path}`, {
      method,
      headers: {
        "CB-ACCESS-KEY": apiKey,
        "CB-ACCESS-SIGN": signature,
        "CB-ACCESS-TIMESTAMP": timestamp,
        "CB-ACCESS-PASSPHRASE": apiPassphrase,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter out zero balances and format
    return data.data
      .filter((account) => parseFloat(account.balance.amount) > 0)
      .map((account) => ({
        symbol: account.balance.currency,
        total: parseFloat(account.balance.amount),
        available: parseFloat(account.balance.amount), // Coinbase doesn't separate locked
      }));
  } catch (error) {
    console.error("Error fetching Coinbase balances:", error);
    throw error;
  }
}

export async function getCoinbaseTrades(apiKey, apiSecret, apiPassphrase, accountId) {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const method = "GET";
    const path = `/accounts/${accountId}/transactions`;
    const message = timestamp + method + path;
    
    const signature = await generateSignature(apiSecret, message);
    
    const response = await fetch(`${COINBASE_API_URL}${path}`, {
      method,
      headers: {
        "CB-ACCESS-KEY": apiKey,
        "CB-ACCESS-SIGN": signature,
        "CB-ACCESS-TIMESTAMP": timestamp,
        "CB-ACCESS-PASSPHRASE": apiPassphrase,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.data.map((tx) => {
      const type = tx.type === "buy" ? "BUY" : tx.type === "sell" ? "SELL" : "OTHER";
      return {
        id: tx.id,
        symbol: tx.amount.currency,
        type,
        amount: parseFloat(tx.amount.amount),
        price: tx.native_amount ? parseFloat(tx.native_amount.amount) / parseFloat(tx.amount.amount) : null,
        totalValue: tx.native_amount ? parseFloat(tx.native_amount.amount) : null,
        fee: tx.fee ? parseFloat(tx.fee.amount) : null,
        feeToken: tx.fee?.currency,
        timestamp: new Date(tx.created_at),
        exchangeTxId: tx.id,
      };
    });
  } catch (error) {
    console.error("Error fetching Coinbase trades:", error);
    throw error;
  }
}

// Helper function to generate HMAC SHA256 signature
async function generateSignature(secret, message) {
  // Try to use Node.js crypto if available (server-side)
  if (typeof require !== 'undefined') {
    try {
      const crypto = require('crypto');
      return crypto.createHmac('sha256', secret).update(message).digest('base64');
    } catch (e) {
      // Fall through to Web Crypto API
    }
  }
  
  // Fallback to Web Crypto API (for Edge runtime)
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const msg = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msg);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  // Convert hex to base64
  const bytes = new Uint8Array(hashHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  return Buffer.from(bytes).toString('base64');
}

