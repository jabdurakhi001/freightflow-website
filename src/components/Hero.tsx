import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Truck, Activity } from 'lucide-react';
import Aurora from './Aurora';
import ScrollDriveHero from './ScrollDriveHero';
import { useQuoteModal } from '../QuoteContext';

const HERO_POSTER =
  'https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg?auto=compress&cs=tinysrgb&w=1920';

const HIGHLIGHTS = [
  { icon: Truck, label: '48-State Coverage' },
  { icon: ShieldCheck, label: 'USDOT & MC Authorized' },
  { icon: Activity, label: '99.2% Fleet Uptime' },
];

// Decide once, synchronously, to avoid a hero flash on load. The scroll
// scrubber (truck advances only as you scroll) runs on every device that
// allows motion; reduced-motion users get a static poster.
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function Hero() {
  const [reduced] = useState<boolean>(prefersReducedMotion);

  if (reduced) return <StaticHero />;
  return <ScrollDriveHero />;
}

/** Static poster hero shown when the user prefers reduced motion. */
function StaticHero() {
  const { openQuote } = useQuoteModal();

  return (
    <section className="relative min-h-screen md:min-h-[92vh] flex items-center overflow-hidden bg-primary grain pt-24 pb-12 md:py-0 short:pt-20">
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
          alt="Semi truck on mountain highway"
          src={HERO_POSTER}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/85 to-primary/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
      </div>

      <Aurora className="z-0 opacity-70" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(1.875rem,5.5vw,4.5rem)] font-black text-white leading-[1.05] md:leading-[1.02] tracking-tighter mb-4 sm:mb-6 short:mb-3"
          >
            Reliable Freight Capacity Backed by Systems,{' '}
            <span className="gradient-text">Not Guesswork</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[clamp(0.95rem,1.6vw,1.25rem)] text-white/70 mb-4 font-light leading-relaxed max-w-2xl short:hidden"
          >
            FreightFlow turns vision into motion — delivering consistent, compliant, and scalable transportation across all 48 states through structured operations and real-time visibility.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-secondary-fixed-dim font-bold tracking-tight mb-8 sm:mb-10 border-l-2 border-secondary pl-4 text-sm sm:text-base short:hidden"
          >
            We don't just move freight. We execute with precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <motion.button
              type="button"
              onClick={openQuote}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn-premium group inline-flex items-center gap-2 text-white px-9 py-4 rounded-full font-bold text-sm uppercase tracking-widest cursor-pointer"
            >
              Request a Quote
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.a
              href="#recruitment"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="border border-white/20 bg-white/5 backdrop-blur-sm text-white px-9 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Work With Us
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-10 hidden sm:flex short:!hidden flex-wrap gap-x-8 gap-y-3"
          >
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
                <Icon className="w-4 h-4 text-secondary" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
