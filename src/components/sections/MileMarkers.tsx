import { motion } from 'motion/react';
import CountUp from '../CountUp';
import { stagger, swingIn } from '../../lib/motion';

const MARKERS = [
  { top: 'States', value: <CountUp value={48} />, caption: 'Contiguous US coverage' },
  { top: 'Hub', value: 'CHI', caption: 'Dispatched from Chicago' },
  { top: 'Model yr', value: '25–27', caption: 'Freightliner Cascadia fleet' },
  { top: 'Tracking', value: 'GPS', caption: 'Live on every load' },
  { top: 'Delivery', value: 'POD', caption: 'Digital, at drop-off' },
];

/** Facts as roadside mile-marker posts standing along a shoulder line. */
export default function MileMarkers() {
  return (
    <section aria-label="FreightFlow at a glance" className="relative overflow-hidden bg-surface pb-14 pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.ul
          className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-5"
          variants={stagger(0.09)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {MARKERS.map((m, i) => (
            <motion.li
              key={m.top}
              variants={swingIn}
              style={{ transformPerspective: 800, transformOrigin: 'top center' }}
              className={`flex flex-col items-center text-center ${i === 4 ? 'max-sm:col-span-2' : ''}`}
            >
              <div className="guide-sign guide-sign-sm flex min-h-[9.5rem] w-full max-w-[10.5rem] flex-col items-center justify-center px-4 py-5">
                <span className="legend text-[0.62rem] text-white/80">{m.top}</span>
                <span className="mt-1 text-[2.6rem] font-black leading-none tracking-[-0.04em] tabular-nums sm:text-5xl">{m.value}</span>
              </div>
              {/* post */}
              <span aria-hidden="true" className="post h-6 w-2 rounded-b-sm" />
              <p className="mt-3 max-w-[11rem] text-sm font-semibold leading-snug text-on-surface-variant">{m.caption}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
      {/* Shoulder line the posts stand along */}
      <div aria-hidden="true" className="lane lane-flow mx-auto mt-12 max-w-7xl text-lane/80 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]" />
    </section>
  );
}
