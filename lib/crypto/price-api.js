/**
 * Price API service using CoinGecko
 * Handles fetching token prices and metadata
 */

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

// Cache for price data (in-memory, consider Redis in production)
const priceCache = new Map();
const CACHE_TTL = 60000; // 1 minute

export async function getTokenPrice(symbol, vsCurrency = "usd") {
  const cacheKey = `${symbol.toLowerCase()}_${vsCurrency}`;
  const cached = priceCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price;
  }

  try {
    // Map common symbols to CoinGecko IDs
    const symbolMap = {
      btc: "bitcoin",
      eth: "ethereum",
      usdt: "tether",
      usdc: "usd-coin",
      bnb: "binancecoin",
      sol: "solana",
      ada: "cardano",
      dot: "polkadot",
      matic: "matic-network",
      avax: "avalanche-2",
      link: "chainlink",
      uni: "uniswap",
      aave: "aave",
    };

    const coinId = symbolMap[symbol.toLowerCase()] || symbol.toLowerCase();
    const url = `${COINGECKO_API_URL}/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price = data[coinId]?.[vsCurrency];

    if (price) {
      priceCache.set(cacheKey, { price, timestamp: Date.now() });
      return price;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

export async function getMultipleTokenPrices(symbols, vsCurrency = "usd") {
  const prices = {};
  
  // Fetch prices in parallel
  await Promise.all(
    symbols.map(async (symbol) => {
      const price = await getTokenPrice(symbol, vsCurrency);
      if (price !== null) {
        prices[symbol.toUpperCase()] = price;
      }
    })
  );

  return prices;
}

export async function getTokenMetadata(symbol) {
  try {
    const symbolMap = {
      btc: "bitcoin",
      eth: "ethereum",
      usdt: "tether",
      usdc: "usd-coin",
      bnb: "binancecoin",
      sol: "solana",
    };

    const coinId = symbolMap[symbol.toLowerCase()] || symbol.toLowerCase();
    const url = `${COINGECKO_API_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      image: data.image?.small || data.image?.large,
      marketCap: data.market_data?.market_cap?.usd,
      circulatingSupply: data.market_data?.circulating_supply,
      totalSupply: data.market_data?.total_supply,
      currentPrice: data.market_data?.current_price?.usd,
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${symbol}:`, error);
    return null;
  }
}

export async function getTokenPriceHistory(symbol, days = 30) {
  try {
    const symbolMap = {
      btc: "bitcoin",
      eth: "ethereum",
      usdt: "tether",
      usdc: "usd-coin",
      bnb: "binancecoin",
      sol: "solana",
    };

    const coinId = symbolMap[symbol.toLowerCase()] || symbol.toLowerCase();
    const url = `${COINGECKO_API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;

    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.prices?.map(([timestamp, price]) => ({
      timestamp,
      price,
    })) || [];
  } catch (error) {
    console.error(`Error fetching price history for ${symbol}:`, error);
    return null;
  }
}

