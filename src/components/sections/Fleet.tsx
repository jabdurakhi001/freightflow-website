import { motion } from 'motion/react';
import { SIGN_SPRING, stagger } from '../../lib/motion';
import SectionTitle from '../ui/SectionTitle';
import { WarningDiamond } from '../ui/Signs';

const SPECS = [
  { k: 'Tractor', v: 'Freightliner Cascadia' },
  { k: 'Model years', v: '2025–2026 only' },
  { k: 'Trailer', v: '53′ dry van' },
  { k: 'Telematics', v: 'GPS + ELD on every unit' },
  { k: 'Maintenance', v: 'Preventive, on a data-driven schedule' },
];

/** MUTCD-style truck pictogram (side profile), drawn for the warning diamond. */
function TruckPictogram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 64" className={className} aria-hidden="true">
      <rect x="4" y="8" width="72" height="34" rx="2" fill="currentColor" />
      <path d="M80 18 H100 L112 30 V44 H80 Z" fill="currentColor" />
      <rect x="76" y="38" width="38" height="6" fill="currentColor" />
      <path d="M84 21 H98 L106 29 H84 Z" fill="var(--color-caution)" />
      {[16, 30, 90, 106].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="50" r="8" fill="currentColor" />
          <circle cx={cx} cy="50" r="3" fill="var(--color-caution)" />
        </g>
      ))}
    </svg>
  );
}

export default function Fleet() {
  return (
    <section id="fleet" className="overflow-hidden bg-surface py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <motion.div
          className="mx-auto w-full max-w-[26rem]"
          initial={{ opacity: 0, rotate: -12, scale: 0.85 }}
          whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={SIGN_SPRING}
        >
          <WarningDiamond className="aspect-square w-full">
            <motion.span
              className="block"
              // The rig rolls into the sign once it has landed
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <TruckPictogram className="w-[11rem] sm:w-[13rem]" />
            </motion.span>
          </WarningDiamond>
        </motion.div>

        <div>
          <SectionTitle
            marker="MM 05"
            kicker="The fleet"
            title="New trucks. No exceptions."
            lede="Every FreightFlow tractor is a 2025 or 2026 Freightliner Cascadia. Newer equipment means better fuel economy, fewer roadside breakdowns, and freight that shows up when it should."
          />
          <motion.dl
            className="mt-10 overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_0_0_1px_var(--color-outline-variant)]"
            variants={stagger(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {SPECS.map((s, i) => (
              <motion.div
                key={s.k}
                variants={{ hidden: { opacity: 0, x: 18 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
                className={`grid grid-cols-[8.5rem_1fr] items-baseline gap-4 px-5 py-4 sm:grid-cols-[10rem_1fr] sm:px-6 ${
                  i ? 'border-t border-outline-variant' : ''
                }`}
              >
                <dt className="legend text-on-surface-variant">{s.k}</dt>
                <dd className="text-lg font-extrabold tracking-tight">{s.v}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}
