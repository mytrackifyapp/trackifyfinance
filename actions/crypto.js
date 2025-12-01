"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/crypto/encryption";
import { getBinanceBalances, validateBinanceCredentials } from "@/lib/crypto/exchanges/binance";
import { getCoinbaseBalances, validateCoinbaseCredentials } from "@/lib/crypto/exchanges/coinbase";
import { 
  getEthereumBalance, 
  getEthereumTokenBalances,
  getBitcoinBalance,
  getSolanaBalance,
  getSolanaTokenBalances,
} from "@/lib/crypto/blockchain";
import { getTokenPrice, getMultipleTokenPrices } from "@/lib/crypto/price-api";

// Serialization helpers
const serializeDecimal = (obj) => {
  const serialized = { ...obj };
  if (obj.amount) serialized.amount = obj.amount.toNumber();
  if (obj.averageCost) serialized.averageCost = obj.averageCost.toNumber();
  if (obj.price) serialized.price = obj.price.toNumber();
  if (obj.totalValue) serialized.totalValue = obj.totalValue.toNumber();
  if (obj.fee) serialized.fee = obj.fee.toNumber();
  if (obj.fromAmount) serialized.fromAmount = obj.fromAmount.toNumber();
  if (obj.toAmount) serialized.toAmount = obj.toAmount.toNumber();
  if (obj.lastPrice) serialized.lastPrice = obj.lastPrice.toNumber();
  return serialized;
};

// ==================== WALLET OPERATIONS ====================

export async function createCryptoWallet(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Check for duplicate address if it's a blockchain wallet
    if (data.type === "BLOCKCHAIN" && data.address) {
      const existingWallet = await db.userCryptoWallet.findFirst({
        where: {
          userId: user.id,
          address: data.address,
          chain: data.chain,
        },
      });

      if (existingWallet) {
        throw new Error("This wallet address is already connected");
      }
    }

    // Encrypt API credentials if provided
    const walletData = {
      userId: user.id,
      name: data.name,
      type: data.type,
      chain: data.chain || null,
      address: data.address || null,
      exchangeName: data.exchangeName || null,
      apiKey: data.apiKey ? encrypt(data.apiKey) : null,
      apiSecret: data.apiSecret ? encrypt(data.apiSecret) : null,
      apiPassphrase: data.apiPassphrase ? encrypt(data.apiPassphrase) : null,
      isActive: true,
    };

    // Validate exchange credentials if provided
    if (data.type === "EXCHANGE_BINANCE" && data.apiKey && data.apiSecret) {
      const isValid = await validateBinanceCredentials(data.apiKey, data.apiSecret);
      if (!isValid) {
        throw new Error("Invalid Binance API credentials");
      }
    }

    if (data.type === "EXCHANGE_COINBASE" && data.apiKey && data.apiSecret && data.apiPassphrase) {
      const isValid = await validateCoinbaseCredentials(data.apiKey, data.apiSecret, data.apiPassphrase);
      if (!isValid) {
        throw new Error("Invalid Coinbase API credentials");
      }
    }

    const wallet = await db.userCryptoWallet.create({
      data: walletData,
    });

    revalidatePath("/dashboard/crypto");
    revalidatePath("/dashboard/crypto/wallets");

    return { success: true, data: wallet };
  } catch (error) {
    console.error("Error creating crypto wallet:", error);
    return { success: false, error: error.message };
  }
}

