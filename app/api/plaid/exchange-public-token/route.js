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

    // Create accounts for each connected bank account
    const createdAccounts = [];
    
    for (const account of accounts) {
      // Skip if account already exists
      const existingAccount = await db.account.findFirst({
        where: {
          userId: user.id,
          plaidAccountId: account.account_id,
        },
      });

      if (existingAccount) {
        // Update existing account
        const updated = await db.account.update({
          where: { id: existingAccount.id },
          data: {
            plaidItemId: itemId,
            plaidAccessToken: encryptedToken,
            plaidAccountId: account.account_id,
            plaidInstitutionId: institution_id,
            plaidInstitutionName: institution_name,
            isBankConnected: true,
            balance: account.balances.current || 0,
            lastSyncedAt: new Date(),
            syncError: null,
          },
        });
        createdAccounts.push(updated);
      } else {
        // Create new account
        const accountType = account.type === 'depository' 
          ? (account.subtype === 'savings' ? 'SAVINGS' : 'CURRENT')
          : 'CURRENT';

        // Check if this should be default (first account)
        const existingAccounts = await db.account.findMany({
          where: { userId: user.id },
        });
        const shouldBeDefault = existingAccounts.length === 0;

        if (shouldBeDefault) {
          await db.account.updateMany({
            where: { userId: user.id, isDefault: true },
            data: { isDefault: false },
          });
        }

        const newAccount = await db.account.create({
          data: {
            name: account.name || `${institution_name} ${account.type}`,
            type: accountType,
            context: context || 'PERSONAL',
            balance: account.balances.current || 0,
            isDefault: shouldBeDefault,
            isBankConnected: true,
            plaidItemId: itemId,
            plaidAccessToken: encryptedToken,
            plaidAccountId: account.account_id,
            plaidInstitutionId: institution_id,
            plaidInstitutionName: institution_name,
            lastSyncedAt: new Date(),
            userId: user.id,
          },
        });
        createdAccounts.push(newAccount);
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

