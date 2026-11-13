import { useQuoteModal } from '../../QuoteContext';
import { COMPANY, HERO } from '../../content';
import { useDrive, useDriveMode } from '../drive/DriveContext';

const WORDS: { t: string; b?: boolean }[] = [
  { t: 'Full' }, { t: 'truckload' }, { t: 'freight,' }, { t: 'flowing', b: true }, { t: 'across' }, { t: 'the' }, { t: '48 states.' },
];

export default function Hero() {
  const { openQuote } = useQuoteModal();
  const drive = useDrive();
  const mode = useDriveMode();
  return (
    <section id="top" data-shot="hero" className="ch ch-left ch-hero" aria-labelledby="hero-title">
      <div className="ch-in">
        <div className="hero-copy">
          <p className="kicker rise" style={{ '--i': 0 } as React.CSSProperties}><span>Full-truckload carrier</span>{COMPANY.hub}, IL</p>
          <h1 id="hero-title" aria-label="Full truckload freight, flowing across the 48 states.">
            {WORDS.map((w, i) => (
              <span key={i} aria-hidden="true"><span className="w"><span style={{ '--i': i + 1 } as React.CSSProperties}>{w.b ? <b>{w.t}</b> : w.t}</span></span>{' '}</span>
            ))}
          </h1>
          <p className="lede rise" style={{ '--i': 9 } as React.CSSProperties}>{HERO.lede}</p>
          <div className="btn-row rise" style={{ '--i': 10 } as React.CSSProperties}>
            <button type="button" className="btn solid" onClick={() => openQuote()}>Get a quote</button>
            <a className="btn" href="#lanes">Plan a lane</a>
          </div>
          <dl className="hero-facts rise" style={{ '--i': 11 } as React.CSSProperties}>
            <div><dt>USDOT</dt><dd>{COMPANY.usdot}</dd></div>
            <div><dt>MC</dt><dd>{COMPANY.mc}</dd></div>
            <div><dt>Dispatch desk</dt><dd>{COMPANY.hours}</dd></div>
          </dl>
        </div>
      </div>
      {mode !== 'static' && mode !== 'pending' && (
        <button type="button" className="beams" onClick={() => drive.flash()}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5a7 7 0 0 0 0 14c1.5 0 2-3 2-7s-.5-7-2-7ZM14 7l7-2M14.5 12H22M14 17l7 2" /></svg>
          Flash the high beams
        </button>
      )}
      <a className="cue" href="#services"><span aria-hidden="true" />Scroll to ride along</a>
    </section>
  );
}
