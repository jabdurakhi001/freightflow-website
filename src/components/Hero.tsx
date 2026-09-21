import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Truck, Activity } from 'lucide-react';
import { useQuoteModal } from '../QuoteContext';

// Existing hero image, also used as the frame the
// site already publishes as its Open Graph image.
const HERO_POSTER = '/hero-frames/frame-050.jpg';

const HIGHLIGHTS = [
  { icon: Truck, label: '48-State Coverage' },
  { icon: ShieldCheck, label: 'USDOT & MC Authorized' },
  { icon: Activity, label: '2025–2026 Cascadia Fleet' },
];

export default function Hero() {
  const { openQuote } = useQuoteModal();

  return (
    <section className="relative min-h-[88svh] md:min-h-[92vh] flex items-center overflow-hidden bg-primary grain pt-28 pb-14 md:pt-32 md:pb-20 short:pt-20 short:pb-10">
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover"
          alt="Truck on an open highway"
          src={HERO_POSTER}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/70 to-primary/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-primary/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-3xl"
        >
          <p className="eyebrow mb-5 short:mb-3">Interstate FTL Carrier</p>

          <h1 className="text-[clamp(2rem,5vw,4rem)] font-black text-white leading-[1.06] md:leading-[1.03] tracking-tight mb-5 sm:mb-6 short:mb-3">
            Freight that keeps your business moving.
          </h1>

          <p className="text-[clamp(1rem,1.5vw,1.2rem)] text-white/85 mb-8 sm:mb-10 short:mb-5 leading-relaxed max-w-xl">
            Full-truckload capacity across the 48 contiguous states — dispatched
            from Chicago and Dallas, tracked from pickup to proof of delivery.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <motion.button
              type="button"
              onClick={() => openQuote()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="btn-premium group inline-flex items-center gap-2 text-white px-5 sm:px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wide cursor-pointer"
            >
              Request a Quote
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.a
              href="#recruitment"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center border border-white/60 bg-primary/70 backdrop-blur-md text-white px-5 sm:px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-primary/90 hover:border-white transition-colors"
            >
              Drive with FreightFlow
            </motion.a>
          </div>

          {/* Route accent — lane markings drifting past, like the shoulder line at speed */}
          <div className="lane-dash route-flow text-secondary mt-10 short:mt-6 max-w-md" aria-hidden="true" />

          <div className="mt-6 hidden sm:flex short:!hidden flex-wrap gap-x-8 gap-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <div key={label} className="mono-label flex items-center gap-2 text-white/75">
                <Icon className="w-4 h-4 text-secondary" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
