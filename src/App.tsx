import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { MotionConfig } from 'motion/react';
import { QuoteModalProvider } from './QuoteContext';
import Header from './components/sections/Header';
import Hero from './components/sections/Hero';
import MileMarkers from './components/sections/MileMarkers';
import Services from './components/sections/Services';
import LoadRoute from './components/sections/LoadRoute';
import Compliance from './components/sections/Compliance';
import SystemsBoard from './components/sections/SystemsBoard';
import Fleet from './components/sections/Fleet';
import Drivers from './components/sections/Drivers';
import FAQ from './components/sections/FAQ';
import FinalExit from './components/sections/FinalExit';
import Footer from './components/sections/Footer';
import ChatWidget from './components/ChatWidget';
import QuoteModal from './components/QuoteModal';

export default function App() {
  // index.html applies the 'dark' class before first paint; React picks it up from <html>.
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Follow live system-theme changes while no explicit choice is stored.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      try {
        if (localStorage.getItem('theme')) return;
      } catch {
        /* storage unavailable */
      }
      document.documentElement.classList.toggle('dark', mq.matches);
      setIsDark(mq.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const applyTheme = (dark: boolean) => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      /* storage unavailable */
    }
    setIsDark(dark);
  };

  // Theme switch: a circular wipe from the toggle where View Transitions are
  // supported; an instant swap otherwise or under reduced motion.
  const toggleTheme = (origin?: { x: number; y: number }) => {
    const next = !isDark;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) {
      applyTheme(next);
      return;
    }
    const x = origin?.x ?? window.innerWidth - 40;
    const y = origin?.y ?? 40;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = document.startViewTransition(() => {
      flushSync(() => applyTheme(next));
    });
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 550, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
        );
      })
      .catch(() => {
        /* transition skipped — theme already applied */
      });
  };

  return (
    <QuoteModalProvider>
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-surface font-body text-on-surface">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-lg focus:bg-cone focus:px-4 focus:py-2 focus:font-bold focus:text-[#0f1512]"
          >
            Skip to main content
          </a>

          <Header isDark={isDark} toggleTheme={toggleTheme} />

          <main id="main-content">
            <Hero />
            <MileMarkers />
            <Services />
            <LoadRoute />
            <Compliance />
            <SystemsBoard />
            <Fleet />
            <Drivers />
            <FAQ />
            <FinalExit />
          </main>

          <Footer />
          <ChatWidget />
          <QuoteModal />
        </div>
      </MotionConfig>
    </QuoteModalProvider>
  );
}
