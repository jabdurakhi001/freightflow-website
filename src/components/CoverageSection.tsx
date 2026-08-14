import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowLeftRight, MapPin, Route, Clock } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import { useQuoteModal } from '../QuoteContext';

// City nodes plotted on a real equirectangular projection of the lower 48, so
// relative positions are geographically true without needing a map outline.
interface City {
  name: string;
  state: string;
  lat: number;
  lon: number;
  hub?: boolean;
}

const CITIES: City[] = [
  { name: 'Seattle', state: 'WA', lat: 47.61, lon: -122.33 },
  { name: 'Portland', state: 'OR', lat: 45.52, lon: -122.68 },
  { name: 'Salt Lake City', state: 'UT', lat: 40.76, lon: -111.89 },
  { name: 'Los Angeles', state: 'CA', lat: 34.05, lon: -118.24 },
  { name: 'Phoenix', state: 'AZ', lat: 33.45, lon: -112.07 },
  { name: 'Denver', state: 'CO', lat: 39.74, lon: -104.99 },
  { name: 'Dallas', state: 'TX', lat: 32.78, lon: -96.8, hub: true },
  { name: 'Houston', state: 'TX', lat: 29.76, lon: -95.37 },
  { name: 'Kansas City', state: 'MO', lat: 39.1, lon: -94.58 },
  { name: 'Minneapolis', state: 'MN', lat: 44.98, lon: -93.27 },
  { name: 'St. Louis', state: 'MO', lat: 38.63, lon: -90.2 },
  { name: 'Chicago', state: 'IL', lat: 41.88, lon: -87.63, hub: true },
  { name: 'Indianapolis', state: 'IN', lat: 39.77, lon: -86.16 },
  { name: 'Nashville', state: 'TN', lat: 36.16, lon: -86.78 },
  { name: 'Columbus', state: 'OH', lat: 39.96, lon: -83.0 },
  { name: 'Atlanta', state: 'GA', lat: 33.75, lon: -84.39 },
  { name: 'Charlotte', state: 'NC', lat: 35.23, lon: -80.84 },
  { name: 'Miami', state: 'FL', lat: 25.76, lon: -80.19 },
];

// The corridors advertised in the lanes marquee, drawn as animated arcs.
const LANES: Array<[string, string]> = [
  ['Chicago', 'Dallas'],
  ['Atlanta', 'Miami'],
  ['Denver', 'Phoenix'],
  ['Columbus', 'Nashville'],
  ['Kansas City', 'Houston'],
  ['Minneapolis', 'St. Louis'],
  ['Indianapolis', 'Charlotte'],
  ['Salt Lake City', 'Portland'],
];

const W = 1000;
const H = 560;
// Continental-US bounds with a little padding for labels.
const LON_MIN = -125.5;
const LON_MAX = -66.5;
const LAT_MIN = 24;
const LAT_MAX = 50;

const px = (lon: number) => ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * W;
const py = (lat: number) => ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H;

const cityByName = new Map(CITIES.map((c) => [c.name, c]));

// Hand-tuned label placement for nodes whose default above-the-dot label collides
// with a neighbor (Pacific Northwest pair, Midwest cluster).
const LABEL_POS: Record<string, { dx?: number; dy?: number; anchor?: 'start' | 'middle' | 'end' }> = {
  Portland: { dy: 22 },
  Minneapolis: { dy: 22 },
  'St. Louis': { dy: 20 },
  Indianapolis: { dy: 22 },
  Columbus: { dx: 12, dy: 4, anchor: 'start' },
  'Kansas City': { dx: -12, dy: 4, anchor: 'end' },
};

/** Great-circle distance in statute miles. */
function haversineMiles(a: City, b: City) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(s));
}

// Straight-line to road-miles factor; interstate routes average ~15-20% longer.
const ROAD_FACTOR = 1.18;
// Practical solo-driver planning pace under HOS (11h driving cap, real-world speeds).
const SOLO_MILES_PER_DAY = 550;

