import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { MotionConfig } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustStrip from './components/TrustStrip';
import ComplianceSection from './components/ComplianceSection';
import SolutionsSection from './components/SolutionsSection';
import AISystemsSection from './components/AISystemsSection';
import HowItWorks from './components/HowItWorks';
import Comparison from './components/Comparison';
import FleetSection from './components/FleetSection';
import RecruitmentSection from './components/RecruitmentSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import LanesMarquee from './components/LanesMarquee';
import FAQSection from './components/FAQSection';
import QuoteModal from './components/QuoteModal';
import { QuoteModalProvider } from './QuoteContext';

export default function App() {
  // The inline script in index.html applies the 'dark' class before first paint;
  // React just picks up whatever is already on <html>.
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Follow live system-theme changes while no explicit choice is stored.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (localStorage.getItem('theme')) return;
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

  // Theme switch: where supported, wipe the new theme in as a circle growing
  // from the toggle button; otherwise (or with reduced motion) swap instantly.
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
        /* transition skipped — theme is already applied */
      });
  };

  return (
    <QuoteModalProvider>
    <MotionConfig reducedMotion="user">
    <div className="bg-surface text-on-surface font-body selection:bg-secondary-container selection:text-on-secondary-container min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-secondary focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:font-bold focus:text-sm">
        Skip to main content
      </a>

      <ScrollProgress />

      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main id="main-content">
        <Hero />
        <TrustStrip />
        <LanesMarquee />
        <SolutionsSection />
        <ComplianceSection />
        <AISystemsSection />
        <HowItWorks />
        <Comparison />
        <FleetSection />
        <RecruitmentSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
      <ChatWidget />
      <BackToTop />
      <QuoteModal />
    </div>
    </MotionConfig>
    </QuoteModalProvider>
  );
}
