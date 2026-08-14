import { X, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import Reveal from './Reveal';

const OTHERS = [
  'Inconsistent capacity availability',
  'Limited load visibility',
  'Manual communication lag',
  'Aging, unreliable equipment',
];

const FREIGHTFLOW = [
  'Structured, committed capacity',
  'Real-time GPS communication',
  'Automated milestone reporting',
  '2025–2026 Freightliner Fleet',
];

export default function Comparison() {
  return (
    <section className="py-20 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="sr-only">FreightFlow Compared to Other Carriers</h2>
        <Reveal>
          <div className="bg-surface-container-lowest dark:bg-surface-container overflow-hidden shadow-xl rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-12 border-b md:border-b-0 md:border-r border-surface-container">
                <h3 className="text-xs uppercase font-black tracking-widest text-on-surface-variant mb-8">Other Carriers</h3>
                <motion.ul
                  className="space-y-6"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {OTHERS.map((item) => (
                    <motion.li
                      key={item}
                      className="flex items-center gap-4 text-on-surface-variant opacity-70"
                      variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 0.7, x: 0 } }}
                    >
                      <X className="text-error w-6 h-6 shrink-0" aria-hidden="true" />
                      <del>{item}</del>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
              <div className="p-12 bg-primary text-white kinetic-strip">
                <h3 className="text-xs uppercase font-black tracking-widest text-secondary mb-8">FreightFlow</h3>
                <motion.ul
                  className="space-y-6"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ staggerChildren: 0.12, delayChildren: 0.15 }}
                >
                  {FREIGHTFLOW.map((item) => (
                    <motion.li
                      key={item}
                      className="flex items-center gap-4"
                      variants={{ hidden: { opacity: 0, x: 12 }, visible: { opacity: 1, x: 0 } }}
                    >
                      <CheckCircle2 className="text-secondary w-6 h-6 shrink-0" />
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.2} className="text-center mt-12">
          <p className="text-2xl font-black text-primary dark:text-white tracking-tight">"Reliability is not luck. It's engineered."</p>
        </Reveal>
      </div>
    </section>
  );
}
