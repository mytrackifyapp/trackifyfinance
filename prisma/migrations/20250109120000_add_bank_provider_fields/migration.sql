-- AlterTable: Add bank provider fields
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "bankProvider" TEXT,
ADD COLUMN IF NOT EXISTS "providerAccountId" TEXT,
ADD COLUMN IF NOT EXISTS "providerItemId" TEXT;

-- Update existing bank-connected accounts to have provider
UPDATE "accounts" 
SET "bankProvider" = 'PLAID' 
WHERE "isBankConnected" = true AND "plaidItemId" IS NOT NULL AND "bankProvider" IS NULL;
