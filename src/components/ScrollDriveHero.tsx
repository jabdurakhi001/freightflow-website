import { useRef, useState, useEffect } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from 'motion/react';
import { ArrowRight, ShieldCheck, Truck, Activity, Navigation, Gauge } from 'lucide-react';
import { useQuoteModal } from '../QuoteContext';

const HERO_POSTER =
  'https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg?auto=compress&cs=tinysrgb&w=1920';

const HIGHLIGHTS = [
  { icon: Truck, label: '48-State Coverage' },
  { icon: ShieldCheck, label: 'USDOT & MC Authorized' },
  { icon: Activity, label: '99.2% Fleet Uptime' },
];

// Waypoints surfaced in the HUD as the lane progresses (illustrative).
const WAYPOINTS = ['I-90 · Chicago, IL', 'I-55 S · Bloomington, IL', 'I-44 · Springfield, MO', 'US-75 · Sherman, TX'];

/** Renders a string/number MotionValue as live text in a type-safe way. */
function Readout<T extends string | number>({ value, className }: { value: MotionValue<T>; className?: string }) {
  const [v, setV] = useState<T>(() => value.get());
  useMotionValueEvent(value, 'change', (x) => setV(x));
  return <span className={className}>{v}</span>;
}

/**
 * Cinematic hero whose background video is scrubbed by scroll position: as the
 * user scrolls through a tall pinned section, the truck "drives" and a live
 * telemetry HUD (speed, route progress, ETA, waypoint) tracks the same scroll.
 * Used on pointer-fine desktop with motion enabled; other devices get a static
 * hero variant.
 */
export default function ScrollDriveHero() {
  const { openQuote } = useQuoteModal();
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end end'],
  });

  // Smooth the raw scroll so the video scrub feels weighted, not twitchy.
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  // Prime the video (muted play→pause) so seek shows decoded frames, then pause.
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onMeta = () => {
      setReady(true);
      vid.play().then(() => vid.pause()).catch(() => vid.pause());
    };
    if (vid.readyState >= 1) onMeta();
    else vid.addEventListener('loadedmetadata', onMeta, { once: true });
    return () => vid.removeEventListener('loadedmetadata', onMeta);
  }, []);

  // Drive video time from smoothed scroll progress.
  useMotionValueEvent(progress, 'change', (v) => {
    const vid = videoRef.current;
    if (!vid || !ready) return;
    const d = vid.duration;
    if (!d || Number.isNaN(d)) return;
    const t = Math.max(0, Math.min(v, 1)) * d;
    if (Math.abs(vid.currentTime - t) > 0.016) {
      try {
        vid.currentTime = t;
      } catch {
        /* seek can throw mid-load; ignore */
      }
    }
  });

  // Phase transitions
  const introOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.12], [0, -50]);
  const hudOpacity = useTransform(scrollYProgress, [0.14, 0.26, 0.88, 1], [0, 1, 1, 0]);
  const outroOpacity = useTransform(scrollYProgress, [0.8, 0.92], [0, 1]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.55, 0.4, 0.7]);

  // Live HUD values, all derived from scroll
  const speed = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0, 68, 64, 0]);
  const speedText = useTransform(speed, (v) => Math.round(v).toString());
  const miles = useTransform(scrollYProgress, [0, 1], [968, 0]);
  const milesText = useTransform(miles, (v) => Math.round(v).toLocaleString());
  const markerLeft = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const routeFill = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const waypoint = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], WAYPOINTS);

  return (
    <section ref={wrapRef} className="relative h-[260vh] bg-primary">
      <div className="sticky top-0 h-screen w-full overflow-hidden grain">
        {/* Scroll-scrubbed video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero-drive.mp4"
          poster={HERO_POSTER}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />

        {/* Legibility overlays */}
        <motion.div className="absolute inset-0 bg-primary" style={{ opacity: overlayOpacity }} />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/30" />

        {/* ---------- Phase 1: Intro ---------- */}
        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="absolute inset-0 z-10 flex items-center"
        >
          <div className="max-w-7xl mx-auto px-8 w-full">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-[10px] font-black uppercase tracking-[0.2em] text-white mb-7">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                </span>
                Precision Logistics · Live Operations
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.02] tracking-tighter mb-6">
                Reliable Freight Capacity Backed by Systems, <span className="gradient-text">Not Guesswork</span>
              </h1>
              <p className="text-xl text-white/70 mb-8 font-light leading-relaxed max-w-2xl">
                FreightFlow delivers consistent, compliant, and scalable transportation across all 48 states — powered by structured operations and real-time visibility.
              </p>
              <div className="flex flex-wrap gap-4">
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
              </div>
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
                {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
                    <Icon className="w-4 h-4 text-secondary" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ---------- Phase 2: Live telemetry HUD ---------- */}
        <motion.div style={{ opacity: hudOpacity }} className="absolute inset-0 z-10 pointer-events-none">
          <div className="max-w-7xl mx-auto px-8 h-full relative">
            {/* Top-left live tag */}
            <div className="absolute top-28 left-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 border border-white/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Load FF-2481 · Live</span>
            </div>

            {/* Speed gauge — top right */}
            <div className="absolute top-28 right-8 text-right">
              <div className="inline-flex items-baseline gap-1.5 px-4 py-2 rounded-xl bg-black/30 border border-white/10 backdrop-blur-md">
                <Gauge className="w-4 h-4 text-secondary self-center" />
                <Readout value={speedText} className="text-3xl font-black text-white tabular-nums tracking-tight" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">mph</span>
              </div>
            </div>

            {/* Center prompt */}
            <div className="absolute top-1/2 left-8 -translate-y-1/2 max-w-md">
              <span className="eyebrow mb-3">Keep Scrolling</span>
              <p className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight">
                You're in the cab.<br />Watch the system work.
              </p>
              <p className="mt-3 text-white/60 text-sm leading-relaxed">
                Every load is GPS-tracked, milestone-verified, and compliance-monitored — from dispatch to delivery.
              </p>
            </div>

            {/* Bottom telemetry bar */}
            <div className="absolute bottom-10 left-8 right-8">
              <div className="rounded-2xl bg-black/35 border border-white/10 backdrop-blur-md px-6 py-4">
                <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="inline-flex items-center gap-1.5 text-white/70">
                    <Navigation className="w-3.5 h-3.5 text-secondary" />
                    <Readout value={waypoint} className="text-white/80" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> HOS Clear
                  </span>
                </div>
                {/* Route progress */}
                <div className="relative h-1.5 rounded-full bg-white/10">
                  <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-secondary-fixed-dim to-secondary" style={{ width: routeFill }} />
                  <motion.div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white shadow-lg flex items-center justify-center" style={{ left: markerLeft }}>
                    <Truck className="w-3 h-3 text-primary" />
                  </motion.div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs font-bold">
                  <span className="text-white/50 uppercase tracking-widest">Chicago, IL</span>
                  <span className="text-white/70 uppercase tracking-widest">
                    <Readout value={milesText} className="text-secondary tabular-nums" /> mi remaining
                  </span>
                  <span className="text-white/50 uppercase tracking-widest">Dallas, TX</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ---------- Outro tagline ---------- */}
        <motion.div style={{ opacity: outroOpacity }} className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <p className="text-4xl md:text-6xl font-black text-white tracking-tighter text-center px-8">
            Every mile, <span className="gradient-text">accounted for.</span>
          </p>
        </motion.div>

        {/* Scroll cue */}
        <motion.div style={{ opacity: cueOpacity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Scroll to Drive</span>
          <div className="w-5 h-9 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
            <motion.span
              className="w-1 h-1.5 rounded-full bg-secondary"
              animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
