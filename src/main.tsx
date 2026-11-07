import { StrictMode, Component, type ReactNode, type ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps { children: ReactNode }
interface ErrorBoundaryState { hasError: boolean }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh items-center justify-center bg-ink p-8 text-paper">
          <div className="text-center max-w-md">
            <h1 className="mb-4 font-display text-3xl font-light">Something went wrong</h1>
            <p className="mb-6 text-muted">We're experiencing a temporary issue. Please refresh the page.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn solid"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
