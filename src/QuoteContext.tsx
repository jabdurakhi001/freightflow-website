import { createContext, useContext, useState, type ReactNode } from 'react';

interface SiteModalsContextValue {
  isQuoteOpen: boolean;
  openQuote: () => void;
  closeQuote: () => void;
}

const SiteModalsContext = createContext<SiteModalsContextValue | null>(null);

/** Provides global open/close state for the quote-request modal. */
export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  return (
    <SiteModalsContext.Provider
      value={{
        isQuoteOpen,
        openQuote: () => setIsQuoteOpen(true),
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
