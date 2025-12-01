-- CreateEnum
CREATE TYPE "AccountContext" AS ENUM ('PERSONAL', 'COMPANY');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN "context" "AccountContext" NOT NULL DEFAULT 'PERSONAL';

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN "companyName" TEXT;

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN "taxId" TEXT;

-- CreateIndex
CREATE INDEX "accounts_userId_context_idx" ON "accounts"("userId", "context");
