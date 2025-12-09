import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid/client';
import { db } from '@/lib/prisma';
import { decryptPlaidToken } from '@/lib/plaid/encryption';

// Handle Plaid webhooks for transaction updates
export async function POST(request) {
  try {
    const body = await request.json();
    const { webhook_type, webhook_code, item_id } = body;

    // Find accounts with this item_id
    const accounts = await db.account.findMany({
      where: {
        plaidItemId: item_id,
        isBankConnected: true,
      },
    });

    if (accounts.length === 0) {
      console.log(`No accounts found for item_id: ${item_id}`);
      return NextResponse.json({ received: true });
    }

    // Handle different webhook types
    switch (webhook_type) {
      case 'TRANSACTIONS':
        if (webhook_code === 'SYNC_UPDATES_AVAILABLE') {
          // New transactions available, sync them
          for (const account of accounts) {
            try {
              await syncPlaidTransactions(account);
            } catch (error) {
              console.error(`Error syncing transactions for account ${account.id}:`, error);
              await db.account.update({
                where: { id: account.id },
                data: {
                  syncError: error.message,
                },
              });
            }
          }
        }
        break;

      case 'ITEM':
        if (webhook_code === 'ERROR') {
          // Item error occurred
          const error = body.error;
          for (const account of accounts) {
            await db.account.update({
              where: { id: account.id },
              data: {
                syncError: error?.error_message || 'Unknown error',
              },
            });
          }
        } else if (webhook_code === 'PENDING_EXPIRATION') {
          // Access token is expiring soon, user needs to reconnect
          for (const account of accounts) {
            await db.account.update({
              where: { id: account.id },
              data: {
                syncError: 'Bank connection expiring. Please reconnect.',
              },
            });
          }
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Plaid webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Helper function to sync transactions from Plaid
async function syncPlaidTransactions(account) {
  if (!account.plaidAccessToken) {
    throw new Error('No Plaid access token found');
  }

  const accessToken = decryptPlaidToken(account.plaidAccessToken);
  const user = await db.user.findUnique({
    where: { id: account.userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get transactions from the last 30 days (or since last sync)
  const startDate = account.lastSyncedAt 
    ? new Date(account.lastSyncedAt)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const endDate = new Date();

  const transactionsResponse = await plaidClient.transactionsGet({
    access_token: accessToken,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    account_ids: [account.plaidAccountId],
  });

  const transactions = transactionsResponse.data.transactions;

  // Create or update transactions
  for (const plaidTransaction of transactions) {
    // Check if transaction already exists
    const existing = await db.transaction.findFirst({
      where: {
        userId: user.id,
        accountId: account.id,
        description: plaidTransaction.name,
        amount: Math.abs(plaidTransaction.amount),
        date: new Date(plaidTransaction.date),
      },
    });

    if (!existing) {
      // Create new transaction
      const amount = Math.abs(plaidTransaction.amount);
      const type = plaidTransaction.amount > 0 ? 'INCOME' : 'EXPENSE';

      await db.transaction.create({
        data: {
          type,
          amount,
          description: plaidTransaction.name,
          date: new Date(plaidTransaction.date),
          category: plaidTransaction.category?.[0] || 'Uncategorized',
          accountId: account.id,
          userId: user.id,
        },
      });
    }
  }

  // Update account balance and last synced time
  const accountInfo = transactionsResponse.data.accounts.find(
    acc => acc.account_id === account.plaidAccountId
  );

  await db.account.update({
    where: { id: account.id },
    data: {
      balance: accountInfo?.balances.current || account.balance,
      lastSyncedAt: new Date(),
      syncError: null,
    },
  });
}

