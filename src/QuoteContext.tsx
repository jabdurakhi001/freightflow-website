import { createContext, useContext, useState, type ReactNode } from 'react';

interface QuoteModalContextValue {
  isQuoteOpen: boolean;
  openQuote: () => void;
  closeQuote: () => void;
}

const QuoteModalContext = createContext<QuoteModalContextValue | null>(null);

/** Provides global open/close state for the quote-request modal. */
export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  return (
    <QuoteModalContext.Provider
      value={{
        isQuoteOpen,
        openQuote: () => setIsQuoteOpen(true),
        closeQuote: () => setIsQuoteOpen(false),
      }}
    >
      {children}
    </QuoteModalContext.Provider>
  );
}

export function useQuoteModal() {
  const ctx = useContext(QuoteModalContext);
  if (!ctx) throw new Error('useQuoteModal must be used within QuoteModalProvider');
  return ctx;
}
