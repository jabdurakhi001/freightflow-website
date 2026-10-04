import { useRef } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'motion/react';
import { ArrowRight, ShieldCheck, Truck, Activity } from 'lucide-react';
import { useQuoteModal } from '../QuoteContext';
import { EASE_BRAND, EASE_OUT_EXPO, HOVER_LIFT, TAP_PRESS } from '../lib/motion';

// Existing hero image, also used as the frame the
// site already publishes as its Open Graph image.
const HERO_POSTER = '/hero-frames/frame-050.jpg';

const HEADLINE = 'Freight that keeps your business moving.';

const HIGHLIGHTS = [
  { icon: Truck, label: '48-State Coverage' },
  { icon: ShieldCheck, label: 'USDOT & MC Authorized' },
  { icon: Activity, label: '2025–2026 Cascadia Fleet' },
];

// Entrance choreography: eyebrow → headline words → copy → CTAs → lane → highlights.
const sequence: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_BRAND } },
};
const headline: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055 } },
};
// Each word rises out of its own clipping mask.
const word: Variants = {
  hidden: { y: '105%' },
  visible: { y: '0%', transition: { duration: 0.8, ease: EASE_OUT_EXPO } },
};
const laneDraw: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.9, ease: EASE_OUT_EXPO } },
};

export default function Hero() {
  const { openQuote } = useQuoteModal();
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-out: the photo drifts slower than the page (parallax) while the copy
  // lifts and fades, so leaving the hero feels like pulling away down the road.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[88svh] md:min-h-[92vh] flex items-center overflow-hidden bg-primary grain pt-28 pb-14 md:pt-32 md:pb-20 short:pt-20 short:pb-10"
    >
      <div className="absolute inset-0 z-0">
        <motion.div style={{ y: imageY }} className="absolute inset-0 will-change-transform">
          {/* Slow settle on load — like the camera finishing its push-in */}
          <motion.img
            className="w-full h-full object-cover"
            alt="Truck on an open highway"
            src={HERO_POSTER}
            fetchPriority="high"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1.02 }}
            transition={{ duration: 2.4, ease: EASE_OUT_EXPO }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/70 to-primary/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-primary/40" />
      </div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full"
      >
        <motion.div variants={sequence} initial="hidden" animate="visible" className="max-w-3xl">
          <motion.p variants={rise} className="eyebrow mb-5 short:mb-3">Interstate FTL Carrier</motion.p>

          <motion.h1
            variants={headline}
            className="text-[clamp(2rem,5vw,4rem)] font-black text-white leading-[1.06] md:leading-[1.03] tracking-tight mb-5 sm:mb-6 short:mb-3"
          >
            {HEADLINE.split(' ').map((w, i, all) => (
              <span key={i}>
                {/* pb/-mb keeps descenders inside the clip without shifting the line box */}
                <span className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
                  <motion.span variants={word} className="inline-block">
                    {w}
                  </motion.span>
                </span>
                {i < all.length - 1 && ' '}
              </span>
            ))}
          </motion.h1>

          <motion.p
            variants={rise}
            className="text-[clamp(1rem,1.5vw,1.2rem)] text-white/85 mb-8 sm:mb-10 short:mb-5 leading-relaxed max-w-xl"
          >
            Full-truckload capacity across the 48 contiguous states — dispatched
            from Chicago and Dallas, tracked from pickup to proof of delivery.
          </motion.p>

          <motion.div variants={rise} className="flex flex-wrap items-center gap-3 sm:gap-4">
            <motion.button
              type="button"
              onClick={() => openQuote()}
              whileHover={HOVER_LIFT}
              whileTap={TAP_PRESS}
              className="btn-premium group inline-flex items-center gap-2 text-white px-5 sm:px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wide cursor-pointer"
            >
              Request a Quote
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.a
              href="#recruitment"
              whileHover={HOVER_LIFT}
              whileTap={TAP_PRESS}
              className="inline-flex items-center border border-white/60 bg-primary/70 backdrop-blur-md text-white px-5 sm:px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-primary/90 hover:border-white transition-colors"
            >
              Drive with FreightFlow
            </motion.a>
          </motion.div>

          {/* Route accent — lane markings draw in, then drift past like the shoulder line at speed */}
          <motion.div variants={laneDraw} className="origin-left mt-10 short:mt-6 max-w-md" aria-hidden="true">
            <div className="lane-dash route-flow text-secondary" />
          </motion.div>

          <motion.div variants={rise} className="mt-6 hidden sm:flex short:!hidden flex-wrap gap-x-8 gap-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <div key={label} className="mono-label flex items-center gap-2 text-white/75">
                <Icon className="w-4 h-4 text-secondary" />
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll cue (desktop) — fades as soon as the visitor starts moving */}
      <motion.div
        style={{ opacity: cueOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex short:!hidden flex-col items-center gap-2 pointer-events-none"
        aria-hidden="true"
      >
        <motion.span
          className="mono-label text-white/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          Scroll
        </motion.span>
        <span className="relative block h-10 w-px overflow-hidden bg-white/15">
          <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent to-secondary" />
        </span>
      </motion.div>
    </section>
  );
}
