import type { LatLon } from '../../lib/lanes';

/**
 * The lower-48 part of d3's geoAlbersUsa().scale(1300).translate([487.5, 305]): the
 * projection us-atlas used to pre-project public/flow/us48.json into a 975×610 box.
 * Re-implemented here (conic equal-area, parallels 29.5°/45.5°, rotate 96°, centre
 * −0.6°/38.7°) so the site doesn't ship d3-geo for 56 city points.
 */
export const MAP_W = 975;
export const MAP_H = 610;

const R = Math.PI / 180;
const K = 1300, TX = 487.5, TY = 305;
const Y0 = 29.5 * R, Y1 = 45.5 * R;
const SY0 = Math.sin(Y0);
const N = (SY0 + Math.sin(Y1)) / 2;
const C = 1 + SY0 * (2 * N - SY0);
const R0 = Math.sqrt(C) / N;

function raw(lambda: number, phi: number): [number, number] {
  const r = Math.sqrt(C - 2 * N * Math.sin(phi)) / N;
  const x = lambda * N;
  return [r * Math.sin(x), R0 - r * Math.cos(x)];
}

// d3 projects the (unrotated) centre and shifts the translate so it lands on [TX, TY].
const [CX, CY] = raw(-0.6 * R, 38.7 * R);
const DX = TX - K * CX, DY = TY + K * CY;

export function projectAlbers([lat, lon]: LatLon): [number, number] {
  let lambda = (lon + 96) * R;
  if (lambda > Math.PI) lambda -= 2 * Math.PI;
  else if (lambda < -Math.PI) lambda += 2 * Math.PI;
  const [x, y] = raw(lambda, lat * R);
  return [DX + K * x, DY - K * y];
}

/** Control point for the lane's gentle arc (quadratic Bézier), bending left of travel. */
export function laneControl(p1: readonly number[], p2: readonly number[]): [number, number] {
  const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2, dx = p2[0] - p1[0], dy = p2[1] - p1[1];
  const len = Math.hypot(dx, dy) || 1, bend = Math.min(80, len * 0.2);
  return [mx + (dy / len) * bend, my - (dx / len) * bend];
}
