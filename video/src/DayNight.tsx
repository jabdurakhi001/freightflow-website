import type { CSSProperties } from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';

/*
 * Hero clips that follow the site's light/dark theme, built from the owner's
 * day-to-night clip (frames extracted by prepare-daynight.mjs, 24 fps):
 *
 *   DayIntro    frames 0–56 in real time; rests on 56 (the day rest frame).
 *   NightIntro  frames 72–191 in real time (5 s); rests on 191 (night rest).
 *   DayToNight  starts on day rest 56. The sky warms to sunset and dims
 *               (frames 57–67 already dim a little), dissolves into night
 *               (the source cut at 68 keeps the camera continuous), then the
 *               night drive plays as a time-lapse that eases into night rest 191.
 *   NightToDay  starts on night rest 191. A sunrise glow builds from the
 *               horizon and flares to cover the change of framing, then the day
 *               drive plays as an easing time-lapse into day rest 56.
 *
 * Every clip shares one base grade and ends with its overlays at zero, so the
 * rest frames match exactly and the site can cut between clips invisibly.
 * All four are ≤5 s and only play on load or on a theme toggle (WCAG 2.2.2).
 */

export const DN_FPS = 30;
export const DN_FRAMES = { DayIntro: 71, NightIntro: 150, DayToNight: 90, NightToDay: 84 } as const;

const DAY_REST = 56;
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

/** Blue-hour sky closing in from the top as the light goes. */
function Dusk({ amount }: { amount: number }) {
  if (amount <= 0.001) return null;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, rgba(12,22,62,${0.75 * amount}) 0%, rgba(30,30,80,${0.45 * amount}) 45%, rgba(10,12,30,${0.35 * amount}) 100%)`,
        mixBlendMode: 'multiply',
      }}
    />
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
      <Frame n={Math.min(NIGHT_REST, 72 + Math.floor((f * SRC_FPS) / DN_FPS))} />
    </AbsoluteFill>
  );
}

export function DayToNight() {
  const f = useCurrentFrame();
  // 0–13: from day rest 56 through the last daylight (to 67), warming and dimming.
  // 14–25: dissolve into night while the source runs 68→70.
  // 26–89: the night drive as a time-lapse, easing out into rest frame 191.
  const dayN = interpolate(f, [0, 13], [DAY_REST, 67], clamp);
  const dayDim = interpolate(f, [0, 13, 25], [1, 0.78, 0.6], clamp);
  const sunset = interpolate(f, [0, 10, 22, 40], [0, 0.75, 0.55, 0], clamp);
  const dusk = interpolate(f, [4, 20, 34, 60], [0, 0.7, 0.45, 0], clamp);
  const mix = interpolate(f, [14, 25], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const nightN = interpolate(f, [14, 26, 89], [68, 70, NIGHT_REST], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {mix < 1 && <Frame n={dayN} brightness={dayDim} />}
      {mix > 0 && <Frame n={nightN} opacity={mix} />}
      <SunGlow amount={sunset} />
      <Dusk amount={dusk} />
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
