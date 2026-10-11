import type { CSSProperties } from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';

/*
 * Hero clips that follow the site's light/dark theme, built from the owner's
 * day-to-night clip (frames extracted by prepare-daynight.mjs, 24 fps). The
 * source changes light continuously — day, sunset, dusk, night with the
 * headlights on — with the truck and camera moving throughout:
 *
 *   DayIntro    frames 0–57 in real time; rests on 57 (the day rest frame).
 *   NightIntro  frames 112–191 in real time (3.3 s); rests on 191 (night rest).
 *   DayToNight  the source's own change of light, 57→191, played as a
 *               time-lapse: unhurried through sunset and dusk, quicker through
 *               the night drive, easing into night rest.
 *   NightToDay  the source only runs day→night (reversed, the truck would drive
 *               backwards), so this one is built: from night rest 191 a sunrise
 *               glow builds and flares to cover the change of framing, then the
 *               day drive plays as an easing time-lapse into day rest 57.
 *
 * Every clip shares one base grade and ends with its overlays at zero, so the
 * rest frames match exactly and the site can cut between clips invisibly.
 * All four are ≤5 s and only play on load or on a theme toggle (WCAG 2.2.2).
 */

export const DN_FPS = 30;
export const DN_FRAMES = { DayIntro: 73, NightIntro: 100, DayToNight: 96, NightToDay: 84 } as const;

const DAY_REST = 57;
const NIGHT_START = 112;
const NIGHT_REST = 191;
const SRC_FPS = 24;

const GRADE = 'contrast(1.05) saturate(1.06)';
const src = (n: number) => staticFile(`daynight/f${String(Math.round(n)).padStart(3, '0')}.jpg`);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const full: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%' };

/** One source frame with the shared grade, plus an optional extra brightness. */
function Frame({ n, opacity = 1, brightness = 1 }: { n: number; opacity?: number; brightness?: number }) {
  return (
    <Img
      src={src(n)}
      style={{ ...full, objectFit: 'cover', opacity, filter: `${GRADE}${brightness !== 1 ? ` brightness(${brightness})` : ''}` }}
    />
  );
}

/** Warm low-sun light from the horizon (sunset or sunrise). */
function SunGlow({ amount, warmth = 1 }: { amount: number; warmth?: number }) {
  if (amount <= 0.001) return null;
  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 85% 60% at 50% 52%, rgba(255,${Math.round(150 - 40 * warmth)},70,${0.85 * amount}) 0%, rgba(255,110,80,${0.45 * amount}) 38%, transparent 72%)`,
          mixBlendMode: 'soft-light',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 22% at 50% 50%, rgba(255,214,150,${0.55 * amount}) 0%, transparent 70%)`,
          mixBlendMode: 'screen',
        }}
      />
    </>
  );
}

/** Full-frame sunrise flare that hides the cut between framings. */
function Flare({ amount }: { amount: number }) {
  if (amount <= 0.001) return null;
  return (
    <AbsoluteFill
      style={{ background: `radial-gradient(ellipse 120% 90% at 50% 50%, rgba(255,236,200,${amount}) 0%, rgba(255,200,140,${0.85 * amount}) 60%, rgba(255,170,110,${0.7 * amount}) 100%)` }}
    />
  );
}

export function DayIntro() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Frame n={Math.min(DAY_REST, (f * SRC_FPS) / DN_FPS)} />
    </AbsoluteFill>
  );
}

export function NightIntro() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Frame n={Math.min(NIGHT_REST, NIGHT_START + Math.floor((f * SRC_FPS) / DN_FPS))} />
    </AbsoluteFill>
  );
}

// DayToNight playhead: keyframes (output frame → source frame) joined by a
// monotone cubic, so speed changes smoothly and the playhead never runs back.
//   0–0.3 s   ease out of day rest            57 → 62
//   0.3–1 s   sunset and dusk                 62 → 88
//   1–2 s     dark, headlights on, ~1× speed  88 → 111
//   2–3.2 s   the night drive, quick, then easing into night rest 111 → 191
const D2N_KEYS: [number, number][] = [
  [0, DAY_REST],
  [9, 62],
  [30, 88],
  [60, 111],
  [80, 176],
  [95, NIGHT_REST],
];
const D2N_PATH = (() => {
  const xs = D2N_KEYS.map((k) => k[0]);
  const ys = D2N_KEYS.map((k) => k[1]);
  const n = xs.length;
  const d = xs.slice(1).map((x, i) => (ys[i + 1] - ys[i]) / (x - xs[i]));
  // Fritsch–Carlson tangents; zero at both ends so it eases in and out.
  const m = xs.map((_, i) => (i === 0 || i === n - 1 ? 0 : d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i])));
  const path: number[] = [];
  for (let f = 0; f <= xs[n - 1]; f++) {
    const i = Math.min(n - 2, xs.findIndex((x, j) => f >= x && f <= xs[j + 1]));
    const h = xs[i + 1] - xs[i];
    const t = (f - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    path.push((2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]);
  }
  return path;
})();

export function DayToNight() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Frame n={D2N_PATH[Math.min(f, D2N_PATH.length - 1)]} />
    </AbsoluteFill>
  );
}

export function NightToDay() {
  const f = useCurrentFrame();
  // 0–17: night rest frame as the sunrise glow builds and lifts the exposure.
  // 18–28: a flare blooms to near-white; the framing changes under it (22–25).
  // 26–83: the flare clears off the day drive, a time-lapse settling into rest frame 56.
  const nightLift = interpolate(f, [0, 17, 25], [1, 1.45, 1.9], clamp);
  const sunrise = interpolate(f, [0, 16, 30, 64], [0, 0.9, 0.7, 0], clamp);
  const flare = interpolate(f, [12, 22, 25, 40], [0, 0.96, 0.96, 0], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const mix = interpolate(f, [22, 25], [0, 1], clamp);
  const dayN = interpolate(f, [22, 83], [0, DAY_REST], { ...clamp, easing: Easing.out(Easing.cubic) });
  const dayLift = interpolate(f, [22, 40, 66], [1.35, 1.12, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {mix < 1 && <Frame n={NIGHT_REST} brightness={nightLift} />}
      {mix > 0 && <Frame n={dayN} opacity={mix} brightness={dayLift} />}
      <SunGlow amount={sunrise} warmth={0.6} />
      <Flare amount={flare} />
    </AbsoluteFill>
  );
}
