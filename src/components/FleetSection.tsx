import { motion } from 'motion/react';
import Reveal from './Reveal';
import CountUp from './CountUp';

export default function FleetSection() {
  return (
    <section id="fleet" className="py-20 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <Reveal direction="right" className="md:w-1/2">
            <span className="eyebrow mb-4">The Fleet</span>
            <h2 className="text-4xl md:text-5xl font-black text-primary dark:text-white tracking-tighter leading-[1.05] mb-6">Modern Equipment. <br/>Operational Readiness.</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
              Our fleet consists exclusively of <span className="font-black text-primary dark:text-white">2025–2026 Freightliner Cascadia units</span>. We invest in the newest technology to ensure peak performance, maximum fuel efficiency, and the lowest possible failure rate.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-high rounded-lg">
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Avg. Fleet Age</span>
                <p className="text-xl font-black text-primary dark:text-white">
                  <CountUp value={0.5} decimals={1} suffix=" Years" />
                </p>
              </div>
              <div className="p-4 bg-surface-container-high rounded-lg">
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Uptime Rate</span>
                <p className="text-xl font-black text-primary dark:text-white">
                  <CountUp value={99.2} decimals={1} suffix="%" />
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal direction="left" className="md:w-1/2 relative">
            <img
              loading="lazy"
              className="w-full h-auto rounded-xl shadow-2xl"
              alt="Modern white semi truck fleet at loading dock"
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80&auto=format"
            />
            <motion.div
              className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-secondary text-white p-4 md:p-8 rounded-lg shadow-xl"
              initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.3 }}
            >
              <p className="text-sm font-black uppercase tracking-[0.2em]">Ready to Launch</p>
              <p className="text-4xl font-black">2026 Ready</p>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
