import { useEffect, useRef, type ReactNode } from 'react';

/** Adds `.in` the first time the element scrolls into view, so its children can stagger in. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); } }, { rootMargin: '0px 0px -18% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

interface ChapterProps {
  id: string;
  /** which camera shot this chapter calls for (see src/drive/shots.ts) */
  shot: string;
  /** small numbered label above the title */
  n: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  /** which side of a wide screen the copy sits on; the scene takes the other */
  side?: 'left' | 'right';
  wide?: boolean;
  className?: string;
  children?: ReactNode;
}

/** One full-height chapter: a glass panel of copy over the scene. */
export default function Chapter({ id, shot, n, kicker, title, lede, side = 'left', wide, className, children }: ChapterProps) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id={id} data-shot={shot} className={`ch ch-${side}${className ? ` ${className}` : ''}`} aria-labelledby={`${id}-title`}>
      <div className="ch-in">
        <div ref={ref} className={`panel reveal${wide ? ' wide' : ''}`}>
          <p className="kicker"><span>{n}</span>{kicker}</p>
          <h2 id={`${id}-title`}>{title}</h2>
          {lede && <p className="lede">{lede}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
