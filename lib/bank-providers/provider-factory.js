import { PlaidProvider } from './plaid-provider';
import { MonoProvider } from './mono-provider';

/**
 * Factory to get the appropriate bank provider
 */
export function getBankProvider(providerName, country = null) {
  // Auto-select based on country if provider not specified
  if (!providerName && country) {
    const countryCode = typeof country === 'string' ? country.toUpperCase() : country;
    if (countryCode === 'NG' || countryCode === 'NIGERIA') {
      return new MonoProvider(); // Default to Mono for Nigeria
    }
    return new PlaidProvider(); // Default to Plaid for others
  }

  switch (providerName?.toUpperCase()) {
    case 'PLAID':
      return new PlaidProvider();
    case 'MONO':
      return new MonoProvider();
    default:
      return new PlaidProvider(); // Fallback to Plaid
  }
}

/**
 * Get available providers for a country
 */
export function getAvailableProviders(country = null) {
  const providers = [];
  
  // Always show Mono (for Nigerian users)
  providers.push({
    id: 'MONO',
    name: 'Mono',
    description: 'Connect Nigerian banks (GTBank, Access Bank, First Bank, etc.)',
    icon: '🇳🇬',
    recommended: country && (country === 'NG' || country === 'Nigeria'),
  });
  
  // Always show Plaid (for international users)
  providers.push({
    id: 'PLAID',
    name: 'Plaid',
    description: 'Connect international banks (US, Canada, UK, etc.)',
    icon: '🌍',
    recommended: !country || (country !== 'NG' && country !== 'Nigeria'),
  });
  
  return providers;
}

/**
 * Check if a provider is available
 */
export function isProviderAvailable(providerName) {
  const available = ['PLAID', 'MONO'];
  return available.includes(providerName?.toUpperCase());
}

