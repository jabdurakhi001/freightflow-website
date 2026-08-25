import CountUp from './CountUp';
import Reveal from './Reveal';

const STATS = [
  { value: 48, suffix: '', unit: 'States', label: 'Nationwide Coverage', highlight: true },
  { static: 'CHI · DAL', unit: 'Dual Hubs', label: 'Dispatch Anchors' },
  { static: '’25–’26', unit: 'Cascadia', label: 'Fleet Model Years' },
  { static: 'Digital', unit: 'POD', label: 'On Every Load' },
] as const;

/**
 * Spec strip — a manifest-style data readout instead of a card grid:
 * hairline top/bottom rules, vertical dividers, mono labels.
 */
export default function TrustStrip() {
  return (
    <section className="relative -mt-px bg-surface py-0">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 border-y border-outline-variant/60">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.label}
              direction="up"
              delay={i * 0.08}
              className={`relative py-8 lg:py-10 px-6 lg:px-8 ${
                i > 0 ? 'lg:border-l lg:border-outline-variant/60' : ''
              } ${i % 2 === 1 ? 'border-l border-outline-variant/60 lg:border-l' : ''} ${
                i > 1 ? 'border-t border-outline-variant/60 lg:border-t-0' : ''
              }`}
            >
              <span className="mono-label block text-on-surface-variant/60 mb-3">
                {String(i + 1).padStart(2, '0')} / {stat.label}
              </span>
              <span className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
                <span
                  className={`font-headline font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight whitespace-nowrap ${
                    'highlight' in stat && stat.highlight ? 'gradient-text' : 'text-primary dark:text-white'
                  }`}
                  style={{ fontStretch: '110%' }}
                >
                  {'value' in stat ? <CountUp value={stat.value} suffix={stat.suffix} /> : stat.static}
                </span>
                <span className="text-sm font-bold text-on-surface-variant">{stat.unit}</span>
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
