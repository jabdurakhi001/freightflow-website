import { motion } from 'motion/react';
import Reveal from './Reveal';
import Aurora from './Aurora';
import OpsConsole from './OpsConsole';

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
      <div className="relative z-10 max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-center">
        <Reveal direction="right" className="relative z-10">
          <span className="eyebrow mb-4">Built On Systems</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] mb-6">Run on Systems, Not Spreadsheets</h2>
          <p className="text-on-primary-container text-lg mb-10">
            We differentiate ourselves through <span className="text-white font-bold">structured workflows, automation, and real-time tracking</span>. We don't just drive; we compute the most efficient path.
          </p>
          <motion.ul
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.12 }}
          >
            {FEATURES.map((feature, i) => (
              <motion.li
                key={feature}
                className={`flex items-center gap-3 text-sm pb-4 ${i < FEATURES.length - 1 ? 'border-b border-white/5' : ''}`}
                variants={{
                  hidden: { opacity: 0, x: -16 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.4 }}
              >
                <span className="w-2 h-2 bg-secondary rounded-full shrink-0"></span>
                {feature}
              </motion.li>
            ))}
          </motion.ul>
          <div className="mt-12 p-6 bg-white/5 border-l-4 border-secondary">
            <p className="text-xs uppercase tracking-widest font-black opacity-60 mb-2">System Outcome</p>
            <p className="text-2xl font-black">More control. Fewer delays. Predictable execution.</p>
          </div>
        </Reveal>
        <Reveal direction="left" className="relative">
          <OpsConsole />
        </Reveal>
      </div>
    </section>
  );
}
