import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { plaidClient } from '@/lib/plaid/client';
import { encryptPlaidToken } from '@/lib/plaid/encryption';
import { checkUser } from '@/lib/checkUser';
import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await checkUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { public_token, institution_id, institution_name, context } = await request.json();

    if (!public_token) {
      return NextResponse.json(
        { error: 'Public token is required' },
        { status: 400 }
      );
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get account information
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accounts = accountsResponse.data.accounts;

    // Encrypt access token for storage
    const encryptedToken = encryptPlaidToken(accessToken);

    // Check if this Plaid item already exists for this user
    // Note: plaidItemId is unique in schema, but one Plaid item can have multiple accounts
    // So we need to handle this carefully
    const existingItemAccount = await db.account.findFirst({
      where: {
        userId: user.id,
        plaidItemId: itemId,
      },
    });

    // Get all existing accounts from this item (they might not all have plaidItemId set due to unique constraint)
    // So we'll also check by institution and account IDs
    const existingAccountsFromItem = existingItemAccount
      ? await db.account.findMany({
          where: {
            userId: user.id,
            OR: [
              { plaidItemId: itemId },
              { plaidInstitutionId: institution_id },
            ],
          },
        })
      : [];

    // Check if this should be default (first account for this user)
    const allUserAccounts = await db.account.findMany({
      where: { userId: user.id },
    });
    const shouldBeDefault = allUserAccounts.length === 0;

    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create/update accounts for each connected bank account
    const createdAccounts = [];
    const processedAccountIds = new Set();
    
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      processedAccountIds.add(account.account_id);
      
      // Check if account already exists by plaidAccountId
      const existingAccount = await db.account.findFirst({
        where: {
          userId: user.id,
          plaidAccountId: account.account_id,
        },
      });

      if (existingAccount) {
        // Update existing account
        // Only set plaidItemId on the first account to avoid unique constraint violation
        const updateData = {
          plaidAccessToken: encryptedToken,
          plaidAccountId: account.account_id,
          plaidInstitutionId: institution_id,
          plaidInstitutionName: institution_name,
          isBankConnected: true,
          balance: account.balances.current || 0,
          lastSyncedAt: new Date(),
          syncError: null,
          bankProvider: 'PLAID',
        };
        
        // Only set plaidItemId on the first account (i === 0)
        if (i === 0) {
          updateData.plaidItemId = itemId;
        }
        
        const updated = await db.account.update({
          where: { id: existingAccount.id },
          data: updateData,
        });
        createdAccounts.push(updated);
      } else {
        // Create new account
        const accountType = account.type === 'depository' 
          ? (account.subtype === 'savings' ? 'SAVINGS' : 'CURRENT')
          : 'CURRENT';

        // Only the first account from this connection should be default (if user has no accounts)
        const isDefault = shouldBeDefault && i === 0;

        // Only set plaidItemId on the first account to avoid unique constraint violation
        const accountData = {
          name: account.name || `${institution_name} ${account.type}`,
          type: accountType,
          context: context || 'PERSONAL',
          balance: account.balances.current || 0,
          isDefault: isDefault,
          isBankConnected: true,
          bankProvider: 'PLAID',
          plaidAccessToken: encryptedToken,
          plaidAccountId: account.account_id,
          plaidInstitutionId: institution_id,
          plaidInstitutionName: institution_name,
          lastSyncedAt: new Date(),
          userId: user.id,
        };
        
        // Only set plaidItemId on the first account (i === 0)
        if (i === 0) {
          accountData.plaidItemId = itemId;
        }

        const newAccount = await db.account.create({
          data: accountData,
        });
        createdAccounts.push(newAccount);
      }
    }

    // Delete any accounts from this item that are no longer in Plaid's response
    // (but keep accounts that don't have plaidItemId set to avoid deleting unrelated accounts)
    if (existingItemAccount || existingAccountsFromItem.length > 0) {
      const accountsToDelete = existingAccountsFromItem.filter(
        acc => acc.plaidAccountId && !processedAccountIds.has(acc.plaidAccountId)
      );
      
      if (accountsToDelete.length > 0) {
        await db.account.deleteMany({
          where: {
            id: { in: accountsToDelete.map(acc => acc.id) },
          },
        });
      }
    }

    revalidatePath('/dashboard/accounting');
    revalidatePath('/dashboard');

    return NextResponse.json({
      success: true,
      accounts: createdAccounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        balance: acc.balance.toString(),
        plaidAccountId: acc.plaidAccountId,
      })),
      item_id: itemId,
    });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to exchange public token',
        message: error.response?.data?.error_message || error.message 
      },
      { status: 500 }
    );
  }
}

