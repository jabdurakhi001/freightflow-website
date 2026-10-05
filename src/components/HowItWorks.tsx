import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Truck } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { EASE_BRAND } from '../lib/motion';

const STEPS = [
  { num: '01', title: 'Request a Quote', desc: 'Provide lane details via our rapid response portal.' },
  { num: '02', title: 'Load Confirmation', desc: 'System-verified capacity is assigned to your specific haul.' },
  { num: '03', title: 'Dispatch & Tracking', desc: 'Live GPS updates and milestone notifications commence.' },
  { num: '04', title: 'Delivery & Verification', desc: 'Immediate digital POD and status reconciliation.' },
];

// One trip across the lane. Steps sit at 0 / 25 / 50 / 75 % of the track, so a
// linear-ish drive reaches each one at roughly DRIVE * position.
const DRIVE = 2.4;
const DRIVE_EASE = [0.45, 0, 0.55, 1] as const;

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  const step: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.1 + i * DRIVE * 0.25, ease: EASE_BRAND },
    }),
  };
  // Mile-marker chip "lights up" as the truck rolls past it.
  const chip: Variants = {
    hidden: { borderColor: 'var(--color-outline-variant)' },
    visible: (i: number) => ({
      borderColor: 'var(--color-secondary)',
      transition: { duration: 0.4, delay: reduceMotion ? 0 : 0.2 + i * DRIVE * 0.25 },
    }),
  };

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-8">
        <SectionHeading
          index="04"
          eyebrow="The Process"
          meta="QUOTE → POD"
          title="How It Works"
          subtitle="Clear process. No confusion. No surprises."
          className="mb-16"
        />

        <motion.ol
          className="relative grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Dashed highway lane the truck rides (desktop). The fill wipes with clip-path
              (scaling would squash the dashes) and the truck moves by translateX, so
              nothing animates layout properties. */}
          <div className="pointer-events-none absolute top-[1.4rem] left-0 right-0 hidden md:block" aria-hidden="true">
            <div className="lane-dash text-on-surface-variant" />
            <motion.div
              className="absolute inset-0"
              variants={{ hidden: { clipPath: 'inset(0 100% 0 0)' }, visible: { clipPath: 'inset(0 0% 0 0)' } }}
              transition={{ duration: reduceMotion ? 0 : DRIVE, ease: DRIVE_EASE }}
            >
              <div className="lane-dash text-secondary !opacity-90" />
            </motion.div>
            {!reduceMotion && (
              <motion.div
                className="absolute inset-x-0 -top-[13px]"
                variants={{ hidden: { x: '0%' }, visible: { x: '100%' } }}
                transition={{ duration: DRIVE, ease: DRIVE_EASE }}
              >
                <div className="w-fit -translate-x-1/2 bg-surface px-1.5">
                  <Truck className="h-6 w-6 text-secondary" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Vertical progress rail (mobile) */}
          <motion.span
            aria-hidden="true"
            className="absolute left-0 top-0 h-full w-px origin-top bg-secondary md:hidden"
            variants={{ hidden: { scaleY: 0 }, visible: { scaleY: 1 } }}
            transition={{ duration: reduceMotion ? 0 : DRIVE, ease: DRIVE_EASE }}
          />

          {STEPS.map((s, i) => (
            <motion.li
              key={s.num}
              custom={i}
              variants={step}
              className="relative border-l border-outline-variant/50 pl-6 md:border-l-0 md:pl-0"
            >
              {/* Mile-marker chip sitting on the lane */}
              <motion.span
                custom={i}
                variants={chip}
                className="relative z-10 mb-5 inline-flex items-center border bg-surface px-3 py-1.5"
              >
                <span className="section-index !text-[0.7rem]">STEP&nbsp;{s.num}</span>
              </motion.span>
              <h3 className="mb-2 font-headline text-lg font-black tracking-tight text-primary dark:text-white">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant md:max-w-[15rem]">{s.desc}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
