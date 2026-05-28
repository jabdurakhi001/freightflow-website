import CountUp from './CountUp';
import Reveal from './Reveal';

const STATS = [
  { value: 48, suffix: ' States', label: 'Nationwide Coverage', highlight: true },
  { static: 'Midwest Hub', label: 'Operational Strength' },
  { static: '2025–2026 Fleet', label: 'Modern Equipment' },
  { static: 'ISO-Ready', label: 'Process-Driven' },
] as const;

export default function TrustStrip() {
  return (
    <section className="bg-surface-container-high py-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} direction="up" delay={i * 0.1} className="flex flex-col">
              <span
                className={`font-black text-2xl ${
                  'highlight' in stat && stat.highlight ? 'text-secondary' : 'text-primary dark:text-white'
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
