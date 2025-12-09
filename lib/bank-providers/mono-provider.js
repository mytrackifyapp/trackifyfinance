import { BaseProvider } from './base-provider';

export class MonoProvider extends BaseProvider {
  constructor() {
    super();
    this.apiKey = process.env.MONO_SECRET_KEY;
    this.publicKey = process.env.MONO_PUBLIC_KEY;
    this.baseUrl = process.env.MONO_API_URL || 'https://api.withmono.com';
    this.isSandbox = this.apiKey?.startsWith('test_');
  }

  getName() {
    return 'MONO';
  }

  /**
   * Check if we're in sandbox mode
   */
  isSandboxMode() {
    return this.isSandbox;
  }

  /**
   * Get public key for widget initialization
   */
  getPublicKey() {
    return this.publicKey;
  }

  async createLinkToken(userId, context) {
    if (!this.apiKey) {
      throw new Error('MONO_SECRET_KEY is not configured. Please add it to your environment variables.');
    }
    
    if (!this.publicKey) {
      throw new Error('MONO_PUBLIC_KEY is not configured. Please add it to your environment variables.');
    }

    // Mono doesn't use a link token creation endpoint
    // Instead, the widget is initialized with the public key directly
    // The widget returns a code after user connects, which we then exchange
    // So we just return the public key and widget URL ready to use
    
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/bank-providers/mono/callback?context=${context}`;
    
    // Generate a unique session ID for tracking (not a real token)
    const sessionId = `mono_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    console.log('Mono widget initialization:', {
      publicKey: this.publicKey?.substring(0, 15) + '...',
      isSandbox: this.isSandbox,
      successUrl,
    });
    
    return {
      link_token: sessionId, // Session identifier (not a real token)
      expiration: new Date(Date.now() + 3600000), // 1 hour expiration
      mono_code: sessionId,
      isSandbox: this.isSandbox,
      publicKey: this.publicKey,
      // Widget URL - user will connect here and get a code
      // The widget handles everything, we just need the public key
      widgetUrl: `https://connect.withmono.com/?key=${this.publicKey}`,
      successUrl: successUrl,
    };
  }

  async exchangeToken(code) {
    if (!this.apiKey) {
      throw new Error('MONO_SECRET_KEY is not configured');
    }

    try {
      // Exchange code for account ID
      const response = await fetch(`${this.baseUrl}/v1/account/auth`, {
        method: 'POST',
        headers: {
          'mono-sec-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const responseText = await response.text();
      
      // Handle sandbox test codes
      if (code.startsWith('sandbox_')) {
        console.log('Sandbox test code detected. Using mock exchange for testing.');
        // For sandbox, return mock data for testing
        return {
          access_token: `sandbox_account_${Date.now()}`,
          item_id: `sandbox_item_${Date.now()}`,
          accounts: [
            {
              _id: 'sandbox_account_1',
              id: 'sandbox_account_1',
              name: 'Test Bank Account',
              type: 'current',
              balance: 10000.00,
              available_balance: 10000.00,
              institution: {
                name: 'Test Bank (Sandbox)',
              },
            },
          ],
          isSandbox: true,
        };
      }
      
      // Handle sandbox health check in exchange
      if (responseText.includes('Mono is Live!') || responseText.includes('Mono is live')) {
        console.log('Mono sandbox detected in exchange. Using mock data.');
        return {
          access_token: `sandbox_account_${Date.now()}`,
          item_id: `sandbox_item_${Date.now()}`,
          accounts: [
            {
              _id: 'sandbox_account_1',
              id: 'sandbox_account_1',
              name: 'Test Bank Account',
              type: 'current',
              balance: 10000.00,
              available_balance: 10000.00,
              institution: {
                name: 'Test Bank (Sandbox)',
              },
            },
          ],
          isSandbox: true,
        };
      }
      
      // Check if response is JSON
      if (!responseText.trim().startsWith('{') && !responseText.trim().startsWith('[')) {
        console.error('Mono exchange returned non-JSON response:', responseText);
        throw new Error(`Mono API error: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Mono exchange response:', responseText);
        throw new Error(`Invalid response from Mono API: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to exchange Mono code');
      }

      const accountId = data.id;
      
      if (!accountId) {
        throw new Error('Mono API did not return an account ID');
      }

      // Get accounts for this connection
      const accountsResponse = await fetch(`${this.baseUrl}/v1/accounts`, {
        headers: {
          'mono-sec-key': this.apiKey,
          'x-api-key': accountId, // Mono uses account ID as access token
        },
      });

      if (!accountsResponse.ok) {
        throw new Error('Failed to fetch Mono accounts');
      }

      const accountsData = await accountsResponse.json();

      return {
        access_token: accountId, // Mono uses account ID as access token
        item_id: accountId,
        accounts: accountsData.data || [],
      };
    } catch (error) {
      console.error('Mono token exchange error:', error);
      throw new Error(`Mono token exchange failed: ${error.message}`);
    }
  }

  async getAccounts(accessToken) {
    if (!this.apiKey) {
      throw new Error('MONO_SECRET_KEY is not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/accounts`, {
        headers: {
          'mono-sec-key': this.apiKey,
          'x-api-key': accessToken,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Mono accounts');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Mono getAccounts error:', error);
      throw new Error(`Failed to fetch Mono accounts: ${error.message}`);
    }
  }

  async getTransactions(accessToken, accountId, startDate, endDate) {
    if (!this.apiKey) {
      throw new Error('MONO_SECRET_KEY is not configured');
    }

    try {
      // Format dates for Mono API (YYYY-MM-DD)
      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];

      const response = await fetch(
        `${this.baseUrl}/v1/accounts/${accountId}/transactions?start=${start}&end=${end}`,
        {
          headers: {
            'mono-sec-key': this.apiKey,
            'x-api-key': accessToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Mono transactions');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Mono getTransactions error:', error);
      throw new Error(`Failed to fetch Mono transactions: ${error.message}`);
    }
  }
}