export async function getCryptoWallets() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const wallets = await db.userCryptoWallet.findMany({
      where: { userId: user.id },
      include: {
        assets: true,
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return wallets.map((wallet) => ({
      ...wallet,
      // Don't expose encrypted credentials
      apiKey: wallet.apiKey ? "***" : null,
      apiSecret: wallet.apiSecret ? "***" : null,
      apiPassphrase: wallet.apiPassphrase ? "***" : null,
      assets: wallet.assets.map(serializeDecimal),
    }));
  } catch (error) {
    console.error("Error fetching crypto wallets:", error);
    return [];
  }
}

export async function updateCryptoWallet(walletId, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const wallet = await db.userCryptoWallet.findFirst({
      where: {
        id: walletId,
        userId: user.id,
      },
    });

    if (!wallet) throw new Error("Wallet not found");

    const updateData = { ...data };
    
    // Encrypt new credentials if provided
    if (data.apiKey) updateData.apiKey = encrypt(data.apiKey);
    if (data.apiSecret) updateData.apiSecret = encrypt(data.apiSecret);
    if (data.apiPassphrase) updateData.apiPassphrase = encrypt(data.apiPassphrase);

    const updated = await db.userCryptoWallet.update({
      where: { id: walletId },
      data: updateData,
    });

    revalidatePath("/dashboard/crypto");
    revalidatePath("/dashboard/crypto/wallets");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating crypto wallet:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCryptoWallet(walletId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    await db.userCryptoWallet.delete({
      where: {
        id: walletId,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard/crypto");
    revalidatePath("/dashboard/crypto/wallets");

    return { success: true };
  } catch (error) {
    console.error("Error deleting crypto wallet:", error);
    return { success: false, error: error.message };
  }
}

export async function syncCryptoWallet(walletId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const wallet = await db.userCryptoWallet.findFirst({
      where: {
        id: walletId,
        userId: user.id,
      },
    });

    if (!wallet) throw new Error("Wallet not found");

    let balances = [];
    let error = null;

    try {
      // Sync based on wallet type
      if (wallet.type === "EXCHANGE_BINANCE") {
        const apiKey = decrypt(wallet.apiKey);
        const apiSecret = decrypt(wallet.apiSecret);
        if (!apiKey || !apiSecret) {
          throw new Error("Missing API credentials");
        }
        balances = await getBinanceBalances(apiKey, apiSecret);
      } else if (wallet.type === "EXCHANGE_COINBASE") {
        const apiKey = decrypt(wallet.apiKey);
        const apiSecret = decrypt(wallet.apiSecret);
        const apiPassphrase = decrypt(wallet.apiPassphrase);
        if (!apiKey || !apiSecret || !apiPassphrase) {
          throw new Error("Missing API credentials");
        }
        balances = await getCoinbaseBalances(apiKey, apiSecret, apiPassphrase);
      } else if (wallet.type === "BLOCKCHAIN") {
        if (!wallet.address) {
          throw new Error("Wallet address is required");
        }

        // Support Ethereum and EVM-compatible chains
        if (["ethereum", "polygon", "bsc", "avalanche", "arbitrum", "optimism", "base"].includes(wallet.chain)) {
          const ethBalance = await getEthereumBalance(wallet.address);
          if (ethBalance > 0) {
            balances.push({ symbol: "ETH", total: ethBalance, address: null });
          }
          const tokens = await getEthereumTokenBalances(wallet.address);
          balances.push(...tokens.map(t => ({ 
            symbol: t.symbol, 
            total: t.amount,
            address: t.address 
          })));
        } else if (wallet.chain === "bitcoin" && wallet.address) {
          const btcBalance = await getBitcoinBalance(wallet.address);
          if (btcBalance > 0) {
            balances.push({ symbol: "BTC", total: btcBalance, address: null });
          }
        } else if (wallet.chain === "solana" && wallet.address) {
          const solBalance = await getSolanaBalance(wallet.address);
          if (solBalance > 0) {
            balances.push({ symbol: "SOL", total: solBalance, address: null });
          }
          const tokens = await getSolanaTokenBalances(wallet.address);
          balances.push(...tokens.map(t => ({ 
            symbol: t.symbol, 
            total: t.amount,
            address: t.address 
          })));
        }
      }

      // Update assets in database
      await db.$transaction(async (tx) => {
        for (const balance of balances) {
          await tx.userCryptoAsset.upsert({
            where: {
              walletId_tokenSymbol_tokenAddress: {
                walletId: wallet.id,
                tokenSymbol: balance.symbol,
                tokenAddress: balance.address || null,
              },
            },
            update: {
              amount: balance.total,
            },
            create: {
              userId: user.id,
              walletId: wallet.id,
              tokenSymbol: balance.symbol,
              tokenName: balance.symbol, // Will be updated with proper name later
              amount: balance.total,
              averageCost: 0, // Will be calculated from transactions
            },
          });
        }

        // Update wallet sync status
        await tx.userCryptoWallet.update({
          where: { id: wallet.id },
          data: {
            lastSyncedAt: new Date(),
            syncError: null,
          },
        });
      });

      revalidatePath("/dashboard/crypto");
      revalidatePath(`/dashboard/crypto/wallet/${walletId}`);

      return { success: true, balancesCount: balances.length };
    } catch (syncError) {
      error = syncError.message;
      
      // Update wallet with error
      await db.userCryptoWallet.update({
        where: { id: wallet.id },
        data: {
          syncError: error,
        },
      });

      return { success: false, error };
    }
  } catch (error) {
    console.error("Error syncing crypto wallet:", error);
    return { success: false, error: error.message };
  }
}

// ==================== TRANSACTION OPERATIONS ====================

export async function createCryptoTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const wallet = await db.userCryptoWallet.findFirst({
      where: {
        id: data.walletId,
        userId: user.id,
      },
    });

    if (!wallet) throw new Error("Wallet not found");

    const transaction = await db.$transaction(async (tx) => {
      // Create transaction
      const newTransaction = await tx.userCryptoTransaction.create({
        data: {
          userId: user.id,
          walletId: data.walletId,
          tokenSymbol: data.tokenSymbol,
          tokenName: data.tokenName || data.tokenSymbol,
          type: data.type,
          amount: data.amount,
          price: data.price || null,
          totalValue: data.totalValue || (data.amount * (data.price || 0)),
          fee: data.fee || null,
          feeToken: data.feeToken || null,
          fromToken: data.fromToken || null,
          toToken: data.toToken || null,
          fromAmount: data.fromAmount || null,
          toAmount: data.toAmount || null,
          timestamp: data.timestamp || new Date(),
          txHash: data.txHash || null,
          exchangeTxId: data.exchangeTxId || null,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        },
      });

      // Update asset average cost if it's a buy
      if (data.type === "BUY" && data.price) {
        const asset = await tx.userCryptoAsset.findUnique({
          where: {
            walletId_tokenSymbol_tokenAddress: {
              walletId: data.walletId,
              tokenSymbol: data.tokenSymbol,
              tokenAddress: null,
            },
          },
        });

        if (asset) {
          const totalAmount = asset.amount.toNumber() + data.amount;
          const totalCost = (asset.averageCost.toNumber() * asset.amount.toNumber()) + (data.amount * data.price);
          const newAverageCost = totalCost / totalAmount;

          await tx.userCryptoAsset.update({
            where: { id: asset.id },
            data: {
              amount: totalAmount,
              averageCost: newAverageCost,
            },
          });
        } else {
          // Create asset if it doesn't exist
          await tx.userCryptoAsset.create({
            data: {
              userId: user.id,
              walletId: data.walletId,
              tokenSymbol: data.tokenSymbol,
              tokenName: data.tokenName || data.tokenSymbol,
              amount: data.amount,
              averageCost: data.price,
            },
          });
        }
      }

      return newTransaction;
    });

    revalidatePath("/dashboard/crypto");
    revalidatePath("/dashboard/crypto/trades");
    revalidatePath(`/dashboard/crypto/wallet/${data.walletId}`);

    return { success: true, data: serializeDecimal(transaction) };
  } catch (error) {
    console.error("Error creating crypto transaction:", error);
    return { success: false, error: error.message };
  }
}

export async function getCryptoTransactions(filters = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const where = {
      userId: user.id,
    };

    if (filters.walletId) {
      where.walletId = filters.walletId;
    }

    if (filters.tokenSymbol) {
      where.tokenSymbol = filters.tokenSymbol;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.timestamp.lte = new Date(filters.endDate);
      }
    }

    const transactions = await db.userCryptoTransaction.findMany({
      where,
      include: {
        wallet: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
      take: filters.limit || 100,
    });

    return transactions.map(serializeDecimal);
  } catch (error) {
    console.error("Error fetching crypto transactions:", error);
    return [];
  }
}

