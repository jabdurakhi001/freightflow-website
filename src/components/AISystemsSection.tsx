import { motion } from 'motion/react';
import Reveal from './Reveal';
import Aurora from './Aurora';

const FEATURES = [
  'Automated dispatch workflows for zero-latency communication.',
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
        <Reveal className="text-center max-w-3xl mx-auto">
          <span className="eyebrow mb-4">Built On Systems</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] mb-6">Powered by Intelligent Logistics Systems</h2>
          <p className="text-on-primary-container text-lg">
            We differentiate ourselves through <span className="text-white font-bold">structured workflows, automation, and real-time tracking</span>. We don't just drive; we compute the most efficient path.
          </p>
        </Reveal>

        <motion.ul
          className="mt-14 grid sm:grid-cols-2 gap-x-10 gap-y-5 max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {FEATURES.map((feature) => (
            <motion.li
              key={feature}
              className="flex items-start gap-3 text-sm text-on-primary-container"
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4 }}
            >
              <span className="w-2 h-2 bg-secondary rounded-full shrink-0 mt-1.5"></span>
              {feature}
            </motion.li>
          ))}
        </motion.ul>

        <Reveal delay={0.1} className="mt-14 max-w-2xl mx-auto">
          <div className="p-6 bg-white/5 border-l-4 border-secondary text-center sm:text-left">
            <p className="text-xs uppercase tracking-widest font-black opacity-60 mb-2">System Outcome</p>
            <p className="text-2xl font-black">More control. Fewer delays. Predictable execution.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
