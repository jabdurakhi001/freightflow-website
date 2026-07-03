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
  isApplyOpen: boolean;
  openApply: () => void;
  closeApply: () => void;
}

const SiteModalsContext = createContext<SiteModalsContextValue | null>(null);

/** Provides global open/close state for the quote-request and driver-application modals. */
export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quotePrefill, setQuotePrefill] = useState<QuotePrefill | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
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
        isApplyOpen,
        openApply: () => setIsApplyOpen(true),
        closeApply: () => setIsApplyOpen(false),
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
