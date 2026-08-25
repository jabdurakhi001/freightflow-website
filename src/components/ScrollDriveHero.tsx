import { useRef, useState, useEffect, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from 'motion/react';
import { ArrowRight, ShieldCheck, Truck, Activity, Gauge } from 'lucide-react';
import { useQuoteModal } from '../QuoteContext';

// First frame of the scrub sequence, used as the pre-decode poster so the
// placeholder matches the footage (no jarring stock image flash on refresh).
const HERO_POSTER = '/hero-frames/frame-001.jpg';

// Pre-extracted frame sequence (1280x720). Each frame is decoded once into a
// GPU-ready ImageBitmap, and a smoothing playhead eases toward the scroll
// position — so scrubbing is both scroll-aligned and free of decode jank or
// frame-stepping.
const FRAME_COUNT = 64;
const frameSrc = (i: number) => `/hero-frames/frame-${String(i + 1).padStart(3, '0')}.jpg`;

const HIGHLIGHTS = [
  { icon: Truck, label: '48-State Coverage' },
  { icon: ShieldCheck, label: 'USDOT & MC Authorized' },
  { icon: Activity, label: '2025–2026 Cascadia Fleet' },
];

/** Renders a string/number MotionValue as live text in a type-safe way. */
function Readout<T extends string | number>({ value, className }: { value: MotionValue<T>; className?: string }) {
  const [v, setV] = useState<T>(() => value.get());
  useMotionValueEvent(value, 'change', (x) => setV(x));
  return <span className={className}>{v}</span>;
}

export default function ScrollDriveHero() {
  const { openQuote } = useQuoteModal();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bitmapsRef = useRef<(ImageBitmap | null)[]>([]);
  const targetRef = useRef(0); // frame index the scroll wants
  const currentRef = useRef(0); // eased frame index actually shown
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const [ready, setReady] = useState(false);

  // Progress through the pinned section, measured directly from the wrapper's
  // rect (0 = section top hits viewport top, 1 = sticky releases). Computed by
  // hand because useScroll's target tracking silently fell back to whole-page
  // progress here, which stretched the fade phases across the entire document.
  const scrollYProgress = useMotionValue(0);
  useEffect(() => {
    const update = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      if (range <= 0) return;
      scrollYProgress.set(Math.min(1, Math.max(0, -rect.top / range)));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [scrollYProgress]);

  // Paint a given frame (cover-fit), falling back to the nearest decoded one.
  const renderFrame = useCallback((wanted: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const bmps = bitmapsRef.current;

    let idx = Math.max(0, Math.min(wanted, FRAME_COUNT - 1));
    if (!bmps[idx]) {
      let back = idx;
      while (back >= 0 && !bmps[back]) back--;
      if (back >= 0) idx = back;
      else {
        let fwd = idx;
        while (fwd < FRAME_COUNT && !bmps[fwd]) fwd++;
        if (fwd < FRAME_COUNT) idx = fwd;
        else return;
      }
    }
    const bmp = bmps[idx]!;
    const vw = canvas.clientWidth;
    const vh = canvas.clientHeight;
    const scale = Math.max(vw / bmp.width, vh / bmp.height);
    const dw = bmp.width * scale;
    const dh = bmp.height * scale;
    ctx.drawImage(bmp, (vw - dw) / 2, (vh - dh) / 2, dw, dh);
  }, []);

  // Easing loop: nudge the shown frame toward the scroll target each tick.
  const tick = useCallback(() => {
    const target = targetRef.current;
    const diff = target - currentRef.current;
    if (Math.abs(diff) < 0.35) {
      currentRef.current = target;
      renderFrame(Math.round(target));
      runningRef.current = false;
      rafRef.current = 0;
      return;
    }
    currentRef.current += diff * 0.2;
    renderFrame(Math.round(currentRef.current));
    rafRef.current = requestAnimationFrame(tick);
  }, [renderFrame]);

  const ensureRunning = useCallback(() => {
    if (!runningRef.current) {
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderFrame(Math.round(currentRef.current));
  }, [renderFrame]);

  // Decode the whole sequence to ImageBitmaps once.
  useEffect(() => {
    let cancelled = false;
    const bmps: (ImageBitmap | null)[] = new Array(FRAME_COUNT).fill(null);
    bitmapsRef.current = bmps;

    // Decode frames no larger than the device needs, so memory stays bounded
    // on phones while desktops still get full 1280-wide frames.
    const decodeWidth = Math.min(
      Math.round(window.innerWidth * Math.min(window.devicePixelRatio || 1, 2)),
      1280,
    );

    (async () => {
      for (let i = 0; i < FRAME_COUNT; i++) {
        try {
          const res = await fetch(frameSrc(i));
          const blob = await res.blob();
          const bmp = await createImageBitmap(blob, { resizeWidth: decodeWidth, resizeQuality: 'high' });
          if (cancelled) {
            bmp.close();
            return;
          }
          bmps[i] = bmp;
          if (i === 0) setReady(true);
          renderFrame(Math.round(currentRef.current)); // sharpen as frames arrive
        } catch {
          /* skip a frame that fails to load/decode */
        }
      }
    })();

    return () => {
      cancelled = true;
      for (const b of bmps) b?.close();
    };
  }, [renderFrame]);

  useEffect(() => {
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    return () => {
      window.removeEventListener('resize', sizeCanvas);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sizeCanvas]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    targetRef.current = Math.max(0, Math.min(v, 1)) * (FRAME_COUNT - 1);
    ensureRunning();
  });

  // Phase transitions
  const introOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.12], [0, -50]);
  const hudOpacity = useTransform(scrollYProgress, [0.14, 0.26, 0.88, 1], [0, 1, 1, 0]);
  const outroOpacity = useTransform(scrollYProgress, [0.8, 0.92], [0, 1]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  // Live HUD values
  const speed = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0, 68, 64, 0]);
  const speedText = useTransform(speed, (v) => Math.round(v).toString());

  return (
    <section ref={wrapRef} className="relative h-[320vh] bg-primary">
      <div className="sticky top-0 h-screen w-full overflow-hidden grain">
        <img
          src={HERO_POSTER}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}
        />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />

        {/* ---------- Phase 1: Intro ---------- */}
        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="absolute inset-0 z-10 flex items-center pt-20 pb-10 md:py-0 short:pt-16 will-change-[opacity,transform]"
        >
          <div className="max-w-7xl mx-auto px-8 w-full">
            <div className="max-w-3xl">
              <h1 className="text-[clamp(1.875rem,5.5vw,4.5rem)] font-black text-white leading-[1.05] md:leading-[1.02] tracking-tight mb-4 sm:mb-6 short:mb-3">
                Reliable Freight Capacity Backed by Systems, <span className="gradient-text">Not Guesswork</span>
              </h1>
              <p className="text-[clamp(0.95rem,1.6vw,1.25rem)] text-white/70 mb-6 sm:mb-8 font-light leading-relaxed max-w-2xl short:hidden">
                Consistent, compliant freight across all 48 states — every load dispatched, tracked, and verified by one system.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <motion.button
                  type="button"
                  onClick={() => openQuote()}
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
                  className="border border-white/40 bg-black/40 backdrop-blur-md text-white px-9 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black/60 hover:border-white/60 transition-all"
                >
                  Work With Us
                </motion.a>
              </div>
              <div className="mt-8 sm:mt-12 hidden sm:flex short:!hidden flex-wrap gap-x-8 gap-y-3">
                {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                  <div key={label} className="mono-label flex items-center gap-2 text-white/60">
                    <Icon className="w-4 h-4 text-secondary" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ---------- Phase 2: Live telemetry HUD ---------- */}
        <motion.div style={{ opacity: hudOpacity }} className="absolute inset-0 z-10 pointer-events-none will-change-[opacity]">
          <div className="max-w-7xl mx-auto px-8 h-full relative">
            <div className="absolute top-28 left-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="mono-label text-white/80">Load FF-2481 · Live</span>
            </div>

            <div className="absolute top-28 right-8 text-right">
              <div className="inline-flex items-baseline gap-1.5 px-4 py-2 rounded-xl bg-black/40 border border-white/10">
                <Gauge className="w-4 h-4 text-secondary self-center" />
                <Readout value={speedText} className="text-3xl font-black text-white tabular-nums tracking-tight" />
                <span className="mono-label text-white/50">mph</span>
              </div>
            </div>

            <div className="absolute top-1/2 left-8 -translate-y-1/2 max-w-md hidden sm:block short:!hidden">
              <span className="eyebrow mb-3">Keep Scrolling</span>
              <p className="font-headline text-3xl md:text-4xl font-black text-white tracking-tight leading-tight" style={{ fontStretch: '110%' }}>
                You're in the cab.<br />Watch the system work.
              </p>
              <p className="mt-3 text-white/60 text-sm leading-relaxed">
                Every load is GPS-tracked, milestone-verified, and compliance-monitored — from dispatch to delivery.
              </p>
            </div>

          </div>
        </motion.div>

        {/* ---------- Outro ---------- */}
        <motion.div style={{ opacity: outroOpacity }} className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none will-change-[opacity]">
          <p className="font-headline text-4xl md:text-6xl font-black text-white tracking-tight text-center px-8" style={{ fontStretch: '112%' }}>
            Every mile, <span className="gradient-text">accounted for.</span>
          </p>
        </motion.div>

        <motion.div style={{ opacity: cueOpacity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2">
          <span className="mono-label text-white/70">Scroll to Drive</span>
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
