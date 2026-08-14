import CountUp from './CountUp';
import Reveal from './Reveal';

const STATS = [
  { value: 48, suffix: ' States', label: 'Nationwide Coverage', highlight: true },
  { static: 'Dual Hubs', label: 'Chicago & Dallas' },
  { static: '2025–2026 Fleet', label: 'Modern Equipment' },
  { static: 'Digital POD', label: 'On Every Load' },
] as const;

export default function TrustStrip() {
  return (
    <section className="relative -mt-px bg-surface-container-low py-14">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} direction="up" delay={i * 0.1}>
              <div className="card-premium h-full p-6">
                <span
                  className={`block font-black text-3xl tracking-tight mb-1 ${
                    'highlight' in stat && stat.highlight ? 'gradient-text' : 'text-primary dark:text-white'
                  }`}
                >
                  {'value' in stat ? (
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  ) : (
                    stat.static
                  )}
                </span>
                <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">
                  {stat.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
