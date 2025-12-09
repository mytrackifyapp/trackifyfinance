import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

// Initialize Plaid client
const configuration = new Configuration({
  basePath: process.env.PLAID_ENV === 'production' 
    ? PlaidEnvironments.production 
    : PlaidEnvironments.sandbox, // Use sandbox for development
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

// Helper to get Plaid environment
export function getPlaidEnvironment() {
  return process.env.PLAID_ENV === 'production' 
    ? 'production' 
    : 'sandbox';
}

