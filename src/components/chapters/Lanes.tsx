import { useEffect, useRef, useState } from 'react';
import { useQuoteModal } from '../../QuoteContext';
import { COMPANY, HERO } from '../../content';
import { CITY_NAMES, DEFAULT_DESTINATION, HUB, estimateLane, guessOrigin, shortName } from '../../lib/lanes';
import { useDrive } from '../drive/DriveContext';
import Chapter from './Chapter';

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** Road miles counting up (eased) whenever the lane changes; instant under reduced motion. */
function LaneAnswer({ from, to }: { from: string; to: string }) {
  const est = to ? estimateLane(from, to) : null;
  const [shown, setShown] = useState(est?.road ?? 0);
  useEffect(() => {
    if (!est) return;
    if (prefersReducedMotion()) { setShown(est.road); return; }
    let raf = 0;
    const t0 = performance.now(), dur = 1500, road = est.road;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      setShown(Math.round((road * e) / 10) * 10);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [est?.road, from, to]);

  if (!to) return <span className="wait">Pick a delivery city to see road miles and days.</span>;
  if (!est) return <span className="wait">Pickup and delivery are the same city. Try another lane.</span>;
  return (
    <>
      <span className="big">
        <span data-testid="lane-miles" aria-hidden="true">{shown.toLocaleString('en-US')}</span>
        <small aria-hidden="true">road miles</small>
        <span className="sr-only">{est.road.toLocaleString('en-US')} road miles.</span>
      </span>
      <span className="days" data-testid="lane-days">
        About {est.days} {est.days === 1 ? 'day' : 'days'} for a solo driver, {shortName(from)} to {shortName(to)}.
      </span>
    </>
  );
}

function CitySelect({ id, label, value, onChange, allowEmpty }: { id: string; label: string; value: string; onChange: (v: string) => void; allowEmpty?: boolean }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="sel">
        <span className={`sel-v${value ? '' : ' empty'}`} aria-hidden="true">{value ? shortName(value) : 'Choose a city'}</span>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {allowEmpty && <option value="">Choose a city</option>}
          {CITY_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </div>
    </div>
  );
}

/** The camera lifts off the truck and its spot becomes the Chicago hub on a map of the lower 48. */
export default function Lanes() {
  const { openQuote } = useQuoteModal();
  const drive = useDrive();
  const [from, setFrom] = useState(HUB);
  const [to, setTo] = useState(DEFAULT_DESTINATION);
  const [guessed, setGuessed] = useState(false);
  const touched = useRef(false);

  // Start the lane at the visitor's nearest listed city (approximate IP location), else Chicago.
  useEffect(() => {
    let live = true;
    guessOrigin().then((city) => {
      if (!live || !city || touched.current) return;
      setFrom(city);
      setTo((t) => (t === city ? (city === HUB ? DEFAULT_DESTINATION : HUB) : t));
      setGuessed(true);
    });
    return () => { live = false; };
  }, []);

  const lane = to && to !== from ? to : null;
  useEffect(() => drive.setLane(from, lane), [drive, from, lane]);

  return (
    <Chapter id="lanes" shot="lanes" n="03" kicker="Lanes" title="48 states, one hub." lede="All 48 contiguous states, dispatched from Chicago: high-frequency regional lanes and coast-to-coast long-haul.">
      <form className="lane" id="lane-estimate" onSubmit={(e) => e.preventDefault()} aria-label="Lane estimate">
        <p className="lane-q">{HERO.laneQuestion}</p>
        <div className="fields">
          <CitySelect id="lane-from" label="Pickup" value={from} onChange={(v) => { touched.current = true; setFrom(v); }} />
          <CitySelect id="lane-to" label="Delivery" value={to} onChange={(v) => { touched.current = true; setTo(v); }} allowEmpty />
        </div>
        <output className="answer" htmlFor="lane-from lane-to" aria-live="polite">
          <LaneAnswer from={from} to={to} />
        </output>
        <div className="lane-actions btn-row">
          <button type="button" className="btn solid" onClick={() => openQuote(lane ? { origin: from, destination: lane } : undefined)}>
            Ask for a quote on this lane
          </button>
        </div>
        <p className="method">
          {guessed
            ? 'Pickup picked from your approximate location. Change it to any listed city.'
            : `Starting from ${COMPANY.hub}, our dispatch hub. Change it to any listed city.`}{' '}
          {HERO.method} Lane drawn for illustration.
        </p>
      </form>
    </Chapter>
  );
}
