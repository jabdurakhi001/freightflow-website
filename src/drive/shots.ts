/**
 * The camera script. One "shot" per page chapter: where the camera sits, what it looks at and
 * what state the world is in. Each shot is a function of the chapter's own scroll progress
 * (0 at its top, 1 at its bottom) so the camera keeps drifting while a chapter is on screen;
 * the engine blends neighbouring shots as the page scrolls from one chapter to the next.
 *
 * World: metres, Y up, the truck sits at the origin and drives toward −Z.
 */
export interface Shot {
  pos: [number, number, number];
  tgt: [number, number, number];
  fov: number;
  /** 0 night … 1 dawn */
  day: number;
  /** blueprint amount for tractor / trailer */
  xT: number;
  xL: number;
  /** 0 road world … 1 the lower-48 map */
  map: number;
  /** illustrative network lanes on the map */
  net: number;
  /** the five step gates on the road */
  gates: number;
  /** road speed in m/s */
  speed: number;
  /** Chicago skyline behind the truck */
  skyline: number;
  /** where the scene's centre sits on wide screens: −1 left … +1 right of the copy */
  side: number;
  /** how far the truck has pulled ahead of its mark (metres) */
  lead: number;
  /** how much of the frame the copy needs (darkens the scene behind long text) */
  dim: number;
}

export type ShotFn = (p: number) => Shot;

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const base: Shot = {
  pos: [7, 1.4, -19], tgt: [0, 2.2, -4], fov: 32, day: 0, xT: 0, xL: 0, map: 0, net: 0, gates: 0,
  speed: 26, skyline: 0, side: 1, lead: 0, dim: 0,
};

export const SHOTS: Record<string, ShotFn> = {
  // Low, in front of the bumper: the truck comes at you out of Chicago.
  hero: (p) => ({ ...base, pos: [mix(7.5, 9.5, p), mix(1.25, 2.2, p), mix(-21, -17, p)], tgt: [0, 2.3, -4], fov: 30, skyline: 1, side: 0.9 }),
  // Side tracking shot; the trailer opens up to show one shipper's freight.
  services: (p) => ({ ...base, pos: [mix(21, 19, p), mix(2.4, 3.4, p), mix(-1, 4, p)], tgt: [0, 2.1, 1.5], fov: 30, xL: mix(0.55, 1, Math.min(1, p * 2)), skyline: 0.3, side: 0.75, day: 0.04 }),
  // Straight down: scrolling drives the truck through the five gates.
  how: () => ({ ...base, pos: [1.5, 46, 3.5], tgt: [1.5, 0, 0], fov: 30, gates: 1, speed: 0, side: 0.85, day: 0.08 }),
  // Lift off: the truck's spot becomes the Chicago hub on the map.
  lanes: (p) => ({ ...base, pos: [-95, mix(1260, 1160, p), 62], tgt: [-95, 0, 56], fov: 30, map: 1, side: 0.95, day: 0.1, speed: 26 }),
  // Tilt down over the map: every lane the platform is watching.
  platform: (p) => ({ ...base, pos: [mix(-90, -10, p), 640, mix(700, 660, p)], tgt: [-40, 0, 70], fov: 30, map: 1, net: 1, side: -0.95, day: 0.12 }),
  // Back on the road, behind the doors.
  compliance: (p) => ({ ...base, pos: [mix(-4.2, -3.2, p), mix(2.6, 3.4, p), mix(21, 24, p)], tgt: [0, 2.3, 4], fov: 34, side: 0.8, day: 0.2 }),
  // Blueprint: the rig as a drawing.
  fleet: (p) => ({ ...base, pos: [mix(15, 12, p), mix(6.5, 5.5, p), mix(-17, -19, p)], tgt: [0, 1.9, -0.5], fov: 34, xT: 1, xL: 1, side: -0.7, day: 0.38, speed: 22 }),
  // Close on the cab as the sky warms.
  drivers: (p) => ({ ...base, pos: [mix(-6.5, -5.2, p), mix(2.3, 2.9, p), mix(-15.5, -13, p)], tgt: [0, 2.7, -7], fov: 34, side: 0.8, day: 0.66 }),
  // High and behind, heading for the light.
  faq: (p) => ({ ...base, pos: [mix(12, 9, p), mix(10, 8, p), mix(34, 30, p)], tgt: [0, 2, -12], fov: 36, side: 0.9, day: 0.84, dim: 0.35 }),
  // The truck pulls away into the sunrise.
  cta: (p) => ({ ...base, pos: [3.2, 1.3, 15], tgt: [0.6, mix(3.2, 3.8, p), -30], fov: 34, side: 0, day: 1, lead: mix(0, 26, p) }),
};

export const SHOT_KEYS = Object.keys(SHOTS);

const lerp3 = (a: number[], b: number[], t: number): [number, number, number] => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

/** Linear blend of every field. Camera paths that need an arc get it from `arc` in the engine. */
export function blendShots(a: Shot, b: Shot, t: number): Shot {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const out = { ...a } as Shot;
  (Object.keys(a) as (keyof Shot)[]).forEach((k) => {
    const va = a[k], vb = b[k];
    if (typeof va === 'number') (out[k] as number) = mix(va, vb as number, t);
    else (out[k] as [number, number, number]) = lerp3(va as number[], vb as number[], t);
  });
  return out;
}
