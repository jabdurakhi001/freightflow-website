import { motion } from 'motion/react';
import Reveal from './Reveal';
import Aurora from './Aurora';
import SectionHeading from './SectionHeading';
import { EASE_BRAND } from '../lib/motion';

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
        <div>
          <SectionHeading
            index="03"
            eyebrow="Built On Systems"
            title="Run on Systems, Not Spreadsheets"
            subtitle={
              <>
                We differentiate ourselves through <span className="text-white font-bold">structured workflows, automation, and real-time tracking</span>. We don't just drive; we compute the most efficient path.
              </>
            }
            light
          />
          <Reveal delay={0.15}>
            <div className="relative mt-10 p-6 bg-white/5 max-w-xl overflow-hidden">
              {/* Accent bar grows top-down once the callout is in view */}
              <motion.span
                aria-hidden="true"
                className="absolute left-0 top-0 h-full w-1 origin-top bg-secondary"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.8, delay: 0.3, ease: EASE_BRAND }}
              />
              <p className="mono-label opacity-60 mb-2">System Outcome</p>
              <p className="font-headline text-2xl font-black">More control. Fewer delays. Predictable execution.</p>
            </div>
          </Reveal>
        </div>

        <motion.ul
          className="border-b border-white/10 lg:mt-[4.6rem]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {FEATURES.map((feature, i) => (
            <motion.li
              key={feature}
              className="group flex items-baseline gap-5 border-t border-white/10 py-5 text-sm sm:text-base text-white/85 transition-colors hover:text-white"
              variants={{
                hidden: { opacity: 0, x: -16 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.6, ease: EASE_BRAND }}
            >
              <span className="section-index shrink-0 !text-[0.7rem] transition-transform duration-300 group-hover:translate-x-1">S-{String(i + 1).padStart(2, '0')}</span>
              {feature}
            </motion.li>
          ))}
        </motion.ul>

      </div>
    </section>
  );
}
