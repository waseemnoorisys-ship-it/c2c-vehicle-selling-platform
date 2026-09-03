import { useState, useRef, useEffect } from "react";
import useCurrencyStore, { SUPPORTED_CURRENCIES } from "../../store/useCurrencyStore";

export default function CurrencySelector({ className = "" }) {
  const { currency, setCurrency } = useCurrencyStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeMeta = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select currency"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover transition text-xs font-semibold text-text-secondary hover:text-text-accent"
      >
        <span className="text-text-accent font-bold">{activeMeta.symbol}</span>
        <span>{activeMeta.code}</span>
        <svg
          className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-surface-elevated shadow-xl z-50 py-1.5 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider border-b border-border mb-1">
            Select Currency
          </div>
          <div className="max-h-60 overflow-y-auto">
            {Object.values(SUPPORTED_CURRENCIES).map((item) => {
              const isSelected = item.code === currency;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setCurrency(item.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition ${
                    isSelected
                      ? "bg-primary-500/10 text-text-accent font-bold"
                      : "text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center font-bold text-text-accent">
                      {item.symbol}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[11px] text-text-muted">{item.code}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
