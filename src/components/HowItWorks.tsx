import { motion, useReducedMotion } from 'motion/react';
import { Truck } from 'lucide-react';
import SectionHeading from './SectionHeading';

const STEPS = [
  { num: '01', title: 'Request a Quote', desc: 'Provide lane details via our rapid response portal.' },
  { num: '02', title: 'Load Confirmation', desc: 'System-verified capacity is assigned to your specific haul.' },
  { num: '03', title: 'Dispatch & Tracking', desc: 'Live GPS updates and milestone notifications commence.' },
  { num: '04', title: 'Delivery & Verification', desc: 'Immediate digital POD and status reconciliation.' },
];

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

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

        <motion.div
          className="relative grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: reduceMotion ? 0 : 0.22 }}
        >
          {/* Dashed highway lane the truck rides (desktop) */}
          <div className="pointer-events-none absolute top-[1.4rem] left-0 right-0 hidden md:block">
            <div className="lane-dash text-on-surface-variant" />
            <motion.div
              className="absolute inset-y-0 left-0 overflow-hidden"
              variants={{ hidden: { width: '0%' }, visible: { width: '100%' } }}
              transition={{ duration: reduceMotion ? 0 : 2.2, ease: 'easeInOut' }}
            >
              <div className="lane-dash w-[100vw] max-w-7xl text-secondary !opacity-90" />
            </motion.div>
            {!reduceMotion && (
              <motion.div
                className="absolute -top-[13px]"
                variants={{ hidden: { left: '0%' }, visible: { left: '99%' } }}
                transition={{ duration: 2.2, ease: 'easeInOut' }}
              >
                <div className="-translate-x-1/2 bg-surface px-1.5">
                  <Truck className="h-6 w-6 text-secondary" />
                </div>
              </motion.div>
            )}
          </div>

          {STEPS.map((step) => (
            <motion.div
              key={step.num}
              className="relative border-l border-outline-variant/50 pl-6 md:border-l-0 md:pl-0"
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: reduceMotion ? 0 : 0.5 }}
            >
              {/* Mile-marker chip sitting on the lane */}
              <span className="relative z-10 mb-5 inline-flex items-center border border-outline-variant/60 bg-surface px-3 py-1.5">
                <span className="section-index !text-[0.7rem]">STEP&nbsp;{step.num}</span>
              </span>
              <h3 className="mb-2 font-headline text-lg font-black tracking-tight text-primary dark:text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant md:max-w-[15rem]">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
