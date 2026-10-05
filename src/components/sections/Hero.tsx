import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Pause, Play } from 'lucide-react';
import { useQuoteModal } from '../../QuoteContext';
import { COMPANY } from '../../content';
import { EASE_BRAND, rise, SIGN_SPRING, stagger } from '../../lib/motion';
import { ExitTab, RouteShield, SignArrow } from '../ui/Signs';

/*
 * Background: an 8s seamless highway-drive loop rendered with Remotion
 * (source in video/). Landscape and portrait cuts; reduced-motion and
 * Data Saver visitors get the still poster instead.
 */
const DRIVE = {
  landscape: { webm: '/hero/drive-landscape.webm', mp4: '/hero/drive-landscape.mp4', poster: '/hero/drive-landscape.jpg' },
  portrait: { webm: '/hero/drive-portrait.webm', mp4: '/hero/drive-portrait.mp4', poster: '/hero/drive-portrait.jpg' },
};

function pickCut() {
  if (typeof window === 'undefined') return DRIVE.landscape;
  return window.matchMedia('(max-aspect-ratio: 4/5)').matches ? DRIVE.portrait : DRIVE.landscape;
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
  const [cut] = useState(pickCut);
  const [useVideo, setUseVideo] = useState(allowsVideo);
  const [playing, setPlaying] = useState(true);

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

  const togglePlayback = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <section ref={sectionRef} id="top" className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-asphalt text-white lg:items-center">
      <motion.div className="absolute inset-0 -z-10" style={{ scale: reduceMotion ? 1 : bgScale }}>
        {useVideo ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            poster={cut.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            {/* MP4 first: it's the smaller encode and plays everywhere. A failed <source>
                doesn't fire the video's onError, so watch the last one. */}
            <source src={cut.mp4} type="video/mp4" />
            <source src={cut.webm} type="video/webm" onError={() => setUseVideo(false)} />
          </video>
        ) : (
          <img src={cut.poster} alt="" aria-hidden="true" className="h-full w-full object-cover" fetchPriority="high" />
        )}
        {/* Legibility: shade the side the sign sits on */}
        <div className="absolute inset-0 bg-gradient-to-t from-sign-ink via-sign-ink/40 to-transparent lg:bg-gradient-to-r lg:from-sign-ink/90 lg:via-sign-ink/35 lg:to-transparent" />
      </motion.div>

      <div className="mx-auto w-full max-w-7xl px-5 pb-10 pt-28 sm:px-8 sm:pb-14 lg:pb-0 lg:pt-24 short:pt-20">
        <motion.div style={{ y: reduceMotion ? 0 : signY }} className="max-w-[44rem]">
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
                className="mt-5 text-[clamp(2.5rem,6.2vw,4.9rem)] font-black leading-[0.98] tracking-[-0.035em] short:text-[2.4rem]"
              >
                Capacity you can plan around.
              </motion.h1>

              <motion.p variants={rise} className="mt-5 max-w-xl text-[1.08rem] leading-relaxed text-white/88 sm:text-lg short:hidden">
                Full-truckload freight across the contiguous US, dispatched from Chicago and Dallas — new Freightliner
                Cascadias, GPS on every load, and proof of delivery the moment it lands.
              </motion.p>

              {/* Hub rows: tablet and up — on phones the video's gantry signs carry them, and the card stays short enough to leave the road visible. */}
              <motion.div variants={rise} className="mt-7 hidden border-t-[3px] border-white pt-5 sm:block short:!hidden">
                <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {COMPANY.hubs.map((hub, i) => (
                    <li key={hub} className="flex items-center gap-3">
                      <SignArrow dir={i === 0 ? 'up' : 'up-right'} className="h-8 w-7 shrink-0" />
                      <span>
                        <span className="block text-2xl font-black leading-none tracking-tight">{hub}</span>
                        <span className="legend text-[0.62rem] text-white/70">Dispatch hub</span>
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

      {useVideo && (
        <button
          type="button"
          onClick={togglePlayback}
          className="absolute bottom-5 right-5 grid h-11 w-11 place-items-center rounded-lg bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65 max-lg:top-24 max-lg:bottom-auto"
          aria-label={playing ? 'Pause background video' : 'Play background video'}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      )}
    </section>
  );
}
