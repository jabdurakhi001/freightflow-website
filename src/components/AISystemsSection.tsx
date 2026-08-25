import { motion } from 'motion/react';
import Reveal from './Reveal';
import Aurora from './Aurora';

const FEATURES = [
  'Automated dispatch workflows — no phone tag, no waiting on callbacks.',
  'Real-time load tracking & visibility for every stakeholder.',
  'Dynamic routing optimization based on live traffic and weather.',
  'Predictive maintenance alerts for fleet uptime reliability.',
  'Digital document management for instant POD access.',
];

export default function AISystemsSection() {
  return (
    <section id="ai-systems" className="py-24 bg-primary text-white overflow-hidden relative grain">
      <Aurora className="opacity-60" />
      <div className="relative z-10 max-w-5xl mx-auto px-8">
        <Reveal>
          <div className="flex items-baseline gap-4 border-t border-white/15 pb-6 pt-4">
            <span className="section-index">03</span>
            <span className="eyebrow">Built On Systems</span>
          </div>
          <h2 className="text-4xl md:text-[3.4rem] font-black tracking-tight leading-[1.02] mb-6 max-w-3xl">Run on Systems, Not Spreadsheets</h2>
          <p className="text-on-primary-container text-lg max-w-2xl">
            We differentiate ourselves through <span className="text-white font-bold">structured workflows, automation, and real-time tracking</span>. We don't just drive; we compute the most efficient path.
          </p>
        </Reveal>

        <motion.ul
          className="mt-12 border-b border-white/5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {FEATURES.map((feature, i) => (
            <motion.li
              key={feature}
              className="flex items-baseline gap-5 border-t border-white/5 py-4 text-sm sm:text-base"
              variants={{
                hidden: { opacity: 0, x: -16 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.4 }}
            >
              <span className="section-index shrink-0 !text-[0.7rem]">S-{String(i + 1).padStart(2, '0')}</span>
              {feature}
            </motion.li>
          ))}
        </motion.ul>

        <Reveal delay={0.1} className="mt-12">
          <div className="p-6 bg-white/5 border-l-4 border-secondary max-w-2xl">
            <p className="mono-label opacity-60 mb-2">System Outcome</p>
            <p className="font-headline text-2xl font-black">More control. Fewer delays. Predictable execution.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
