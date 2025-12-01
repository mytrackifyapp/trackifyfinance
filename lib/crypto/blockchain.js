/**
 * Blockchain data fetching
 * Supports Ethereum, Bitcoin, Solana via public APIs
 */

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const ETHERSCAN_API_URL = "https://api.etherscan.io/api";

// Use ethers.js to fetch balance directly from RPC
export async function getEthereumBalance(address) {
  try {
    // Try using public RPC endpoint first (no API key needed)
    const rpcUrl = "https://eth.llamarpc.com"; // Public Ethereum RPC
    
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
      }),
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`RPC error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.result) {
      // Balance is returned in Wei (hex), convert to ETH
      const balanceWei = BigInt(data.result);
      const balanceEth = Number(balanceWei) / 1e18;
      return balanceEth;
    }

    return 0;
  } catch (error) {
    console.error("Error fetching Ethereum balance:", error);
    // Fallback to Etherscan if RPC fails
    try {
      if (ETHERSCAN_API_KEY) {
        const url = `${ETHERSCAN_API_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
        const response = await fetch(url, { next: { revalidate: 300 } });
        if (response.ok) {
          const data = await response.json();
          if (data.status === "1") {
            const balanceWei = BigInt(data.result);
            return Number(balanceWei) / 1e18;
          }
        }
      }
    } catch (fallbackError) {
      console.error("Etherscan fallback also failed:", fallbackError);
    }
    return 0;
  }
}

export async function getEthereumTokenBalances(address) {
  try {
    // Using a public API like Ethplorer or Moralis
    // For now, we'll use a simple approach with Etherscan
    // Note: Etherscan free tier has rate limits
    
    const url = `https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`;
    
    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    const tokens = [];
    
    // Add ETH balance
    if (data.ETH?.balance > 0) {
      tokens.push({
        symbol: "ETH",
        name: "Ethereum",
        amount: parseFloat(data.ETH.balance),
        address: null, // Native token
      });
    }
    
    // Add ERC-20 tokens
    if (data.tokens) {
      data.tokens.forEach((token) => {
        if (token.balance > 0) {
          tokens.push({
            symbol: token.tokenInfo.symbol,
            name: token.tokenInfo.name,
            amount: parseFloat(token.balance) / Math.pow(10, token.tokenInfo.decimals || 18),
            address: token.tokenInfo.address,
          });
        }
      });
    }
    
    return tokens;
  } catch (error) {
    console.error("Error fetching Ethereum token balances:", error);
    return [];
  }
}

export async function getBitcoinBalance(address) {
  try {
    // Using blockchain.info public API
    const url = `https://blockchain.info/q/addressbalance/${address}`;
    
    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return 0;
    }

    const satoshis = await response.text();
    // Convert from satoshis to BTC
    return parseFloat(satoshis) / 1e8;
  } catch (error) {
    console.error("Error fetching Bitcoin balance:", error);
    return 0;
  }
}

export async function getSolanaBalance(address) {
  try {
    // Using public Solana RPC endpoint
    const url = "https://api.mainnet-beta.solana.com";
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    
    if (data.result?.value) {
      // Balance is in lamports, convert to SOL
      return data.result.value / 1e9;
    }

    return 0;
  } catch (error) {
    console.error("Error fetching Solana balance:", error);
    return 0;
  }
}

export async function getSolanaTokenBalances(address) {
  try {
    // Using Solana RPC to get token accounts
    const url = "https://api.mainnet-beta.solana.com";
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [
          address,
          { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
          { encoding: "jsonParsed" },
        ],
      }),
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const tokens = [];
    
    if (data.result?.value) {
      data.result.value.forEach((account) => {
        const parsed = account.account.data.parsed?.info;
        if (parsed && parsed.tokenAmount?.uiAmount > 0) {
          tokens.push({
            symbol: parsed.mint, // You'd need to map mint addresses to symbols
            name: parsed.mint,
            amount: parseFloat(parsed.tokenAmount.uiAmount),
            address: parsed.mint,
          });
        }
      });
    }
    
    return tokens;
  } catch (error) {
    console.error("Error fetching Solana token balances:", error);
    return [];
  }
}

