import { useEffect, useRef, useState } from 'react';
import { useDrive, useDriveStill } from './DriveContext';

/**
 * Sketch plates: line drawings of the rig on a Chicago expressway, one per `data-shot`
 * chapter, each a still with a looping clip over it. A plate fades in as its chapter reaches
 * the middle of the screen. Only the two map chapters show the 3D scene.
 */
interface Plate {
  shot: string;
  name: string;
  /** object-position, so the rig stays in frame when a tall screen crops the 16:9 plate */
  pos: string;
  /** the same, for portrait screens, where the plate fills only part of the height */
  posTall: string;
  /** where the copy sits, for the scrim */
  copy: 'left' | 'right' | 'wide' | 'top';
}

export const PLATES: Plate[] = [
  // in page order: a later plate fades in on top of the one before it
  { shot: 'hero', name: 'hero', pos: '72% 50%', posTall: '78% 50%', copy: 'left' },
  { shot: 'services', name: 'services', pos: '76% 50%', posTall: '84% 50%', copy: 'left' },
  { shot: 'how', name: 'how', pos: '56% 50%', posTall: '52% 8%', copy: 'left' },
  { shot: 'compliance', name: 'compliance', pos: '80% 50%', posTall: '86% 50%', copy: 'left' },
  { shot: 'fleet', name: 'fleet', pos: '20% 50%', posTall: '26% 50%', copy: 'right' },
  { shot: 'drivers', name: 'drivers', pos: '82% 50%', posTall: '66% 50%', copy: 'left' },
  { shot: 'faq', name: 'aerial', pos: '70% 60%', posTall: '74% 60%', copy: 'wide' },
  { shot: 'cta', name: 'closing', pos: '50% 80%', posTall: '72% 80%', copy: 'top' },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);
const same = (a: boolean[], b: boolean[]) => a.every((v, i) => v === b[i]);

export default function PhotoLayer() {
  const drive = useDrive();
  const still = useDriveStill();
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const refresh = useRef<() => void>(() => {});
  // no clips for reduced motion or a data-saving connection: the stills stand on their own
  const [clips] = useState(() =>
    !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  // phones get the smaller encode
  const [small] = useState(() => Math.min(window.innerWidth, window.innerHeight) < 600);
  // stills: the hero's at once, the rest when their chapter is near or the page has gone idle
  const [armed, setArmed] = useState<boolean[]>(() => PLATES.map((_, i) => i === 0));
  // clips: only for chapters near the screen, so a long page never holds eight decoders
  const [live, setLive] = useState<boolean[]>(() => PLATES.map((_, i) => i === 0));

  useEffect(() => {
    // a header link can jump to any chapter, so have every still in hand once the page settles
    const arm = () => setArmed(PLATES.map(() => true));
    const t = window.setTimeout(arm, 3500);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const H = window.innerHeight, mid = H * 0.5, m = H * 0.38;
      const all = Array.from(document.querySelectorAll<HTMLElement>('[data-shot]'));
      const rects = PLATES.map((p) => {
        const el = all.find((e) => e.dataset.shot === p.shot);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const i = all.indexOf(el);
        const isPlate = (e?: HTMLElement) => !!e && PLATES.some((q) => q.shot === e.dataset.shot);
        return { top: r.top, bottom: r.bottom, first: i === 0, last: i === all.length - 1, nextIsPlate: isPlate(all[i + 1]) };
      });
      // how far each plate has faded in / out around its section's edges
      const enter = rects.map((r) => (!r ? 0 : r.first ? 1 : ease(clamp01((mid - (r.top - m)) / (2 * m)))));
      let covered = false, top = 0;
      const near = PLATES.map(() => false), close = PLATES.map(() => false);
      rects.forEach((r, i) => {
        const el = layers.current[i];
        if (!r || !el) return;
        let exit = r.last ? 1 : 1 - ease(clamp01((mid - (r.bottom - m)) / (2 * m)));
        // the next plate fades in on top of this one, so this one holds until it is hidden
        if (r.nextIsPlate) exit = enter[i + 1] >= 1 ? 0 : 1;
        const o = enter[i] * exit;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.004 ? 'hidden' : 'visible';
        if (o > 0.996) covered = true;
        if (o > top) top = o;
        near[i] = r.top < H * 2.5 && r.bottom > -H * 1.5;
        close[i] = r.top < H * 1.6 && r.bottom > -H * 0.6;
        const v = videos.current[i];
        if (v) {
          // the quote dialog pauses the page behind it
          const on = o > 0.02 && !drive.paused;
          if (on && v.paused) void v.play().catch(() => {});
          else if (!on && !v.paused) v.pause();
        }
      });
      drive.setCovered(covered);
      // labels pinned to the 3D scene make no sense over a plate
      document.documentElement.classList.toggle('plate-on', top > 0.3);
      setArmed((a) => { const n = a.map((v, i) => v || near[i]); return same(a, n) ? a : n; });
      setLive((a) => (same(a, close) ? a : close));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    refresh.current = on;
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    const ro = new ResizeObserver(on);
    ro.observe(document.body);
    const offPause = drive.onPause(on);
    read();
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      ro.disconnect();
      offPause();
      cancelAnimationFrame(raf);
      drive.setCovered(false);
      document.documentElement.classList.remove('plate-on');
    };
  }, [drive, still]);

  return (
    <div className="photos" aria-hidden="true">
      {PLATES.map((p, i) => {
        const base = `/drive/photo/${p.name}`;
        return (
          <div key={p.name} className={`photo photo-${p.copy}`} ref={(el) => { layers.current[i] = el; }} style={{ ['--pos' as string]: p.pos, ['--pos-tall' as string]: p.posTall }}>
            {armed[i] && (
              <img
                src={`${base}-1920.jpg`} srcSet={`${base}-960.jpg 960w, ${base}-1920.jpg 1600w`} sizes="100vw"
                alt="" decoding="async" fetchPriority={i === 0 ? 'high' : 'low'}
              />
            )}
            {live[i] && clips && !still && (
              <video
                ref={(el) => { videos.current[i] = el; if (el) refresh.current(); }}
                src={`/drive/video/${p.name}${small ? '-720' : ''}.mp4`} muted loop playsInline preload={i === 0 ? 'auto' : 'metadata'}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
