export const DEFAULT_CURRENCY = "USD";
export const CURRENCY_STORAGE_KEY = "trackify.preferredCurrency";

export function getStoredCurrency() {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  try {
    return window.localStorage.getItem(CURRENCY_STORAGE_KEY) || DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

export function setStoredCurrency(code) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  } catch {}
}

export function formatCurrency(amount, code = DEFAULT_CURRENCY) {
  const value = typeof amount === "number" ? amount : Number(amount || 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Fallback to symbol-less if currency code is invalid
    return `${value.toFixed(2)} ${code}`;
  }
}

