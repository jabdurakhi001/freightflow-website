import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/** Optional lane details to pre-fill when the quote form opens (e.g. from the hero lane picker). */
export interface QuotePrefill {
  origin?: string;
  destination?: string;
}

interface SiteModalsContextValue {
  isQuoteOpen: boolean;
  prefill: QuotePrefill | null;
  openQuote: (prefill?: QuotePrefill) => void;
  closeQuote: () => void;
}

const SiteModalsContext = createContext<SiteModalsContextValue | null>(null);

/** Provides global open/close state for the quote-request modal. */
export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [prefill, setPrefill] = useState<QuotePrefill | null>(null);
  const openQuote = useCallback((p?: QuotePrefill) => {
    setPrefill(p ?? null);
    setIsQuoteOpen(true);
  }, []);
  const closeQuote = useCallback(() => setIsQuoteOpen(false), []);
  const value = useMemo(() => ({ isQuoteOpen, prefill, openQuote, closeQuote }), [isQuoteOpen, prefill, openQuote, closeQuote]);
  return <SiteModalsContext.Provider value={value}>{children}</SiteModalsContext.Provider>;
}

export function useQuoteModal() {
  const ctx = useContext(SiteModalsContext);
  if (!ctx) throw new Error('useQuoteModal must be used within QuoteModalProvider');
  return ctx;
}
