import { useEffect, useRef, useState } from 'react';
import { useQuoteModal } from '../../QuoteContext';
import { NAV } from '../../content';
import Logo from '../Logo';

const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * Sticky, translucent navy bar. Below 960px the links fold into a full-height opaque menu
 * that locks page scroll and keeps keyboard focus inside until it closes.
 */
export default function Header() {
  const { openQuote } = useQuoteModal();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const navRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Mark the section under the reading line as current. The hero (#top) and the closing
  // quote section aren't nav items; observing them clears the highlight there.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-35% 0px -60% 0px' },
    );
    ['#top', ...NAV.map((n) => n.href), '#quote'].forEach((href) => {
      const el = document.getElementById(href.slice(1));
      if (el) observer.observe(el);
    });
    // At the bottom of the page the closing section may never reach the reading line;
    // once most of it is on screen, it counts as current (no nav item lit).
    const quote = document.getElementById('quote');
    const end = new IntersectionObserver(([e]) => e.isIntersecting && setActive('quote'), { threshold: 0.6 });
    if (quote) end.observe(quote);
    return () => { observer.disconnect(); end.disconnect(); };
  }, []);

  useEffect(() => {
    if (!open) return;
    // Lock page scroll without touching layout (overflow:hidden on <html> makes mobile browsers
    // jump and can unstick the header): swallow wheel/touch scrolling outside the menu sheet.
    const block = (e: Event) => { if (!navRef.current?.contains(e.target as Node)) e.preventDefault(); };
    document.addEventListener('wheel', block, { passive: false });
    document.addEventListener('touchmove', block, { passive: false });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus({ preventScroll: true });
        return;
      }
      if (e.key !== 'Tab' || !navRef.current || !btnRef.current) return;
      // Trap focus across the menu button and the menu's links.
      const items = [btnRef.current, ...navRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    navRef.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('wheel', block);
      document.removeEventListener('touchmove', block);
    };
  }, [open]);

  // Widening past the breakpoint with the menu open would leave it stuck open.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 960px)');
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <header className="top">
      <div className="top-in">
        <a className="brand" href="#top" aria-label="FreightFlow Logistics, back to top">
          <Logo />
        </a>
        <button
          ref={btnRef}
          className="menu"
          type="button"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
        <nav ref={navRef} className={`nav${open ? ' open' : ''}`} id="site-nav" aria-label="Main">
          <ul>
            {NAV.map(({ href, label }) => (
              <li key={href}>
                <a href={href} aria-current={active === href.slice(1) ? 'location' : undefined} onClick={() => setOpen(false)}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="quote"
            onClick={() => {
              setOpen(false);
              openQuote();
            }}
          >
            Get a quote
          </button>
        </nav>
      </div>
    </header>
  );
}
