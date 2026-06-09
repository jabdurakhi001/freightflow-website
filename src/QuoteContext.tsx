import { createContext, useContext, useState, type ReactNode } from 'react';

interface SiteModalsContextValue {
  isQuoteOpen: boolean;
  openQuote: () => void;
  closeQuote: () => void;
  isApplyOpen: boolean;
  openApply: () => void;
  closeApply: () => void;
}

const SiteModalsContext = createContext<SiteModalsContextValue | null>(null);

/** Provides global open/close state for the quote-request and driver-application modals. */
export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  return (
    <SiteModalsContext.Provider
      value={{
        isQuoteOpen,
        openQuote: () => setIsQuoteOpen(true),
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
