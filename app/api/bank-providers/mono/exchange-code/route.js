import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getBankProvider } from '@/lib/bank-providers/provider-factory';
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

    const { code, institution_id, institution_name, context } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const provider = getBankProvider('MONO');
    const exchangeResult = await provider.exchangeToken(code);
    
    // Get accounts from Mono
    const accounts = await provider.getAccounts(exchangeResult.access_token);

    // Encrypt access token for storage
    const encryptedToken = encryptPlaidToken(exchangeResult.access_token);

    // Create accounts for each connected bank account
    const createdAccounts = [];
    
    for (const account of accounts) {
      // Skip if account already exists
      const existingAccount = await db.account.findFirst({
        where: {
          userId: user.id,
          providerAccountId: account._id || account.id,
          bankProvider: 'MONO',
        },
      });

      if (existingAccount) {
        // Update existing account
        const updated = await db.account.update({
          where: { id: existingAccount.id },
          data: {
            providerItemId: exchangeResult.item_id,
            plaidAccessToken: encryptedToken, // Reusing this field for all providers
            providerAccountId: account._id || account.id,
            plaidInstitutionId: institution_id,
            plaidInstitutionName: institution_name || account.institution?.name || 'Nigerian Bank',
            isBankConnected: true,
            bankProvider: 'MONO',
            balance: account.balance || account.available_balance || 0,
            lastSyncedAt: new Date(),
            syncError: null,
          },
        });
        createdAccounts.push(updated);
      } else {
        // Determine account type from Mono data
        const accountType = account.type === 'savings' ? 'SAVINGS' : 'CURRENT';

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
            name: account.name || account.account_name || `${institution_name || 'Bank'} ${account.type || 'Account'}`,
            type: accountType,
            context: context || 'PERSONAL',
            balance: account.balance || account.available_balance || 0,
            isDefault: shouldBeDefault,
            isBankConnected: true,
            bankProvider: 'MONO',
            providerItemId: exchangeResult.item_id,
            plaidAccessToken: encryptedToken,
            providerAccountId: account._id || account.id,
            plaidInstitutionId: institution_id,
            plaidInstitutionName: institution_name || account.institution?.name || 'Nigerian Bank',
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
        providerAccountId: acc.providerAccountId,
      })),
      item_id: exchangeResult.item_id,
    });
  } catch (error) {
    console.error('Error exchanging Mono code:', error);
    return NextResponse.json(
      { 
        error: 'Failed to exchange code',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

