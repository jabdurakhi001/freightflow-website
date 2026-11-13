import { lazy, Suspense, useEffect, useState } from 'react';
import { QuoteModalProvider, useQuoteModal } from './QuoteContext';
import { DriveProvider, useDrive, useDriveMode, useDriveStill } from './components/drive/DriveContext';
import DriveCanvas from './components/drive/DriveCanvas';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/chapters/Hero';
import Services from './components/chapters/Services';
import HowItWorks from './components/chapters/HowItWorks';
import Lanes from './components/chapters/Lanes';
import Platform from './components/chapters/Platform';
import Compliance from './components/chapters/Compliance';
import Fleet from './components/chapters/Fleet';
import Drivers from './components/chapters/Drivers';
import FAQ from './components/chapters/FAQ';
import QuoteCta from './components/chapters/QuoteCta';
import RouteRail from './components/chapters/RouteRail';

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
  const mode = useDriveMode();
  const still = useDriveStill();
  const drive = useDrive();
  const { isQuoteOpen } = useQuoteModal();
  // Nothing animates behind the quote form: keeps it responsive on slow GPUs.
  useEffect(() => drive.setPaused(isQuoteOpen), [drive, isQuoteOpen]);
  const overlays = useOverlaysReady(isQuoteOpen);
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <DriveCanvas />
      <div className={`site${mode === 'static' ? ' is-static' : ''}${still ? ' is-still' : ''}`}>
        <Header />
        <main id="main">
          <Hero />
          <Services />
          <HowItWorks />
          <Lanes />
          <Platform />
          <Compliance />
          <Fleet />
          <Drivers />
          <FAQ />
          <QuoteCta />
        </main>
        <Footer />
        <RouteRail />
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
      <DriveProvider>
        <Page />
      </DriveProvider>
    </QuoteModalProvider>
  );
}
