import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { ArrowRight, ShieldCheck, Truck, Activity } from 'lucide-react';
import Aurora from './Aurora';

const HIGHLIGHTS = [
  { icon: Truck, label: '48-State Coverage' },
  { icon: ShieldCheck, label: 'USDOT & MC Authorized' },
  { icon: Activity, label: '99.2% Fleet Uptime' },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 120]);
  const bgScale = useTransform(scrollY, [0, 600], [1, 1.15]);

  return (
    <section className="relative min-h-screen md:min-h-[92vh] flex items-center overflow-hidden bg-primary grain">
      {/* Photographic backdrop with parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={reduceMotion ? undefined : { y: bgY, scale: bgScale }}
      >
        <motion.img
          className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
          alt="Semi truck on mountain highway"
          src="https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg?auto=compress&cs=tinysrgb&w=1920"
          initial={reduceMotion ? false : { scale: 1.1 }}
          animate={reduceMotion ? undefined : { scale: 1 }}
          transition={{ duration: 8, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/85 to-primary/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
      </motion.div>

      {/* Ambient color */}
      <Aurora className="z-0 opacity-70" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-[10px] font-black uppercase tracking-[0.2em] text-white mb-7"
          >
            <span className="relative flex h-2 w-2">
              {!reduceMotion && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
            </span>
            Precision Logistics · Live Operations
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white leading-[1.02] tracking-tighter mb-6"
          >
            Reliable Freight Capacity Backed by Systems,{' '}
            <span className="gradient-text">Not Guesswork</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl text-white/70 mb-4 font-light leading-relaxed max-w-2xl"
          >
            FreightFlow delivers consistent, compliant, and scalable transportation across all 48 states — powered by structured operations and real-time visibility.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-secondary-fixed-dim font-bold tracking-tight mb-10 border-l-2 border-secondary pl-4"
          >
            We don't just move freight. We execute with precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <motion.a
              href="mailto:info@freightflow.group?subject=Quote%20Request"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn-premium group inline-flex items-center gap-2 text-white px-9 py-4 rounded-full font-bold text-sm uppercase tracking-widest"
            >
              Request a Quote
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.a
              href="#recruitment"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="border border-white/20 bg-white/5 backdrop-blur-sm text-white px-9 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Work With Us
            </motion.a>
          </motion.div>

          {/* Inline trust row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 flex flex-wrap gap-x-8 gap-y-3"
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

      {/* Scroll cue */}
      {!reduceMotion && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Scroll</span>
          <div className="w-5 h-9 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
            <motion.span
              className="w-1 h-1.5 rounded-full bg-secondary"
              animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}
