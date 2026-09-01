import { useState, useEffect } from 'react';
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

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
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
