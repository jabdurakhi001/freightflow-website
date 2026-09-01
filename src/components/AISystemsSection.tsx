import { motion } from 'motion/react';
import Reveal from './Reveal';
import Aurora from './Aurora';

const FEATURES = [
  'Automated dispatch workflows — no phone tag, no waiting on callbacks.',
  'Real-time load tracking & visibility for every stakeholder.',
  'Route planning built around live traffic and weather conditions.',
  'Scheduled, data-driven maintenance to protect fleet uptime.',
  'Digital document management for instant POD access.',
];

export default function AISystemsSection() {
  return (
    <section id="ai-systems" className="py-24 bg-primary text-white overflow-hidden relative grain">
      <Aurora className="opacity-60" />
      <div className="relative z-10 max-w-7xl mx-auto px-8 grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:items-start">
        <Reveal>
          <div className="flex items-baseline gap-4 border-t border-white/15 pb-6 pt-4">
            <span className="section-index">03</span>
            <span className="eyebrow">Built On Systems</span>
          </div>
          <h2 className="text-4xl md:text-[3.4rem] font-black tracking-tight leading-[1.02] mb-6 max-w-3xl">Run on Systems, Not Spreadsheets</h2>
          <p className="text-on-primary-container text-lg max-w-2xl">
            We differentiate ourselves through <span className="text-white font-bold">structured workflows, automation, and real-time tracking</span>. We don't just drive; we compute the most efficient path.
          </p>
          <div className="mt-10 p-6 bg-white/5 border-l-4 border-secondary max-w-xl">
            <p className="mono-label opacity-60 mb-2">System Outcome</p>
            <p className="font-headline text-2xl font-black">More control. Fewer delays. Predictable execution.</p>
          </div>
        </Reveal>

        <motion.ul
          className="border-b border-white/5 lg:mt-[4.6rem]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {FEATURES.map((feature, i) => (
            <motion.li
              key={feature}
              className="flex items-baseline gap-5 border-t border-white/5 py-5 text-sm sm:text-base"
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

      </div>
    </section>
  );
}
