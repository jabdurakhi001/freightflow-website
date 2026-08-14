import { ArrowRight } from 'lucide-react';

const LANES = [
  ['Chicago', 'Dallas'],
  ['Atlanta', 'Miami'],
  ['Denver', 'Phoenix'],
  ['Columbus', 'Nashville'],
  ['Kansas City', 'Houston'],
  ['Minneapolis', 'St. Louis'],
  ['Indianapolis', 'Charlotte'],
  ['Salt Lake City', 'Portland'],
];

function LaneList() {
  return (
    <>
      {LANES.map(([from, to]) => (
        <span key={`${from}-${to}`} className="inline-flex items-center gap-3 px-8 text-sm font-bold uppercase tracking-[0.2em] whitespace-nowrap">
          <span className="text-on-surface-variant">{from}</span>
          <ArrowRight className="w-4 h-4 text-secondary shrink-0" aria-hidden="true" />
          <span className="text-on-surface-variant">{to}</span>
          <span className="ml-8 w-1.5 h-1.5 rounded-full bg-secondary/40 shrink-0" aria-hidden="true" />
        </span>
      ))}
    </>
  );
}

/** Infinite scrolling strip of major corridors. Pauses on hover; static under reduced motion. */
export default function LanesMarquee() {
  return (
    <section className="py-10 bg-surface border-y border-outline-variant/20" aria-label="Major freight corridors we cover">
      <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60 mb-6">
        Corridors We Cover · Coast to Coast
      </p>
      <div className="marquee">
        <div className="marquee-track">
          <div className="flex items-center"><LaneList /></div>
          <div className="flex items-center" aria-hidden="true"><LaneList /></div>
        </div>
      </div>
    </section>
  );
}
