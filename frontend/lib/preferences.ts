export const CURRENCIES = ["USD", "EUR", "PLN"] as const;

export type Currency = typeof CURRENCIES[number];

export const DEFAULT_CURRENCY: Currency = "USD";
export const CURRENCY_STORAGE_KEY = "backlog_currency";

export function isCurrency(value: string | null): value is Currency {
  return CURRENCIES.includes(value as Currency);
}

export function getPreferredCurrency(): Currency {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  return isCurrency(stored) ? stored : DEFAULT_CURRENCY;
}

export function setPreferredCurrency(currency: Currency) {
  window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
}
