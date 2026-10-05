import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useQuoteModal } from '../../QuoteContext';
import { COMPANY } from '../../content';
import { EASE_BRAND, rise, SIGN_SPRING, stagger } from '../../lib/motion';
import { ExitTab, RouteShield, SignArrow } from '../ui/Signs';

/*
 * Background: a 5 s aerial clip of a Cascadia crossing Midwest farmland at
 * sunrise (source and encode step in video/). It plays once and rests on its
 * last frame — no loop, so no pause control is needed (WCAG 2.2.2).
 * Reduced-motion and Data Saver visitors get that last frame as a still.
 *
 * The truck sits mid-frame, so a full-bleed crop would hide the cab behind the
 * sign. Desktop instead shows the whole 16:9 frame as a feathered window on
 * the right, over a blurred backdrop of the same scene; phones and tablets
 * show it as a band above the sign.
 */
const REVEAL = {
  mp4: '/hero/truck-reveal.mp4',
  webm: '/hero/truck-reveal.webm',
  poster: '/hero/truck-reveal-first.jpg',
  still: '/hero/truck-reveal-last.jpg',
  backdrop: '/hero/truck-reveal-backdrop.jpg',
};

// Desktop window edge: fade in from the left, soften top and bottom.
const WINDOW_MASK = {
  WebkitMaskImage:
    'linear-gradient(90deg, transparent 0%, #000 26%), linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%)',
  WebkitMaskComposite: 'source-in',
  maskImage:
    'linear-gradient(90deg, transparent 0%, #000 26%), linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%)',
  maskComposite: 'intersect',
} as const;

function useIsDesktop() {
  const query = '(min-width: 1024px)';
  const [desktop, setDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setDesktop(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return desktop;
}

function allowsVideo() {
  if (typeof window === 'undefined') return false;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  return !saveData && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function Hero() {
  const { openQuote } = useQuoteModal();
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(allowsVideo);
  const desktop = useIsDesktop();

  // Scroll-out: the sign lifts away a little faster than the page.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const signY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  useEffect(() => {
    const el = videoRef.current;
    if (!useVideo || !el) return;
    el.muted = true; // React doesn't reflect `muted` as an attribute
    el.play().catch(() => setUseVideo(false));
  }, [useVideo]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-asphalt text-white lg:flex-row lg:items-center"
    >
      <motion.div
        className="relative aspect-[4/3] w-full shrink-0 sm:aspect-video lg:absolute lg:inset-0 lg:-z-10 lg:aspect-auto"
        style={{ scale: reduceMotion ? 1 : bgScale }}
      >
        {/* Desktop backdrop: the same scene, blurred and dimmed */}
        <img
          src={REVEAL.backdrop}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 hidden h-full w-full scale-110 object-cover lg:block"
        />
        <div aria-hidden="true" className="absolute inset-0 hidden bg-black/40 lg:block" />

        {/* The clip: fills the band on phones/tablets, a feathered 16:9 window on desktop */}
        <div
          className="absolute inset-0 lg:inset-auto lg:right-0 lg:top-[53%] lg:aspect-video lg:w-[74%] lg:-translate-y-1/2"
          style={desktop ? WINDOW_MASK : undefined}
        >
          {useVideo ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover object-[70%_50%] sm:object-center"
              poster={REVEAL.poster}
              autoPlay
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
            >
              {/* WebM first: it's the smaller encode. A failed <source> doesn't fire the
                  video's onError, so watch the last one. */}
              <source src={REVEAL.webm} type="video/webm" />
              <source src={REVEAL.mp4} type="video/mp4" onError={() => setUseVideo(false)} />
            </video>
          ) : (
            <img
              src={REVEAL.still}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-[70%_50%] sm:object-center"
              fetchPriority="high"
            />
          )}
        </div>
        {/* Phones: fade the band into the asphalt below. Desktop: shade the side the sign sits on. */}
        <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-transparent via-30% to-black/30 lg:bg-gradient-to-r lg:from-sign-ink/80 lg:via-sign-ink/25 lg:via-40% lg:to-transparent lg:to-60%" />
      </motion.div>

      <div className="relative mx-auto -mt-3 w-full max-w-7xl px-5 pb-10 sm:-mt-14 sm:px-8 sm:pb-14 lg:mt-0 lg:pb-0 lg:pt-24 short:lg:pt-20">
        <motion.div style={{ y: reduceMotion ? 0 : signY }} className="max-w-[44rem] lg:max-w-[38rem] xl:max-w-[40rem]">
          {/* The sign drops onto its mount and swings to rest */}
          <motion.div
            className="guide-sign px-6 pb-7 pt-8 sm:px-10 sm:pb-9 sm:pt-10"
            style={{ transformPerspective: 1100, transformOrigin: 'top center' }}
            initial={{ opacity: 0, y: -80, rotateX: -35 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ ...SIGN_SPRING, delay: 0.15 }}
          >
            <ExitTab className="absolute -top-[26px] right-8">Exit · FTL</ExitTab>

            <motion.div variants={stagger(0.09, 0.45)} initial="hidden" animate="visible">
              <motion.p variants={rise} className="flex items-center gap-3">
                <RouteShield className="h-12 w-11 text-[1.15rem]">48</RouteShield>
                <span className="legend text-white/85">Full truckload · Lower 48</span>
              </motion.p>

              <motion.h1
                variants={rise}
                className="mt-5 text-[clamp(2.5rem,6.2vw,4.9rem)] lg:text-[clamp(2.5rem,4.4vw,4.6rem)] font-black leading-[0.98] tracking-[-0.035em] short:text-[2.4rem]"
              >
                Capacity you can plan around.
              </motion.h1>

              <motion.p variants={rise} className="mt-5 max-w-xl text-[1.08rem] leading-relaxed text-white/88 sm:text-lg short:hidden">
                Full-truckload freight across the contiguous US, dispatched from our Chicago hub — new Freightliner
                Cascadias, GPS on every load, and proof of delivery the moment it lands.
              </motion.p>

              {/* Hub and coverage rows: tablet and up, so the phone card stays compact. */}
              <motion.div variants={rise} className="mt-7 hidden border-t-[3px] border-white pt-5 sm:block short:!hidden">
                <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {(
                    [
                      { name: COMPANY.hub, label: 'Dispatch hub', dir: 'up' },
                      { name: 'Lower 48', label: 'Coverage', dir: 'up-right' },
                    ] as const
                  ).map((row) => (
                    <li key={row.name} className="flex items-center gap-3">
                      <SignArrow dir={row.dir} className="h-8 w-7 shrink-0" />
                      <span>
                        <span className="block text-2xl font-black leading-none tracking-tight">{row.name}</span>
                        <span className="legend text-[0.62rem] text-white/70">{row.label}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-6 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.05, ease: EASE_BRAND }}
          >
            <button type="button" onClick={() => openQuote()} className="btn-cone px-7 py-4 text-lg">
              Get a quote
              <SignArrow dir="right" className="h-5 w-4" />
            </button>
            <a href="#drivers" className="btn-ghost px-7 py-4 text-lg text-white hover:bg-white/10">
              Drive with us
            </a>
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
}
