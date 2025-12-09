-- AlterTable
ALTER TABLE "accounts" ADD COLUMN "isBankConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "plaidItemId" TEXT,
ADD COLUMN "plaidAccessToken" TEXT,
ADD COLUMN "plaidAccountId" TEXT,
ADD COLUMN "plaidInstitutionId" TEXT,
ADD COLUMN "plaidInstitutionName" TEXT,
ADD COLUMN "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN "syncError" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_plaidItemId_key" ON "accounts"("plaidItemId");

-- CreateIndex
CREATE INDEX "accounts_plaidItemId_idx" ON "accounts"("plaidItemId");

