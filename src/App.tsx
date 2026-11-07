import { lazy, Suspense, useEffect, useState } from 'react';
import { QuoteModalProvider, useQuoteModal } from './QuoteContext';
import { FlowProvider, useFlowBridge, useFlowMode } from './components/flow/FlowContext';
import ParticleField from './components/flow/ParticleField';
import Header from './components/sections/Header';
import Hero from './components/sections/Hero';
import Services from './components/sections/Services';
import HowItWorks from './components/sections/HowItWorks';
import Platform from './components/sections/Platform';
import Compliance from './components/sections/Compliance';
import Fleet from './components/sections/Fleet';
import Drivers from './components/sections/Drivers';
import FAQ from './components/sections/FAQ';
import QuoteCta from './components/sections/QuoteCta';
import Footer from './components/sections/Footer';

const Overlays = lazy(() => import('./components/Overlays'));

/** Mount the overlays once the first paint is done, or straight away if a quote is requested first. */
function useOverlaysReady(force: boolean) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ready) return;
    if (force) { setReady(true); return; }
    let raf = 0;
    const go = () => { raf = requestAnimationFrame(() => setReady(true)); };
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    return () => { window.removeEventListener('load', go); cancelAnimationFrame(raf); };
  }, [force, ready]);
  return ready;
}

function Page() {
  const mode = useFlowMode();
  const bridge = useFlowBridge();
  const { isQuoteOpen } = useQuoteModal();
  // Nothing animates behind the quote form: keeps it responsive on slow GPUs.
  useEffect(() => bridge.setPaused(isQuoteOpen), [bridge, isQuoteOpen]);
  const overlays = useOverlaysReady(isQuoteOpen);
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <ParticleField />
      <div className={`site${mode === 'static' ? ' is-static' : ''}`}>
        <Header />
        <main id="main">
          <Hero />
          <Services />
          <HowItWorks />
          <Platform />
          <Compliance />
          <Fleet />
          <Drivers />
          <FAQ />
          <QuoteCta />
        </main>
        <Footer />
      </div>
      {overlays && (
        <Suspense fallback={null}>
          <Overlays />
        </Suspense>
      )}
    </>
  );
}

export default function App() {
  return (
    <QuoteModalProvider>
      <FlowProvider>
        <Page />
      </FlowProvider>
    </QuoteModalProvider>
  );
}
