import { BaseProvider } from './base-provider';
import { plaidClient } from '@/lib/plaid/client';

export class PlaidProvider extends BaseProvider {
  getName() {
    return 'PLAID';
  }

  async createLinkToken(userId, context) {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'Trackify Finance',
      products: ['transactions', 'auth'],
      country_codes: ['US'],
      language: 'en',
      webhook: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL}/api/plaid/webhook`,
      account_filters: {
        depository: {
          account_subtypes: ['checking', 'savings'],
        },
      },
    });

    return {
      link_token: response.data.link_token,
      expiration: new Date(response.data.expiration),
    };
  }

  async exchangeToken(publicToken) {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accountsResponse = await plaidClient.accountsGet({
      access_token: response.data.access_token,
    });

    return {
      access_token: response.data.access_token,
      item_id: response.data.item_id,
      accounts: accountsResponse.data.accounts,
    };
  }

  async getAccounts(accessToken) {
    const response = await plaidClient.accountsGet({
      access_token: accessToken,
    });
    return response.data.accounts;
  }

  async getTransactions(accessToken, accountId, startDate, endDate) {
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      account_ids: [accountId],
    });
    return response.data.transactions;
  }
}

