import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Reveal from './Reveal';
import CountUp from './CountUp';
import SectionHeading from './SectionHeading';
import { EASE_BRAND, EASE_OUT_EXPO } from '../lib/motion';

const SPECS = [
  { label: 'Model Years', value: '2025–2026' },
  { label: 'Condition', value: <CountUp value={100} suffix="% New" /> },
  { label: 'Telematics', value: 'GPS + ELD Standard' },
];

export default function FleetSection() {
  const reduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);

  // Gentle parallax inside the frame: the photo travels a little slower than
  // the page, so the truck feels like it's moving past the window.
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ['start end', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  return (
    <section id="fleet" className="py-24 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <SectionHeading
              index="05"
              eyebrow="The Fleet"
              title={<>Modern Equipment. <br />Operational Readiness.</>}
            />
            <Reveal>
              <p className="text-on-surface-variant text-lg leading-relaxed mt-6 mb-10">
                Our fleet consists exclusively of <span className="font-black text-primary dark:text-white">2025–2026 Freightliner Cascadia units</span>. We invest in the newest technology to ensure peak performance, maximum fuel efficiency, and the lowest possible failure rate.
              </p>
            </Reveal>
            <div className="border-b border-outline-variant/50">
              {SPECS.map((spec, i) => (
                <Reveal key={spec.label} delay={i * 0.08}>
                  <div className="ledger-row grid grid-cols-[8rem_1fr] items-baseline gap-4 py-4">
                    <span className="mono-label text-on-surface-variant/60">{spec.label}</span>
                    <p className="font-headline text-xl font-black text-primary dark:text-white">{spec.value}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* The unclipped wrapper is what's observed: a fully clipped element never
              registers as intersecting, so it can't trigger its own reveal. */}
          <motion.div
            ref={frameRef}
            className="md:w-1/2 w-full relative"
            initial={reduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
          >
            {/* Image wipes open from the left edge, like a bay door rolling sideways */}
            <motion.div
              className="relative overflow-hidden shadow-2xl aspect-[16/9]"
              variants={{ hidden: { clipPath: 'inset(0 100% 0 0)' }, visible: { clipPath: 'inset(0 0% 0 0)' } }}
              transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
            >
              <motion.img
                loading="lazy"
                style={{ y: photoY }}
                className="absolute inset-0 w-full h-full object-cover scale-[1.14] will-change-transform"
                alt="FreightFlow 2026 Freightliner Cascadia on the highway"
                src="/hero-frames/frame-030.jpg"
              />
            </motion.div>
            <motion.div
              className="absolute bottom-0 left-0 bg-secondary px-6 py-4 text-white lg:px-8 lg:py-5"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, delay: 0.6, ease: EASE_BRAND }}
            >
              <p className="mono-label text-white/70">Fleet Status</p>
              <p className="font-headline text-2xl font-black lg:text-3xl">2026 READY</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
