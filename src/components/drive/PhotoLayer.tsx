import { useEffect, useRef, useState } from 'react';
import { useDrive, useDriveStill } from './DriveContext';

/**
 * Photographic plates that take over from the 3D scene in the chapters that are simply
 * "the truck on the road". Each plate belongs to a `data-shot` section and fades in as that
 * section reaches the middle of the screen; only the two map chapters stay 3D.
 * A plate is a still, plus a looping clip when one exists for it.
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
  /** a clip over the still: `loop` repeats seamlessly, `once` plays as the chapter arrives and holds its last frame */
  video?: 'loop' | 'once';
}

export const PLATES: Plate[] = [
  // in page order: a later plate fades in on top of the one before it
  { shot: 'hero', name: 'hero', pos: '72% 50%', posTall: '86% 50%', copy: 'left', video: 'loop' },
  { shot: 'services', name: 'services', pos: '76% 50%', posTall: '84% 50%', copy: 'left' },
  { shot: 'how', name: 'how', pos: '62% 50%', posTall: '56% 50%', copy: 'left' },
  { shot: 'compliance', name: 'compliance', pos: '80% 50%', posTall: '86% 50%', copy: 'left', video: 'loop' },
  { shot: 'fleet', name: 'fleet', pos: '20% 50%', posTall: '26% 50%', copy: 'right' },
  { shot: 'drivers', name: 'drivers', pos: '82% 50%', posTall: '66% 50%', copy: 'left', video: 'loop' },
  { shot: 'faq', name: 'aerial', pos: '70% 60%', posTall: '74% 60%', copy: 'wide', video: 'loop' },
  { shot: 'cta', name: 'closing', pos: '50% 80%', posTall: '72% 80%', copy: 'top', video: 'loop' },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

export default function PhotoLayer() {
  const drive = useDrive();
  const still = useDriveStill();
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const shown = useRef<boolean[]>([]);
  const refresh = useRef<() => void>(() => {});
  // no clips for reduced motion or a data-saving connection: the stills stand on their own
  const [clips] = useState(() => !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
  // a plate's files are requested once its chapter is within reach, the hero's at once
  // phones get the 720p encode
  const [small] = useState(() => Math.min(window.innerWidth, window.innerHeight) < 600);
  const [armed, setArmed] = useState<boolean[]>(() => PLATES.map((_, i) => i === 0));

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
      const near: number[] = [];
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
        if (r.top < H * 2.5 && r.bottom > -H * 1.5) near.push(i);
        const v = videos.current[i];
        if (v) {
          const on = o > 0.02;
          if (on && !shown.current[i]) {
            // arriving: a one-shot clip starts over, a loop carries on
            if (PLATES[i].video === 'once') v.currentTime = 0;
            void v.play().catch(() => {});
          } else if (!on && !v.paused) v.pause();
          shown.current[i] = on;
        }
      });
      drive.setCovered(covered);
      // labels pinned to the 3D scene make no sense over a photograph
      document.documentElement.classList.toggle('plate-on', top > 0.3);
      if (near.length) setArmed((a) => (near.every((i) => a[i]) ? a : a.map((v, i) => v || near.includes(i))));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    refresh.current = on;
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    const ro = new ResizeObserver(on);
    ro.observe(document.body);
    read();
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      ro.disconnect();
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
                src={`${base}-1920.jpg`} srcSet={`${base}-960.jpg 960w, ${base}-1920.jpg 1920w`} sizes="100vw"
                alt="" decoding="async" fetchPriority={i === 0 ? 'high' : 'low'}
              />
            )}
            {armed[i] && p.video && clips && !still && (
              <video ref={(el) => { videos.current[i] = el; if (el) refresh.current(); }} src={`/drive/video/${p.name}${small ? '-720' : ''}.mp4`} muted loop={p.video === 'loop'} playsInline preload={i === 0 ? 'auto' : 'metadata'} />
            )}
          </div>
        );
      })}
    </div>
  );
}
