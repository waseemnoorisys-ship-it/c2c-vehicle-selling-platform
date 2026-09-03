import { create } from "zustand";
import { persist } from "zustand/middleware";

export const SUPPORTED_CURRENCIES = {
  USD: { code: "USD", symbol: "$", label: "USD ($)", name: "US Dollar", locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", label: "EUR (€)", name: "Euro", locale: "de-DE" },
  INR: { code: "INR", symbol: "₹", label: "INR (₹)", name: "Indian Rupee", locale: "en-IN" },
  GBP: { code: "GBP", symbol: "£", label: "GBP (£)", name: "British Pound", locale: "en-GB" },
  CAD: { code: "CAD", symbol: "$", label: "CAD ($)", name: "Canadian Dollar", locale: "en-CA" },
  AUD: { code: "AUD", symbol: "$", label: "AUD ($)", name: "Australian Dollar", locale: "en-AU" },
  AED: { code: "AED", symbol: "AED", label: "AED (د.إ)", name: "UAE Dirham", locale: "en-AE" },
  JPY: { code: "JPY", symbol: "¥", label: "JPY (¥)", name: "Japanese Yen", locale: "ja-JP" },
};

export function formatPriceWithCurrency(amount, currencyCode = "USD") {
  const meta = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  const num = Number(amount) || 0;
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency: meta.code,
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${meta.symbol}${num.toLocaleString()}`;
  }
}

const useCurrencyStore = create(
  persist(
    (set, get) => ({
      currency: "USD",

      setCurrency: (currency) => {
        if (SUPPORTED_CURRENCIES[currency]) {
          set({ currency });
        }
      },

      getSymbol: () => {
        const curr = get().currency;
        return SUPPORTED_CURRENCIES[curr]?.symbol || "$";
      },

      getCurrencyMeta: () => {
        const curr = get().currency;
        return SUPPORTED_CURRENCIES[curr] || SUPPORTED_CURRENCIES.USD;
      },

      formatPrice: (amount) => {
        return formatPriceWithCurrency(amount, get().currency);
      },
    }),
    { name: "c2c-currency" }
  )
);

export function formatPrice(amount, overrideCurrency) {
  const currentCurrency = overrideCurrency || useCurrencyStore.getState().currency || "USD";
  return formatPriceWithCurrency(amount, currentCurrency);
}

export default useCurrencyStore;
