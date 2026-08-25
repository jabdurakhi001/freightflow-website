import { motion } from 'motion/react';
import Reveal from './Reveal';
import CountUp from './CountUp';
import SectionHeading from './SectionHeading';

export default function FleetSection() {
  return (
    <section id="fleet" className="py-20 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <Reveal direction="right" className="md:w-1/2">
            <SectionHeading
              index="06"
              eyebrow="The Fleet"
              title={<>Modern Equipment. <br />Operational Readiness.</>}
            />
            <p className="text-on-surface-variant text-lg leading-relaxed mt-6 mb-10">
              Our fleet consists exclusively of <span className="font-black text-primary dark:text-white">2025–2026 Freightliner Cascadia units</span>. We invest in the newest technology to ensure peak performance, maximum fuel efficiency, and the lowest possible failure rate.
            </p>
            <div className="border-b border-outline-variant/50">
              <div className="grid grid-cols-[8rem_1fr] items-baseline gap-4 border-t border-outline-variant/50 py-4">
                <span className="mono-label text-on-surface-variant/60">Model Years</span>
                <p className="font-headline text-xl font-black text-primary dark:text-white" style={{ fontStretch: '110%' }}>2025–2026</p>
              </div>
              <div className="grid grid-cols-[8rem_1fr] items-baseline gap-4 border-t border-outline-variant/50 py-4">
                <span className="mono-label text-on-surface-variant/60">Condition</span>
                <p className="font-headline text-xl font-black text-primary dark:text-white" style={{ fontStretch: '110%' }}>
                  <CountUp value={100} suffix="% New" />
                </p>
              </div>
              <div className="grid grid-cols-[8rem_1fr] items-baseline gap-4 border-t border-outline-variant/50 py-4">
                <span className="mono-label text-on-surface-variant/60">Telematics</span>
                <p className="font-headline text-xl font-black text-primary dark:text-white" style={{ fontStretch: '110%' }}>GPS + ELD Standard</p>
              </div>
            </div>
          </Reveal>
          <Reveal direction="left" className="md:w-1/2 relative">
            <img
              loading="lazy"
              className="w-full h-auto shadow-2xl"
              alt="FreightFlow 2026 Freightliner Cascadia on the highway"
              src="/hero-frames/frame-030.jpg"
            />
            <motion.div
              className="absolute bottom-0 left-0 bg-secondary px-6 py-4 text-white lg:px-8 lg:py-5"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <p className="mono-label text-white/70">Fleet Status</p>
              <p className="font-headline text-2xl font-black lg:text-3xl" style={{ fontStretch: '115%' }}>2026 READY</p>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
