/**
 * Base class for bank connection providers
 * All providers (Plaid, Mono, etc.) should extend this class
 */
export class BaseProvider {
  constructor() {
    if (this.constructor === BaseProvider) {
      throw new Error("BaseProvider cannot be instantiated directly");
    }
  }

  /**
   * Create a link token for initiating bank connection
   * @param {string} userId - User ID
   * @param {string} context - Account context (PERSONAL/COMPANY)
   * @returns {Promise<{link_token: string, expiration: Date}>}
   */
  async createLinkToken(userId, context) {
    throw new Error("createLinkToken must be implemented by subclass");
  }

  /**
   * Exchange public token/code for access token
   * @param {string} publicToken - Public token or code from provider
   * @returns {Promise<{access_token: string, item_id: string, accounts: Array}>}
   */
  async exchangeToken(publicToken) {
    throw new Error("exchangeToken must be implemented by subclass");
  }

  /**
   * Get accounts for a connected item
   * @param {string} accessToken - Provider access token
   * @returns {Promise<Array>}
   */
  async getAccounts(accessToken) {
    throw new Error("getAccounts must be implemented by subclass");
  }

  /**
   * Get transactions for an account
   * @param {string} accessToken - Provider access token
   * @param {string} accountId - Account ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>}
   */
  async getTransactions(accessToken, accountId, startDate, endDate) {
    throw new Error("getTransactions must be implemented by subclass");
  }

  /**
   * Get provider name
   * @returns {string}
   */
  getName() {
    throw new Error("getName must be implemented by subclass");
  }
}

