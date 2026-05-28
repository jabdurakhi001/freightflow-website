import { motion, useReducedMotion } from 'motion/react';
import Reveal from './Reveal';

const FEATURES = [
  'Automated dispatch workflows for zero-latency communication.',
  'Real-time load tracking & visibility for every stakeholder.',
  'Dynamic routing optimization based on live traffic and weather.',
  'Predictive maintenance alerts for fleet uptime reliability.',
  'Digital document management for instant POD access.',
];

export default function AISystemsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="ai-systems" className="py-20 bg-primary text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-center">
        <Reveal direction="right" className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter mb-6">Powered by Intelligent Logistics Systems</h2>
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
          <motion.div
            className="aspect-square bg-gradient-to-br from-primary-container to-secondary/20 rounded-xl flex items-center justify-center border border-white/10 relative"
            animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <img
              loading="lazy"
              className="w-4/5 h-4/5 object-cover rounded-lg shadow-2xl grayscale contrast-125"
              alt="Technology and logistics systems visualization"
              src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80&auto=format"
            />
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
