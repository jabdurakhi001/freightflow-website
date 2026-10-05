import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useQuoteModal } from '../../QuoteContext';
import { NAV } from '../../content';
import { EASE_BRAND } from '../../lib/motion';
import { ShieldMark, SignArrow } from '../ui/Signs';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: (origin?: { x: number; y: number }) => void;
}

export default function Header({ isDark, toggleTheme }: HeaderProps) {
  const { openQuote } = useQuoteModal();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight the section currently under the header.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-35% 0px -60% 0px' },
    );
    NAV.forEach(({ href }) => {
      const el = document.getElementById(href.slice(1));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Mobile menu: Escape closes, body scroll locks, focus moves into the menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    menuRef.current?.querySelector('a')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Over the hero video the header is light-on-dark; once scrolled it takes the page surface.
  const solid = scrolled || menuOpen;
  const ink = solid && !menuOpen ? 'text-on-surface' : 'text-white';

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,padding] duration-300 ${
          solid && !menuOpen
            ? 'bg-surface/88 py-2.5 shadow-[0_1px_0_var(--color-outline-variant)] backdrop-blur-xl'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <a href="#top" className={`group flex items-center gap-2.5 ${ink}`} aria-label="FreightFlow — back to top">
            <ShieldMark className="h-10 w-9 transition-transform duration-500 group-hover:-rotate-6" />
            <span className="text-[1.35rem] font-black tracking-[-0.03em]">FreightFlow</span>
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map(({ href, label }) => {
                const isActive = active === href.slice(1);
                return (
                  <li key={href}>
                    <a
                      href={href}
                      aria-current={isActive ? 'location' : undefined}
                      className={`relative block rounded-lg px-3 py-2 text-[0.95rem] font-bold transition-colors ${ink} ${
                        isActive ? '' : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-marker"
                          className="absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-cone"
                          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                        />
                      )}
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
              }}
              className={`grid h-11 w-11 place-items-center rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${ink}`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDark ? 'sun' : 'moon'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.22, ease: EASE_BRAND }}
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
            <button type="button" onClick={() => openQuote()} className="btn-cone hidden px-5 py-2.5 text-[0.95rem] sm:inline-flex">
              Get a quote
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className={`grid h-11 w-11 place-items-center rounded-lg lg:hidden ${ink}`}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            className="fixed inset-0 z-40 overflow-y-auto bg-sign-ink lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.3, ease: EASE_BRAND } }}
            transition={{ duration: 0.45, ease: EASE_BRAND }}
          >
            <motion.nav
              aria-label="Mobile"
              className="guide-sign mx-4 mb-8 mt-24 p-6 sm:mx-auto sm:max-w-md"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
            >
              <ul>
                {NAV.map(({ href, label }, i) => (
                  <motion.li
                    key={href}
                    variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE_BRAND } } }}
                    className={i ? 'border-t border-white/25' : ''}
                  >
                    <a
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between py-3.5 text-2xl font-black tracking-tight"
                    >
                      {label}
                      <SignArrow dir="right" className="h-6 w-5" />
                    </a>
                  </motion.li>
                ))}
              </ul>
              <motion.button
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openQuote();
                }}
                className="btn-cone mt-5 w-full px-6 py-3.5 text-lg"
              >
                Get a quote
              </motion.button>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
