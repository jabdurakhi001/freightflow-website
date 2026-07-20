import { createContext, useContext, useState, type ReactNode } from 'react';

export interface QuotePrefill {
  origin?: string;
  destination?: string;
}

interface SiteModalsContextValue {
  isQuoteOpen: boolean;
  /** Optional lane carried into the quote form (e.g. from the transit estimator). */
  quotePrefill: QuotePrefill | null;
  openQuote: (prefill?: QuotePrefill) => void;
  closeQuote: () => void;
}

const SiteModalsContext = createContext<SiteModalsContextValue | null>(null);

/** Provides global open/close state for the quote-request modal. */
export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quotePrefill, setQuotePrefill] = useState<QuotePrefill | null>(null);
  return (
    <SiteModalsContext.Provider
      value={{
        isQuoteOpen,
        quotePrefill,
        openQuote: (prefill?: QuotePrefill) => {
          setQuotePrefill(prefill ?? null);
          setIsQuoteOpen(true);
        },
        closeQuote: () => setIsQuoteOpen(false),
      }}
    >
      {children}
    </SiteModalsContext.Provider>
  );
}

export function useQuoteModal() {
  const ctx = useContext(SiteModalsContext);
  if (!ctx) throw new Error('useQuoteModal must be used within QuoteModalProvider');
  return ctx;
}
