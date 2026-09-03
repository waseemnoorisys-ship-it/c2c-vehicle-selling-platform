import { create } from "zustand";

export const EUR_CURRENCY = {
  code: "EUR",
  symbol: "€",
  label: "EUR (€)",
  name: "Euro",
  locale: "de-DE",
};

export const SUPPORTED_CURRENCIES = {
  EUR: EUR_CURRENCY,
};

export function formatPriceWithCurrency(amount, _currencyCode = "EUR") {
  const num = Number(amount) || 0;
  try {
    return new Intl.NumberFormat(EUR_CURRENCY.locale, {
      style: "currency",
      currency: EUR_CURRENCY.code,
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `€${num.toLocaleString()}`;
  }
}

const useCurrencyStore = create(() => ({
  currency: "EUR",
  setCurrency: () => {},
  getSymbol: () => "€",
  getCurrencyMeta: () => EUR_CURRENCY,
  formatPrice: (amount) => formatPriceWithCurrency(amount, "EUR"),
}));

export function formatPrice(amount, _overrideCurrency) {
  return formatPriceWithCurrency(amount, "EUR");
}

export default useCurrencyStore;
