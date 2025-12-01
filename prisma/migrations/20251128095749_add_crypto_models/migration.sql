-- CreateEnum
CREATE TYPE "CryptoWalletType" AS ENUM ('MANUAL', 'BLOCKCHAIN', 'EXCHANGE_BINANCE', 'EXCHANGE_COINBASE', 'EXCHANGE_OTHER');

-- CreateEnum
CREATE TYPE "CryptoTransactionType" AS ENUM ('BUY', 'SELL', 'SWAP', 'TRANSFER_IN', 'TRANSFER_OUT', 'STAKE_REWARD', 'UNSTAKE', 'FEE', 'AIRDROP', 'OTHER');

-- CreateTable
CREATE TABLE "user_crypto_wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CryptoWalletType" NOT NULL,
    "chain" TEXT,
    "address" TEXT,
    "exchangeName" TEXT,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "apiPassphrase" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_crypto_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_crypto_assets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "tokenName" TEXT NOT NULL,
    "tokenAddress" TEXT,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "averageCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lastPrice" DECIMAL(65,30),
    "lastPriceUpdate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_crypto_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_crypto_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "tokenName" TEXT NOT NULL,
    "type" "CryptoTransactionType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "price" DECIMAL(65,30),
    "totalValue" DECIMAL(65,30) NOT NULL,
    "fee" DECIMAL(65,30),
    "feeToken" TEXT,
    "fromToken" TEXT,
    "toToken" TEXT,
    "fromAmount" DECIMAL(65,30),
    "toAmount" DECIMAL(65,30),
    "timestamp" TIMESTAMP(3) NOT NULL,
    "txHash" TEXT,
    "exchangeTxId" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_crypto_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_crypto_wallets_userId_idx" ON "user_crypto_wallets"("userId");

-- CreateIndex
CREATE INDEX "user_crypto_wallets_userId_type_idx" ON "user_crypto_wallets"("userId", "type");

-- CreateIndex
CREATE INDEX "user_crypto_assets_userId_idx" ON "user_crypto_assets"("userId");

-- CreateIndex
CREATE INDEX "user_crypto_assets_walletId_idx" ON "user_crypto_assets"("walletId");

-- CreateIndex
CREATE INDEX "user_crypto_assets_tokenSymbol_idx" ON "user_crypto_assets"("tokenSymbol");

-- CreateIndex
CREATE UNIQUE INDEX "user_crypto_assets_walletId_tokenSymbol_tokenAddress_key" ON "user_crypto_assets"("walletId", "tokenSymbol", "tokenAddress");

-- CreateIndex
CREATE INDEX "user_crypto_transactions_userId_idx" ON "user_crypto_transactions"("userId");

-- CreateIndex
CREATE INDEX "user_crypto_transactions_walletId_idx" ON "user_crypto_transactions"("walletId");

-- CreateIndex
CREATE INDEX "user_crypto_transactions_tokenSymbol_idx" ON "user_crypto_transactions"("tokenSymbol");

-- CreateIndex
CREATE INDEX "user_crypto_transactions_timestamp_idx" ON "user_crypto_transactions"("timestamp");

-- CreateIndex
CREATE INDEX "user_crypto_transactions_userId_timestamp_idx" ON "user_crypto_transactions"("userId", "timestamp");

-- AddForeignKey
ALTER TABLE "user_crypto_wallets" ADD CONSTRAINT "user_crypto_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_crypto_assets" ADD CONSTRAINT "user_crypto_assets_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "user_crypto_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_crypto_transactions" ADD CONSTRAINT "user_crypto_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_crypto_transactions" ADD CONSTRAINT "user_crypto_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "user_crypto_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
