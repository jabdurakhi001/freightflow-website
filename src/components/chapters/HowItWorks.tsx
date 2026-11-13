import { useEffect, useRef, useState } from 'react';
import { HOW } from '../../content';
import { useDriveMode, useDriveStill } from '../drive/DriveContext';
import { useReveal } from './Chapter';

/**
 * A pinned chapter: while it holds the screen, scrolling drives the truck through five gates on
 * the road and lights the matching step here. Without the scene (or with reduced motion) it's a
 * plain list at its natural height.
 */
export default function HowItWorks() {
  const mode = useDriveMode();
  const still = useDriveStill();
  const scrub = mode !== 'static' && mode !== 'pending' && !still;
  const sectionRef = useRef<HTMLElement>(null);
  const reveal = useReveal<HTMLDivElement>();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!scrub) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      setStep(Math.min(HOW.steps.length - 1, Math.floor(p * HOW.steps.length)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    read();
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [scrub]);

  return (
    <section id="how-it-works" ref={sectionRef} data-shot="how" {...(scrub ? { 'data-scrub': '' } : {})} className={`ch ch-left ch-how${scrub ? ' is-scrub' : ''}`} aria-labelledby="how-it-works-title">
      <div className="ch-pin">
        <div className="ch-in">
          <div ref={reveal} className="panel reveal">
            <p className="kicker"><span>02</span>How it works</p>
            <h2 id="how-it-works-title">{HOW.title}</h2>
            <p className="lede">{HOW.lede}</p>
            <ol className="steps">
              {HOW.steps.map((s, i) => (
                <li key={s.title} className={`${s.human ? 'hum ' : ''}${scrub ? (i === step ? 'on' : i < step ? 'done' : '') : 'on'}`}>
                  <span className="num" aria-hidden="true">{`0${i + 1}`}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            {scrub && <p className="cap">Keep scrolling: you’re driving. The orange gate is the dispatcher’s approval.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
