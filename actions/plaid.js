"use server";

import { auth } from "@clerk/nextjs/server";
import { plaidClient } from "@/lib/plaid/client";
import { decryptPlaidToken } from "@/lib/plaid/encryption";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getBankProvider } from "@/lib/bank-providers/provider-factory";

/**
 * Sync transactions for a bank-connected account
 */
export async function syncPlaidAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await checkUser();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    if (!account.isBankConnected || !account.plaidAccessToken) {
      return { success: false, error: "Account is not connected to a bank" };
    }

    // Get the appropriate provider
    const provider = getBankProvider(account.bankProvider || 'PLAID');
    const accessToken = decryptPlaidToken(account.plaidAccessToken);

    // Get transactions from the last 90 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    const endDate = new Date();

    // Use provider-specific method to get transactions
    const accountId = account.bankProvider === 'MONO' 
      ? account.providerAccountId 
      : account.plaidAccountId;

    const transactions = await provider.getTransactions(
      accessToken,
      accountId,
      startDate,
      endDate
    );

    // Get account info
    let accountInfo;
    if (account.bankProvider === 'MONO') {
      const accounts = await provider.getAccounts(accessToken);
      accountInfo = accounts.find(acc => (acc._id || acc.id) === account.providerAccountId);
    } else {
      const accountsResponse = await plaidClient.accountsGet({
        access_token: accessToken,
      });
      accountInfo = accountsResponse.data.accounts.find(
        acc => acc.account_id === account.plaidAccountId
      );
    }

    // Create or update transactions
    let createdCount = 0;
    let updatedCount = 0;

    for (const transaction of transactions) {
      // Normalize transaction data based on provider
      const transactionName = transaction.name || transaction.narration || transaction.description;
      const transactionAmount = transaction.amount || Math.abs(transaction.amount);
      const transactionDate = transaction.date || transaction.transaction_date;
      const transactionType = transaction.type || (transactionAmount > 0 ? 'INCOME' : 'EXPENSE');

      // Check if transaction already exists
      const existing = await db.transaction.findFirst({
        where: {
          userId: user.id,
          accountId: account.id,
          description: transactionName,
          amount: Math.abs(transactionAmount),
          date: new Date(transactionDate),
        },
      });

      if (!existing) {
        const amount = Math.abs(transactionAmount);
        const type = transactionAmount > 0 ? 'INCOME' : 'EXPENSE';

        await db.transaction.create({
          data: {
            type,
            amount,
            description: transactionName,
            date: new Date(transactionDate),
            category: transaction.category?.[0] || transaction.category || 'Uncategorized',
            accountId: account.id,
            userId: user.id,
          },
        });
        createdCount++;
      } else {
        updatedCount++;
      }
    }

    // Update account balance (normalize based on provider)
    const newBalance = account.bankProvider === 'MONO'
      ? (accountInfo?.balance || accountInfo?.available_balance || account.balance)
      : (accountInfo?.balances?.current || account.balance);

    await db.account.update({
      where: { id: account.id },
      data: {
        balance: newBalance || account.balance,
        lastSyncedAt: new Date(),
        syncError: null,
      },
    });

    revalidatePath('/dashboard/accounting');
    revalidatePath(`/account/${account.id}`);

    return {
      success: true,
      transactionsCreated: createdCount,
      transactionsUpdated: updatedCount,
      balance: accountInfo?.balances.current?.toString() || account.balance.toString(),
    };
  } catch (error) {
    console.error('Error syncing Plaid account:', error);
    
    // Update account with error
    try {
      await db.account.update({
        where: { id: accountId },
        data: {
          syncError: error.response?.data?.error_message || error.message,
        },
      });
    } catch (updateError) {
      console.error('Error updating account sync error:', updateError);
    }

    return {
      success: false,
      error: error.response?.data?.error_message || error.message || 'Failed to sync account',
    };
  }
}

/**
 * Disconnect a bank account
 */
export async function disconnectPlaidAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await checkUser();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    if (!account.isBankConnected) {
      return { success: false, error: "Account is not connected to a bank" };
    }

    // Remove bank connection but keep the account
    await db.account.update({
      where: { id: account.id },
      data: {
        isBankConnected: false,
        bankProvider: null,
        plaidItemId: null,
        plaidAccessToken: null,
        plaidAccountId: null,
        providerAccountId: null,
        providerItemId: null,
        plaidInstitutionId: null,
        plaidInstitutionName: null,
        syncError: null,
      },
    });

    revalidatePath('/dashboard/accounting');
    revalidatePath(`/account/${account.id}`);

    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Plaid account:', error);
    return {
      success: false,
      error: error.message || 'Failed to disconnect account',
    };
  }
}

