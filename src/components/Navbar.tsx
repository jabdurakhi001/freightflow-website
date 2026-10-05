import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuoteModal } from '../QuoteContext';
import { EASE_BRAND } from '../lib/motion';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: (origin?: { x: number; y: number }) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const NAV_LINKS = [
  { href: '#solutions', label: 'Solutions' },
  { href: '#compliance', label: 'Compliance' },
  { href: '#ai-systems', label: 'Systems' },
  { href: '#fleet', label: 'Fleet' },
  { href: '#recruitment', label: 'Recruitment' },
  { href: '#faq', label: 'FAQ' },
];

export default function Navbar({ isDark, toggleTheme, mobileMenuOpen, setMobileMenuOpen }: NavbarProps) {
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { openQuote } = useQuoteModal();
  const menuRef = useRef<HTMLDivElement>(null);

  // Mobile menu: close on Escape, lock body scroll, and move focus to the first link.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    menuRef.current?.querySelector('a')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, setMobileMenuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sectionIds = NAV_LINKS.map((link) => link.href.replace('#', ''));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 w-full flex justify-between items-center px-5 sm:px-8 z-50 transition-all duration-300 ${
          scrolled ? 'py-3 glass shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]' : 'py-5 bg-transparent'
        }`}
      >
        <a href="#main-content" className="group text-xl font-black text-white tracking-tighter flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-secondary rotate-45 group-hover:rotate-[135deg] transition-transform duration-500" />
          <span><span>Freight</span><span className="gradient-text">Flow</span></span>
        </a>
        <div className="hidden lg:flex items-center gap-x-5 xl:gap-x-8">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'location' : undefined}
                className={`relative font-mono text-[11px] font-medium uppercase tracking-[0.14em] whitespace-nowrap pb-1 transition-colors ${
                  isActive ? 'text-secondary' : 'text-white/75 hover:text-white'
                }`}
              >
                {link.label}
                {/* One shared underline that glides between links as sections change */}
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-0 -bottom-px h-px bg-secondary"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  />
                )}
              </a>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={(e) => {
            // Wipe origin = button centre (also correct for keyboard activation, where clientX/Y are 0)
            const r = e.currentTarget.getBoundingClientRect();
            toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
          }} className="text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} type="button">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? 'sun' : 'moon'}
                className="block"
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.25, ease: EASE_BRAND }}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
          <button type="button" onClick={() => openQuote()} className="btn-premium hidden lg:inline-flex text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest active:scale-95">
            Request a Quote
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-white/80 hover:text-white p-2.5 rounded-full hover:bg-white/10 transition-colors" aria-label="Toggle menu" aria-expanded={mobileMenuOpen} type="button">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          ref={menuRef}
          role="navigation"
          aria-label="Mobile site menu"
          className="fixed inset-0 z-[45] bg-primary overflow-y-auto flex lg:hidden grain"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.35, ease: EASE_BRAND, delay: 0.05 } }}
          transition={{ duration: 0.45, ease: EASE_BRAND }}
        >
          <motion.div
            className="relative z-10 m-auto flex flex-col items-start gap-8 short:gap-3 py-24 short:py-16"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
              visible: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.a
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_BRAND } },
                }}
                key={link.href}
                className="group flex items-baseline gap-4 text-2xl short:text-lg font-black uppercase tracking-widest text-white hover:text-secondary transition-colors"
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="section-index !text-[0.7rem] text-white/30 group-hover:text-secondary transition-colors">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {link.label}
              </motion.a>
            ))}
            <motion.button
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_BRAND } },
              }}
              type="button"
              className="btn-premium mt-4 short:mt-2 text-white px-10 py-4 short:py-3 rounded-full font-bold text-sm uppercase tracking-widest"
              onClick={() => { setMobileMenuOpen(false); openQuote(); }}
            >
              Request a Quote
            </motion.button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
