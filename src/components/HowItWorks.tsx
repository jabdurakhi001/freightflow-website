import { motion, useReducedMotion } from 'motion/react';
import { Truck } from 'lucide-react';

const STEPS = [
  { num: '01', title: 'Request a Quote', desc: 'Provide lane details via our rapid response portal.' },
  { num: '02', title: 'Load Confirmation', desc: 'System-verified capacity is assigned to your specific haul.' },
  { num: '03', title: 'Dispatch & Tracking', desc: 'Live GPS updates and milestone notifications commence.' },
  { num: '04', title: 'Delivery & Verification', desc: 'Immediate digital POD and status reconciliation.' },
];

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          className="flex flex-col items-center text-center mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow mb-4">The Process</span>
          <h2 className="text-4xl md:text-5xl font-black text-primary dark:text-white tracking-tighter leading-[1.05] mb-4">How It Works</h2>
          <p className="text-on-surface-variant font-medium text-lg">Clear process. No confusion. No surprises.</p>
        </motion.div>

        <motion.div
          className="relative grid grid-cols-1 md:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.25 }}
        >
          {/* Connecting track (desktop) */}
          <div className="hidden md:block absolute top-2 left-[12.5%] right-[12.5%] h-0.5 bg-surface-container-high overflow-hidden rounded-full">
            <motion.div
              className="h-full bg-secondary origin-left"
              variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1 } }}
              transition={{ duration: reduceMotion ? 0 : 2, ease: 'easeInOut' }}
            />
            {/* Truck riding the line */}
            {!reduceMotion && (
              <motion.div
                className="absolute -top-[11px]"
                variants={{ hidden: { left: '0%' }, visible: { left: '100%' } }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              >
                <div className="-translate-x-1/2 bg-surface px-1">
                  <Truck className="w-5 h-5 text-secondary" />
                </div>
              </motion.div>
            )}
          </div>

          {STEPS.map((step) => (
            <motion.div
              key={step.num}
              className="relative"
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
            >
              {/* Node dot aligned to the track */}
              <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-secondary ring-4 ring-surface z-10" />
              <span className="text-7xl font-black text-surface-container-high absolute -top-8 -left-4 z-0">{step.num}</span>
              <div className="relative z-[5] pt-4 md:pt-8 md:text-center">
                <h4 className="font-black text-primary dark:text-white mb-2">{step.title}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
