import { useEffect, useRef, useState } from 'react';
import { useDrive, useDriveStill } from './DriveContext';

/**
 * Photographic plates that take over from the 3D scene in the chapters that are simply
 * "the truck on the road". Each plate belongs to a `data-shot` section and fades in as that
 * section reaches the middle of the screen; the map, gates and blueprint chapters stay 3D.
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
  copy: 'left' | 'wide' | 'top';
  video?: boolean;
}

export const PLATES: Plate[] = [
  { shot: 'hero', name: 'hero', pos: '72% 50%', posTall: '86% 50%', copy: 'left' },
  { shot: 'compliance', name: 'compliance', pos: '80% 50%', posTall: '86% 50%', copy: 'left' },
  { shot: 'drivers', name: 'drivers', pos: '82% 50%', posTall: '100% 50%', copy: 'left' },
  { shot: 'faq', name: 'aerial', pos: '70% 60%', posTall: '74% 60%', copy: 'wide' },
  { shot: 'cta', name: 'sunrise', pos: '50% 70%', posTall: '50% 70%', copy: 'top' },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

export default function PhotoLayer() {
  const drive = useDrive();
  const still = useDriveStill();
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
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
      let covered = false;
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
        if (r.top < H * 2.5 && r.bottom > -H * 1.5) near.push(i);
        const v = videos.current[i];
        if (v) {
          if (o > 0.02 && !still) { if (v.paused) void v.play().catch(() => {}); }
          else if (!v.paused) v.pause();
        }
      });
      drive.setCovered(covered);
      if (near.length) setArmed((a) => (near.every((i) => a[i]) ? a : a.map((v, i) => v || near.includes(i))));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
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
            {armed[i] && p.video && !still && (
              <video ref={(el) => { videos.current[i] = el; }} src={`/drive/video/${p.name}${small ? '-720' : ''}.mp4`} muted loop playsInline preload={i === 0 ? 'auto' : 'metadata'} />
            )}
          </div>
        );
      })}
    </div>
  );
}