function arcPath(a: City, b: City) {
  const x1 = px(a.lon);
  const y1 = py(a.lat);
  const x2 = px(b.lon);
  const y2 = py(b.lat);
  // Curve control point: lift the midpoint perpendicular to the chord.
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const lift = Math.min(48, len * 0.18);
  const cx = mx - (dy / len) * lift;
  const cy = my + (dx / len) * lift;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

/** True below the given viewport width; SVG text doesn't scale with CSS, so the
 * map switches to fewer, larger labels on phones. */
function useCompactMap() {
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 640
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = () => setCompact(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return compact;
}

export default function CoverageSection() {
  const { openQuote } = useQuoteModal();
  const reduceMotion = useReducedMotion();
  const compact = useCompactMap();
  const [hovered, setHovered] = useState<string | null>(null);
  const [origin, setOrigin] = useState('Chicago');
  const [destination, setDestination] = useState('Dallas');

  const estimate = useMemo(() => {
    const a = cityByName.get(origin);
    const b = cityByName.get(destination);
    if (!a || !b || a === b) return null;
    const miles = Math.round((haversineMiles(a, b) * ROAD_FACTOR) / 5) * 5;
    const days = Math.max(1, Math.ceil(miles / SOLO_MILES_PER_DAY));
    return { miles, days };
  }, [origin, destination]);

  const selectedPair: [string, string] | null =
    origin !== destination ? [origin, destination] : null;

  const laneIsSelected = (a: string, b: string) =>
    selectedPair !== null &&
    ((a === selectedPair[0] && b === selectedPair[1]) ||
      (a === selectedPair[1] && b === selectedPair[0]));

  const laneTouches = (a: string, b: string, city: string | null) =>
    city !== null && (a === city || b === city);

  const selectedIsListedLane = LANES.some(([a, b]) => laneIsSelected(a, b));

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  // Selecting a city routes to it; selecting the current destination swaps the lane.
  const routeToCity = (name: string) => {
    if (name === origin) return;
    if (name === destination) swap();
    else setDestination(name);
  };

  const selectClass =
    'w-full appearance-none rounded-lg bg-white/[0.06] border border-white/15 px-3.5 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/40 cursor-pointer [&>option]:text-primary';

  return (
    <section id="coverage" className="py-24 bg-primary grain relative overflow-hidden">
      {/* soft radial glow behind the map */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(60% 50% at 35% 45%, rgba(255,90,31,0.07), transparent 70%)',
        }}
      />
      <div className="max-w-7xl mx-auto px-8 relative">
        <SectionHeading
          light
          eyebrow="Coverage Network"
          title="One Network. Forty-Eight States."
          subtitle="Anchored in Chicago and Dallas, running high-frequency corridors coast to coast. Pick a lane to see it on the network."
          className="mb-14"
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          {/* ---------- Map ---------- */}
          <Reveal direction="right" className="lg:col-span-3">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              role="group"
              aria-label="Map of FreightFlow's coverage network across the lower 48 states. City markers are buttons that route the lane estimator."
              className="w-full h-auto select-none"
            >
              <defs>
                <radialGradient id="ff-hub-glow" r="50%">
                  <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* subtle graticule so the panel reads as a map, not a chart */}
              {Array.from({ length: 7 }, (_, i) => (
                <line
                  key={`gv-${i}`}
                  x1={((i + 1) * W) / 8}
                  y1="0"
                  x2={((i + 1) * W) / 8}
                  y2={H}
                  stroke="white"
                  strokeOpacity="0.045"
                />
              ))}
              {Array.from({ length: 4 }, (_, i) => (
                <line
                  key={`gh-${i}`}
                  x1="0"
                  y1={((i + 1) * H) / 5}
                  x2={W}
                  y2={((i + 1) * H) / 5}
                  stroke="white"
                  strokeOpacity="0.045"
                />
              ))}

              {/* corridors */}
              {LANES.map(([a, b]) => {
                const ca = cityByName.get(a)!;
                const cb = cityByName.get(b)!;
                const active = laneIsSelected(a, b) || laneTouches(a, b, hovered);
                const dimmed =
                  (hovered !== null || selectedPair !== null) && !active;
                const s = compact ? 2 : 1;
                return (
                  <g key={`${a}-${b}`}>
                    <path
                      d={arcPath(ca, cb)}
                      fill="none"
                      stroke={active ? '#FF5A1F' : '#94A3B8'}
                      strokeOpacity={active ? 0.95 : dimmed ? 0.15 : 0.55}
                      strokeWidth={(active ? 2.5 : 1.7) * s}
                      strokeLinecap="round"
                      strokeDasharray={`${2 * s} ${8 * s}`}
                      className={reduceMotion ? undefined : compact ? 'ff-lane-flow-lg' : 'ff-lane-flow'}
                      style={{ transition: 'stroke-opacity 0.3s, stroke 0.3s' }}
                    />
                  </g>
                );
              })}

              {/* the selected estimator pair, drawn solid when it isn't a listed corridor */}
              {selectedPair && !selectedIsListedLane && (
                <path
                  d={arcPath(cityByName.get(selectedPair[0])!, cityByName.get(selectedPair[1])!)}
                  fill="none"
                  stroke="#FF5A1F"
                  strokeOpacity="0.95"
                  strokeWidth={2.5 * (compact ? 2 : 1)}
                  strokeLinecap="round"
                  strokeDasharray={compact ? '4 16' : '2 8'}
                  className={reduceMotion ? undefined : compact ? 'ff-lane-flow-lg' : 'ff-lane-flow'}
                />
              )}

              {/* city nodes */}
              {CITIES.map((c) => {
                const x = px(c.lon);
                const y = py(c.lat);
                const isEndpoint = c.name === origin || c.name === destination;
                const isHovered = hovered === c.name;
                const emphasized = c.hub || isEndpoint || isHovered;
                // Phones: keep every tappable dot but only label hubs/endpoints, larger.
                const showLabel = !compact || emphasized;
                const s = compact ? 2 : 1;
                return (
                  <g
                    key={c.name}
                    tabIndex={0}
                    role="button"
                    aria-label={`Route to ${c.name}, ${c.state}`}
                    onMouseEnter={() => setHovered(c.name)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(c.name)}
                    onBlur={() => setHovered(null)}
                    onClick={() => routeToCity(c.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        routeToCity(c.name);
                      }
                    }}
                    className="cursor-pointer ff-city-node"
                  >
                    {c.hub && <circle cx={x} cy={y} r={26 * s} fill="url(#ff-hub-glow)" />}
                    <circle
                      cx={x}
                      cy={y}
                      r={(emphasized ? 6 : 4) * s}
                      fill={isEndpoint ? '#FF5A1F' : c.hub ? '#FF8A5B' : '#CBD5E1'}
                      stroke="#0A1128"
                      strokeWidth={1.5 * s}
                      style={{ transition: 'r 0.2s, fill 0.2s' }}
                    />
                    {/* generous invisible hit target */}
                    <circle cx={x} cy={y} r={16 * s} fill="transparent" />
                    {showLabel && (
                      <text
                        x={x + (LABEL_POS[c.name]?.dx ?? 0) * s}
                        y={y + (LABEL_POS[c.name]?.dy ?? -12) * s}
                        textAnchor={LABEL_POS[c.name]?.anchor ?? 'middle'}
                        className="pointer-events-none"
                        fill={emphasized ? '#FFFFFF' : '#94A3B8'}
                        fontSize={(emphasized ? 13 : 11) * s}
                        fontWeight={emphasized ? 800 : 600}
                        style={{ transition: 'fill 0.2s' }}
                      >
                        {c.name}
                      </text>
                    )}
                    {c.hub && (
                      <text
                        x={x}
                        y={y + 22 * s}
                        textAnchor="middle"
                        className="pointer-events-none"
                        fill="#FF8A5B"
                        fontSize={9 * s}
                        fontWeight={800}
                        letterSpacing="0.15em"
                      >
                        HUB
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            <p className="mt-3 text-[11px] uppercase tracking-[0.2em] font-bold text-white/60 text-center">
              Tap any city to route it · Orange markers are dispatch hubs
            </p>
          </Reveal>

          {/* ---------- Transit estimator ---------- */}
          <Reveal direction="left" className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-7 md:p-8">
              <h3 className="flex items-center gap-2.5 text-white font-black text-xl tracking-tight mb-1.5">
                <Route className="w-5 h-5 text-secondary" />
                Lane Estimator
              </h3>
              <p className="text-sm text-white/55 leading-relaxed mb-6">
                Road miles and planning transit for any pair on the network.
              </p>

              <div className="space-y-3">
                <div>
                  <label htmlFor="cov-origin" className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45 mb-1.5">
                    Origin
                  </label>
                  <select id="cov-origin" value={origin} onChange={(e) => setOrigin(e.target.value)} className={selectClass}>
                    {CITIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}, {c.state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-center -my-1.5 relative z-10">
                  <button
                    type="button"
                    onClick={swap}
                    aria-label="Swap origin and destination"
                    className="rounded-full border border-white/15 bg-primary p-2 text-white/60 hover:text-secondary hover:border-secondary/50 transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 rotate-90" />
                  </button>
                </div>

                <div>
                  <label htmlFor="cov-dest" className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45 mb-1.5">
                    Destination
                  </label>
                  <select id="cov-dest" value={destination} onChange={(e) => setDestination(e.target.value)} className={selectClass}>
                    {CITIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}, {c.state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3" aria-live="polite">
                <div className="rounded-xl bg-white/[0.05] border border-white/10 p-4">
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                    <MapPin className="w-3 h-3 text-secondary" /> Road Miles
                  </span>
                  <p className="mt-1 text-2xl font-black text-white tabular-nums">
                    {estimate ? `≈ ${estimate.miles.toLocaleString()}` : '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.05] border border-white/10 p-4">
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                    <Clock className="w-3 h-3 text-secondary" /> Transit
                  </span>
                  <p className="mt-1 text-2xl font-black text-white tabular-nums">
                    {estimate ? `${estimate.days} day${estimate.days > 1 ? 's' : ''}` : '—'}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-white/60 leading-relaxed">
                {estimate
                  ? 'Planning estimate: interstate routing, solo driver under federal HOS limits. Your quote confirms the exact schedule.'
                  : 'Pick two different cities to see the lane.'}
              </p>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={!estimate}
                onClick={() =>
                  openQuote({
                    origin: `${origin}, ${cityByName.get(origin)?.state ?? ''}`,
                    destination: `${destination}, ${cityByName.get(destination)?.state ?? ''}`,
                  })
                }
                className="btn-premium group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-widest text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Quote This Lane
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
