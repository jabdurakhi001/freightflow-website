import { useEffect, useRef, useState } from 'react';

const STOPS = [
  { id: 'top', label: 'Start' }, { id: 'services', label: 'Services' }, { id: 'how-it-works', label: 'How it works' },
  { id: 'lanes', label: 'Lanes' }, { id: 'platform', label: 'Platform' }, { id: 'compliance', label: 'Compliance' },
  { id: 'fleet', label: 'Fleet' }, { id: 'drivers', label: 'Drivers' }, { id: 'faq', label: 'FAQ' }, { id: 'quote', label: 'Quote' },
];

/** The trip so far: a rail of stops down the right edge (wide screens), filled as the page scrolls. */
export default function RouteRail() {
  const [active, setActive] = useState('top');
  const fill = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let cur = STOPS[0].id, p = 0;
      STOPS.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top <= mid) { cur = s.id; p = (i + Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height)))) / STOPS.length; }
      });
      setActive(cur);
      if (fill.current) fill.current.style.transform = `scaleY(${Math.min(1, p).toFixed(4)})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    read();
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <nav className="rail" aria-label="Page progress">
      <span className="rail-line" aria-hidden="true"><span ref={fill} /></span>
      <ol>
        {STOPS.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={active === s.id ? 'location' : undefined}><i aria-hidden="true" /><span>{s.label}</span></a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
