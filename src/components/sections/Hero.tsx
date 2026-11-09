import { useEffect, useRef, useState } from 'react';
import { useQuoteModal } from '../../QuoteContext';
import { COMPANY, HERO } from '../../content';
import { CITIES, CITY_NAMES, DEFAULT_DESTINATION, HUB, estimateLane, guessOrigin, shortName } from '../../lib/lanes';
import { useFlowBridge, useFlowMode, useFlowSection, useLaneGeometry } from '../flow/FlowContext';
import type { LaneGeometry } from '../flow/bridge';
import { MAP_H, MAP_W, laneControl, projectAlbers } from '../flow/projection';

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

/**
 * The outline as dots and the lane as a drawn arc. Shown from first paint (index.html preloads
 * the outline), kept as the fallback without canvas or with save-data, and faded out once the
 * live particle field has formed the map.
 */
function StaticMap({ geometry, hidden }: { geometry: LaneGeometry | null; hidden: boolean }) {
  const [d, setD] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    fetch('/flow/us48.json').then((r) => (r.ok ? r.json() : null)).then((j) => live && j && setD(j.d)).catch(() => {});
    return () => { live = false; };
  }, []);
  const p1 = geometry?.p1, p2 = geometry?.p2;
  const c = p1 && p2 ? laneControl(p1, p2) : null;
  return (
    <svg className={`map-static${hidden ? ' is-gone' : ''}`} viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="ff-dots" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="1.2" fill="rgba(214,222,236,0.42)" />
        </pattern>
        <pattern id="ff-dots-lg" width="15" height="15" patternUnits="userSpaceOnUse">
          <circle cx="7.5" cy="7.5" r="3" fill="rgba(214,222,236,0.5)" />
        </pattern>
        <linearGradient id="ff-lane" x1="0" x2="1">
          <stop offset="0" stopColor="#ffcc99" />
          <stop offset="1" stopColor="#f26b1d" />
        </linearGradient>
      </defs>
      {d && <path className="land land-sm" d={d} fill="url(#ff-dots)" />}
      {d && <path className="land land-lg" d={d} fill="url(#ff-dots-lg)" />}
      {p1 && p2 && c && (
        <path d={`M${p1[0]} ${p1[1]}Q${c[0]} ${c[1]} ${p2[0]} ${p2[1]}`} fill="none" stroke="url(#ff-lane)" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      )}
    </svg>
  );
}

function MapMarkers({ geometry, from, to }: { geometry: LaneGeometry | null; from: string; to: string }) {
  if (!geometry) return null;
  const { p1, p2 } = geometry;
  const up = p2 ? p1[1] <= p2[1] : true;
  const reduce = prefersReducedMotion();
  const pct = (p: [number, number]) => ({ x: (p[0] / MAP_W) * 100, y: (p[1] / MAP_H) * 100 });
  const label = (p: [number, number], name: string, above: boolean, key: string) => {
    const { x, y } = pct(p);
    const right = x < 80;
    return (
      <span
        key={`${key}-${name}`}
        className="ml"
        style={{
          left: `calc(${x}% ${right ? '+' : '-'} 12px)`,
          top: `calc(${y}% ${above ? '- 26px' : '+ 8px'})`,
          transform: right ? 'none' : 'translateX(-100%)',
        }}
      >
        {name}
      </span>
    );
  };
  const a = pct(p1);
  return (
    <div className="map-labels">
      <span key={`mkA-${from}`} className={`mk${!p2 && !reduce ? ' pulse' : ''}`} style={{ left: `${a.x}%`, top: `${a.y}%` }} />
      {label(p1, shortName(from), up, 'mlA')}
      {p2 && to && (
        <>
          <span key={`mkB-${to}`} className="mk to" style={{ left: `${pct(p2).x}%`, top: `${pct(p2).y}%` }} />
          {label(p2, shortName(to), !up, 'mlB')}
        </>
      )}
    </div>
  );
}

export default function Hero() {
  const { openQuote } = useQuoteModal();
  const bridge = useFlowBridge();
  const mode = useFlowMode();
  const engineGeometry = useLaneGeometry();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useFlowSection('hero', sectionRef, stageRef);

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
  useEffect(() => bridge.setLane(from, lane), [bridge, from, lane]);

  // Straight projection, available at first paint. Once the live field has its outline it
  // reports endpoints nudged onto land, and the static art crossfades out under the particles.
  const directGeometry: LaneGeometry | null = CITIES[from] ? { p1: projectAlbers(CITIES[from]), p2: lane ? projectAlbers(CITIES[lane]) : null } : null;
  const live = mode !== 'static' && mode !== 'pending' && !!engineGeometry;
  const geometry = live ? engineGeometry : directGeometry;

  return (
    <section id="top" ref={sectionRef} className="hero sec" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title">
            Full truckload freight, <b>flowing</b> across the 48&nbsp;states.
          </h1>
          <p className="lede">{HERO.lede}</p>

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
              {HERO.method}
            </p>
          </form>
        </div>

        <div className="map-stage stage" ref={stageRef} aria-hidden="true">
          <StaticMap geometry={directGeometry} hidden={live} />
          <MapMarkers geometry={geometry} from={from} to={lane ?? ''} />
          <span className="map-note">Lane drawn for illustration</span>
        </div>
      </div>
    </section>
  );
}