export async function deleteCryptoTransaction(transactionId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    await db.userCryptoTransaction.delete({
      where: {
        id: transactionId,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard/crypto");
    revalidatePath("/dashboard/crypto/trades");

    return { success: true };
  } catch (error) {
    console.error("Error deleting crypto transaction:", error);
    return { success: false, error: error.message };
  }
}

// ==================== PORTFOLIO OPERATIONS ====================

export async function getCryptoPortfolio() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get all assets across all wallets
    const assets = await db.userCryptoAsset.findMany({
      where: {
        userId: user.id,
        wallet: {
          isActive: true,
        },
      },
      include: {
        wallet: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // Aggregate by token symbol
    const aggregated = {};
    assets.forEach((asset) => {
      const symbol = asset.tokenSymbol;
      if (!aggregated[symbol]) {
        aggregated[symbol] = {
          symbol,
          name: asset.tokenName,
          totalAmount: 0,
          averageCost: 0,
          wallets: [],
        };
      }
      aggregated[symbol].totalAmount += asset.amount.toNumber();
      aggregated[symbol].wallets.push({
        walletId: asset.walletId,
        walletName: asset.wallet.name,
        amount: asset.amount.toNumber(),
        averageCost: asset.averageCost.toNumber(),
      });
    });

    // Fetch current prices
    const symbols = Object.keys(aggregated);
    const prices = await getMultipleTokenPrices(symbols);

    // Calculate portfolio value and PnL
    let totalValue = 0;
    let totalCost = 0;

    Object.values(aggregated).forEach((token) => {
      const price = prices[token.symbol] || 0;
      const currentValue = token.totalAmount * price;
      const costBasis = token.totalAmount * (token.averageCost || 0);
      
      token.currentPrice = price;
      token.currentValue = currentValue;
      token.costBasis = costBasis;
      token.unrealizedPnL = currentValue - costBasis;
      token.unrealizedPnLPercent = costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0;

      totalValue += currentValue;
      totalCost += costBasis;
    });

    // Get recent transactions
    const recentTransactions = await db.userCryptoTransaction.findMany({
      where: { userId: user.id },
      include: {
        wallet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    return {
      totalValue,
      totalCost,
      totalPnL: totalValue - totalCost,
      totalPnLPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      tokens: Object.values(aggregated).map(serializeDecimal),
      recentTransactions: recentTransactions.map(serializeDecimal),
    };
  } catch (error) {
    console.error("Error fetching crypto portfolio:", error);
    return {
      totalValue: 0,
      totalCost: 0,
      totalPnL: 0,
      totalPnLPercent: 0,
      tokens: [],
      recentTransactions: [],
    };
  }
}
