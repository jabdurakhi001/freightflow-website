/**
 * Procedural hero truck: modern aero sleeper tractor + 53 ft dry van.
 *
 * Conventions: metres, Y up, drives toward -Z, origin on the road at the
 * midpoint of the rig. No scene lights, no external assets.
 *
 * Render-order note for the host scene: everything that is (or can become)
 * transparent uses renderOrder 1..5 (blueprint lines 1, depth pre-pass 2,
 * body shells + glass 3, glow sprites 4, headlight beams 5).
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface TruckAnchors {
  tractor: THREE.Vector3;
  sleeper: THREE.Vector3;
  trailer: THREE.Vector3;
  telematics: THREE.Vector3;
  trailerRear: THREE.Vector3;
  headlights: THREE.Vector3;
}

export interface Truck {
  group: THREE.Group;
  anchors: TruckAnchors;
  /** total length in metres along Z, for the caller's framing */
  length: number;
  update(dt: number, speed: number): void;
  setHeadlights(level: number): void;
  setXray(tractor: number, trailer: number): void;
  setDaylight(t: number): void;
  dispose(): void;
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const RIG_LENGTH = 21.55;
const Z0 = -RIG_LENGTH / 2; // front bumper
/** station (metres behind the front bumper) -> rig z */
const zs = (s: number) => Z0 + s;

const WHEEL_R = 0.5;
const S_STEER = 1.28;
const S_DRIVE1 = 5.75;
const S_DRIVE2 = 7.05;
const S_CAB_BACK = 4.62;
const S_EXT = 5.02;
const S_FIFTH = 6.3;
const S_FRAME_END = 7.75;

const T_LEN = 16.15;
const TF = zs(5.4); // trailer front wall
const TR = TF + T_LEN; // trailer rear (= +RIG_LENGTH / 2)
const TW = 1.3; // trailer half width
const T_FLOOR = 1.25;
const T_TOP = 4.1;
const T_AXLE1 = TR - 2.75;
const T_AXLE2 = TR - 1.48;
const T_LANDING = TF + 2.95;

const NAVY = '#0b2545';
const OFFWHITE = '#f3f1ec';
const ORANGE = '#f26b1d';
const ORANGE_LIGHT = '#ff9d5c';
const FONT_STACK = '"Bricolage Grotesque", "Hanken Grotesk", system-ui, sans-serif';

/* ------------------------------------------------------------------ */
/* Small maths helpers                                                 */
/* ------------------------------------------------------------------ */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Monotone cubic (Fritsch-Carlson) interpolation: no overshoot between keys. */
function pchip(xs: number[], ys: number[]) {
  const n = xs.length;
  const h: number[] = [];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    h[i] = xs[i + 1] - xs[i];
    d[i] = (ys[i + 1] - ys[i]) / h[i];
  }
  const m: number[] = new Array(n).fill(0);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) m[i] = 0;
    else {
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const t = (x - xs[i]) / h[i];
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] +
      (t3 - 2 * t2 + t) * h[i] * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] +
      (t3 - t2) * h[i] * m[i + 1]
    );
  };
}

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

function box(w: number, h: number, d: number, x: number, y: number, z: number) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}
function cylX(r: number, len: number, x: number, y: number, z: number, seg = 16, r2 = r) {
  const g = new THREE.CylinderGeometry(r, r2, len, seg);
  g.rotateZ(Math.PI / 2);
  g.translate(x, y, z);
  return g;
}
function cylY(r: number, len: number, x: number, y: number, z: number, seg = 16, r2 = r) {
  const g = new THREE.CylinderGeometry(r, r2, len, seg);
  g.translate(x, y, z);
  return g;
}
function cylZ(r: number, len: number, x: number, y: number, z: number, seg = 16, r2 = r) {
  const g = new THREE.CylinderGeometry(r, r2, len, seg);
  g.rotateX(Math.PI / 2);
  g.translate(x, y, z);
  return g;
}
const _up = new THREE.Vector3(0, 1, 0);
function tube(a: THREE.Vector3, b: THREE.Vector3, r: number, seg = 8) {
  const dir = b.clone().sub(a);
  const len = dir.length();
  const g = new THREE.CylinderGeometry(r, r, len, seg);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(_up, dir.normalize()));
  const mid = a.clone().add(b).multiplyScalar(0.5);
  g.translate(mid.x, mid.y, mid.z);
  return g;
}
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Shape drawn in plan (x, -z) extruded upward from y0 by h. */
function extrudePlan(shape: THREE.Shape, y0: number, h: number, bevel = 0, curveSegments = 10) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 2,
    curveSegments,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0, 0);
  return g;
}

/** Normalise a geometry so heterogeneous pieces can be merged. */
function prep(g: THREE.BufferGeometry) {
  let out = g.index ? g.toNonIndexed() : g;
  if (out !== g) g.dispose();
  if (!out.getAttribute('normal')) out.computeVertexNormals();
  if (!out.getAttribute('uv')) {
    out.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(out.getAttribute('position').count * 2), 2));
  }
  for (const name of Object.keys(out.attributes)) {
    if (name !== 'position' && name !== 'normal' && name !== 'uv' && name !== 'color') out.deleteAttribute(name);
  }
  out.morphAttributes = {};
  return out;
}

function tint(g: THREE.BufferGeometry, color: THREE.ColorRepresentation) {
  const c = new THREE.Color(color);
  const n = g.getAttribute('position').count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

function pushEdges(target: number[], g: THREE.BufferGeometry, angle = 30) {
  const e = new THREE.EdgesGeometry(g, angle);
  const p = e.getAttribute('position');
  for (let i = 0; i < p.count; i++) target.push(p.getX(i), p.getY(i), p.getZ(i));
  e.dispose();
}

function pushCircleX(target: number[], x: number, y: number, z: number, r: number, seg = 28) {
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2;
    const a1 = ((i + 1) / seg) * Math.PI * 2;
    target.push(x, y + Math.cos(a0) * r, z + Math.sin(a0) * r, x, y + Math.cos(a1) * r, z + Math.sin(a1) * r);
  }
}

/* ------------------------------------------------------------------ */
/* Canvas textures                                                     */
/* ------------------------------------------------------------------ */

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function canvasTexture(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Tiny night "studio" environment so clearcoat, glass and chrome have something to reflect. */
function drawEnv(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d')!;
  const W = c.width;
  const H = c.height;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#14233f');
  g.addColorStop(0.34, '#2a4573');
  g.addColorStop(0.495, '#7890b8');
  g.addColorStop(0.52, '#10192a');
  g.addColorStop(1, '#05070c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const blob = (u: number, v: number, rx: number, ry: number, col: string) => {
    for (const du of [-1, 0, 1]) {
      ctx.save();
      ctx.translate((u + du) * W, v * H);
      ctx.scale(rx, ry);
      const r = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      r.addColorStop(0, col);
      r.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = r;
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };
  // long soft "softboxes" overhead and to the sides: these are what draw the highlights along the body
  blob(0.2, 0.2, W * 0.16, H * 0.07, 'rgba(235,242,255,0.6)');
  blob(0.7, 0.24, W * 0.14, H * 0.06, 'rgba(190,212,255,0.55)');
  blob(0.47, 0.06, W * 0.2, H * 0.06, 'rgba(210,225,255,0.5)');
  blob(0.93, 0.33, W * 0.07, H * 0.05, 'rgba(255,190,130,0.5)');
  blob(0.36, 0.4, W * 0.05, H * 0.03, 'rgba(255,170,110,0.45)');
  // horizon glow + a string of distant lights
  blob(0.55, 0.49, W * 0.3, H * 0.035, 'rgba(255,170,105,0.55)');
  blob(0.05, 0.49, W * 0.22, H * 0.03, 'rgba(150,185,255,0.5)');
  const rnd = mulberry(7);
  for (let i = 0; i < 26; i++) {
    blob(rnd(), 0.468 + rnd() * 0.02, 3.2, 2.2, rnd() > 0.5 ? 'rgba(255,214,160,1)' : 'rgba(215,232,255,1)');
  }
}

function drawGlow(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d')!;
  const s = c.width;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.12, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.14)');
  g.addColorStop(0.7, 'rgba(255,255,255,0.03)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
}

function drawSwoosh(ctx: CanvasRenderingContext2D, xa: number, xb: number, y: number, k: number) {
  // tail at xa (rear), tip at xb (toward the front of the truck)
  const L = xb - xa;
  const grad = ctx.createLinearGradient(xa, 0, xb, 0);
  grad.addColorStop(0, ORANGE_LIGHT);
  grad.addColorStop(0.55, ORANGE);
  grad.addColorStop(1, '#e85a10');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(xa, y + 6 * k);
  ctx.bezierCurveTo(xa + 0.3 * L, y + 64 * k, xa + 0.72 * L, y + 58 * k, xb, y - 92 * k);
  ctx.bezierCurveTo(xa + 0.74 * L, y + 104 * k, xa + 0.3 * L, y + 100 * k, xa, y + 6 * k);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,157,92,0.9)';
  ctx.beginPath();
  ctx.moveTo(xa + 0.16 * L, y + 86 * k);
  ctx.bezierCurveTo(xa + 0.42 * L, y + 136 * k, xa + 0.78 * L, y + 118 * k, xb - 0.03 * L, y - 8 * k);
  ctx.bezierCurveTo(xa + 0.78 * L, y + 136 * k, xa + 0.42 * L, y + 150 * k, xa + 0.16 * L, y + 86 * k);
  ctx.fill();
}

/** Trailer side: 16.15 m x 2.85 m. `frontRight`: the truck's nose is toward canvas-right. */
function drawTrailerSide(c: HTMLCanvasElement, frontRight: boolean) {
  const ctx = c.getContext('2d')!;
  const W = c.width;
  const H = c.height;
  const ppm = W / T_LEN;
  ctx.fillStyle = OFFWHITE;
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(255,255,255,0.10)');
  g.addColorStop(0.7, 'rgba(120,130,150,0.0)');
  g.addColorStop(1, 'rgba(70,80,100,0.16)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // panel seams + rivet columns every 4 ft
  const pitch = 1.2192 * ppm;
  for (let x = pitch * 0.5; x < W; x += pitch) {
    ctx.fillStyle = 'rgba(24,34,56,0.13)';
    ctx.fillRect(x - 1, 0, 2, H);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(x + 1, 0, 1.5, H);
    ctx.fillStyle = 'rgba(24,34,56,0.2)';
    for (let y = 9; y < H; y += 15) {
      ctx.beginPath();
      ctx.arc(x - 7, y, 1.5, 0, Math.PI * 2);
      ctx.arc(x + 8, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = 'rgba(24,34,56,0.18)';
  for (let x = 8; x < W; x += 15) {
    ctx.beginPath();
    ctx.arc(x, 30, 1.5, 0, Math.PI * 2);
    ctx.arc(x, H - 42, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // wordmark
  const k = H / 724;
  const fontPx = Math.round(318 * k);
  ctx.font = `500 ${fontPx}px ${FONT_STACK}`;
  try {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${-fontPx * 0.022}px`;
  } catch {
    /* older browsers */
  }
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const label = 'FreightFlow';
  const tw = ctx.measureText(label).width;
  const cx = W * (frontRight ? 0.5 : 0.5);
  const tx = cx - tw / 2;
  const base = H * 0.555;
  ctx.fillStyle = NAVY;
  ctx.fillText(label, tx, base);
  // swoosh flows toward the nose of the truck on both sides
  ctx.save();
  if (!frontRight) {
    ctx.translate(2 * cx, 0);
    ctx.scale(-1, 1);
  }
  drawSwoosh(ctx, tx - 0.5 * ppm, tx + tw + 1.5 * ppm, base + 70 * k, k);
  ctx.restore();
  // small fleet number, low at the rear end
  try {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = '2px';
  } catch {
    /* noop */
  }
  ctx.font = `500 ${Math.round(46 * k)}px ${FONT_STACK}`;
  ctx.fillStyle = 'rgba(11,37,69,0.78)';
  const unit = 'FF 5312';
  const uw = ctx.measureText(unit).width;
  ctx.fillText(unit, frontRight ? 0.55 * ppm : W - 0.55 * ppm - uw, H - 78 * k);
  ctx.fillText(unit, frontRight ? W - 0.6 * ppm - uw : 0.6 * ppm, 96 * k);
}

function drawTrailerBump(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d')!;
  const W = c.width;
  const H = c.height;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, W, H);
  const pitch = (1.2192 * W) / T_LEN;
  for (let x = pitch * 0.5; x < W; x += pitch) {
    ctx.fillStyle = '#b8b8b8';
    ctx.fillRect(x - 7, 0, 14, H);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x - 0.75, 0, 1.5, H);
    ctx.fillStyle = '#ffffff';
    for (let y = 5; y < H; y += 8) {
      ctx.fillRect(x - 4.5, y, 2, 2);
      ctx.fillRect(x + 3, y, 2, 2);
    }
  }
}

function drawRoof(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d')!;
  const W = c.width; // along the length
  const H = c.height;
  ctx.fillStyle = '#e9e7e1';
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(60,70,90,0.16)');
  g.addColorStop(0.2, 'rgba(255,255,255,0.05)');
  g.addColorStop(0.8, 'rgba(255,255,255,0.05)');
  g.addColorStop(1, 'rgba(60,70,90,0.16)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const pitch = (0.6096 * W) / T_LEN;
  for (let x = pitch; x < W; x += pitch) {
    ctx.fillStyle = 'rgba(30,40,60,0.10)';
    ctx.fillRect(x - 1, 0, 2, H);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x + 1, 0, 1, H);
  }
  ctx.font = `500 ${Math.round(H * 0.34)}px ${FONT_STACK}`;
  ctx.fillStyle = 'rgba(11,37,69,0.8)';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  ctx.fillText('FF 5312', W - H * 0.5, H * 0.5);
}

/** Rear doors: 2.42 m x 2.71 m. */
function drawRearDoors(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d')!;
  const W = c.width;
  const H = c.height;
  const ppm = W / 2.42;
  ctx.fillStyle = '#eeece6';
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(255,255,255,0.08)');
  g.addColorStop(1, 'rgba(60,70,90,0.2)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // door seam + gaskets
  ctx.fillStyle = 'rgba(12,16,24,0.85)';
  ctx.fillRect(W / 2 - 3, 0, 6, H);
  ctx.strokeStyle = 'rgba(12,16,24,0.55)';
  ctx.lineWidth = 5;
  ctx.strokeRect(5, 5, W / 2 - 10, H - 10);
  ctx.strokeRect(W / 2 + 5, 5, W / 2 - 10, H - 10);
  // horizontal stiffener shadows
  for (const f of [0.25, 0.5, 0.75]) {
    ctx.fillStyle = 'rgba(20,28,44,0.10)';
    ctx.fillRect(10, H * f - 2, W - 20, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(10, H * f + 1, W - 20, 1.5);
  }
  // DOT conspicuity: full width red/white along the bottom, white inverted Ls at the top corners
  const seg = 0.28 * ppm;
  const th = 0.055 * ppm;
  for (let x = 0, i = 0; x < W; x += seg, i++) {
    ctx.fillStyle = i % 2 === 0 ? '#d3161b' : '#f7f7f4';
    ctx.fillRect(x, H - th - 14, seg + 1, th);
  }
  ctx.fillStyle = '#f7f7f4';
  const l = 0.3 * ppm;
  ctx.fillRect(14, 14, l, th);
  ctx.fillRect(14, 14, th, l);
  ctx.fillRect(W - 14 - l, 14, l, th);
  ctx.fillRect(W - 14 - th, 14, th, l);
  // small wordmark on the left door
  ctx.font = `500 ${Math.round(0.088 * ppm)}px ${FONT_STACK}`;
  ctx.fillStyle = NAVY;
  ctx.textBaseline = 'alphabetic';
  const label = 'FreightFlow';
  const tw = ctx.measureText(label).width;
  const tx = W * 0.26 - tw / 2;
  const ty = H * 0.2;
  ctx.fillText(label, tx, ty);
  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.moveTo(tx - 4, ty + 12);
  ctx.bezierCurveTo(tx + tw * 0.4, ty + 27, tx + tw * 0.8, ty + 22, tx + tw + 10, ty - 5);
  ctx.bezierCurveTo(tx + tw * 0.8, ty + 31, tx + tw * 0.4, ty + 36, tx - 4, ty + 12);
  ctx.fill();
}

function drawTape(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d')!;
  const W = c.width;
  const H = c.height;
  ctx.fillStyle = '#f4f4f0';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#d3161b';
  ctx.fillRect(0, 0, W * 0.61, H);
}

function drawCarton(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d')!;
  const S = c.width;
  ctx.fillStyle = '#cba779';
  ctx.fillRect(0, 0, S, S);
  const rnd = mulberry(3);
  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = `rgba(${rnd() > 0.5 ? '255,235,200' : '80,50,20'},${rnd() * 0.05})`;
    ctx.fillRect(rnd() * S, rnd() * S, 2 + rnd() * 30, 1);
  }
  // darker folded edges
  const e = ctx.createLinearGradient(0, 0, S, 0);
  e.addColorStop(0, 'rgba(60,36,14,0.55)');
  e.addColorStop(0.07, 'rgba(60,36,14,0)');
  e.addColorStop(0.93, 'rgba(60,36,14,0)');
  e.addColorStop(1, 'rgba(60,36,14,0.55)');
  ctx.fillStyle = e;
  ctx.fillRect(0, 0, S, S);
  const e2 = ctx.createLinearGradient(0, 0, 0, S);
  e2.addColorStop(0, 'rgba(60,36,14,0.55)');
  e2.addColorStop(0.07, 'rgba(60,36,14,0)');
  e2.addColorStop(0.93, 'rgba(60,36,14,0)');
  e2.addColorStop(1, 'rgba(60,36,14,0.6)');
  ctx.fillStyle = e2;
  ctx.fillRect(0, 0, S, S);
  // tape + label
  ctx.fillStyle = 'rgba(236,214,170,0.75)';
  ctx.fillRect(0, S * 0.46, S, S * 0.08);
  ctx.fillStyle = 'rgba(248,246,240,0.92)';
  ctx.fillRect(S * 0.62, S * 0.64, S * 0.24, S * 0.17);
  ctx.fillStyle = 'rgba(30,30,30,0.6)';
  ctx.fillRect(S * 0.65, S * 0.68, S * 0.18, S * 0.02);
  ctx.fillRect(S * 0.65, S * 0.73, S * 0.12, S * 0.02);
}

function drawTyre(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d')!;
  const W = c.width;
  const H = c.height;
  ctx.fillStyle = '#17181b';
  ctx.fillRect(0, 0, W, H);
  const t0 = H * (4 / 12);
  const t1 = H * (8 / 12);
  // tread band
  ctx.fillStyle = '#1f2024';
  ctx.fillRect(0, t0, W, t1 - t0);
  ctx.fillStyle = '#060607';
  for (let i = 1; i <= 4; i++) ctx.fillRect(0, t0 + ((t1 - t0) * i) / 5 - 1.5, W, 3);
  for (let x = 0; x < W; x += W / 16) {
    ctx.fillRect(x, t0, 3, (t1 - t0) * 0.2);
    ctx.fillRect(x + W / 32, t1 - (t1 - t0) * 0.2, 3, (t1 - t0) * 0.2);
    ctx.fillRect(x + W / 64, t0 + (t1 - t0) * 0.42, 2, (t1 - t0) * 0.16);
  }
  // sidewalls: ring + raised lettering blocks so rotation reads
  for (const y of [H * 0.17, H * 0.83]) {
    ctx.fillStyle = '#26272b';
    ctx.fillRect(0, y - 1, W, 2);
    ctx.fillStyle = '#34363b';
    ctx.fillRect(W * 0.08, y - 7, W * 0.3, 4);
    ctx.fillRect(W * 0.62, y + 3, W * 0.16, 3);
  }
}

/* ------------------------------------------------------------------ */
/* Tractor body: a lofted skin                                         */
/* ------------------------------------------------------------------ */

const KS = [0.04, 0.1, 0.22, 0.4, 0.65, 0.9, 1.28, 1.8, 2.0, 2.06, 2.45, 2.8, 2.86, 3.3, 3.9, 4.3, 4.62, 5.02];
const fW = pchip(KS, [0.66, 0.82, 1.0, 1.13, 1.2, 1.22, 1.23, 1.22, 1.21, 1.21, 1.21, 1.21, 1.21, 1.22, 1.23, 1.23, 1.23, 1.24]);
const fYt = pchip(KS, [1.6, 1.7, 1.78, 1.85, 1.91, 1.95, 2.01, 2.1, 2.14, 2.2, 2.66, 3.08, 3.16, 3.54, 3.87, 3.97, 4.0, 4.02]);
const fRx = pchip(KS, [0.16, 0.22, 0.28, 0.3, 0.3, 0.3, 0.3, 0.28, 0.24, 0.16, 0.14, 0.14, 0.16, 0.22, 0.26, 0.28, 0.28, 0.28]);
const fRy = pchip(KS, [0.14, 0.2, 0.26, 0.3, 0.3, 0.3, 0.3, 0.28, 0.24, 0.16, 0.14, 0.14, 0.16, 0.22, 0.26, 0.28, 0.28, 0.28]);
const fTh = pchip(KS, [0.04, 0.06, 0.1, 0.16, 0.2, 0.22, 0.22, 0.2, 0.16, 0.1, 0.09, 0.08, 0.08, 0.07, 0.06, 0.06, 0.06, 0.06]);
const fBelt = pchip(KS, [1.24, 1.31, 1.36, 1.4, 1.44, 1.47, 1.52, 1.62, 1.86, 2.16, 2.16, 2.16, 2.16, 2.16, 2.16, 2.16, 2.16, 2.16]);
const fCrown = pchip(KS, [0.03, 0.04, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.06, 0.07, 0.07, 0.07, 0.07, 0.06, 0.06, 0.06, 0.06]);
const fAcc = pchip(KS, [1.17, 1.23, 1.27, 1.3, 1.31, 1.32, 1.33, 1.35, 1.36, 1.36, 1.38, 1.41, 1.42, 1.48, 1.6, 1.7, 1.78, 1.9]);
const ACC_W = 0.05;
const Y_WIN_TOP = 2.95;
const ARCH_R = 0.63;

interface Sec {
  w: number;
  yb: number;
  ymid: number;
  yacc: number;
  ybelt: number;
  ywt: number;
  yt: number;
  rx: number;
  ry: number;
  th: number;
  crown: number;
  rb: number;
}

function secAt(s: number): Sec {
  let yb = 0.42;
  if (s < S_STEER - ARCH_R) yb = 0.58;
  const d = s - S_STEER;
  if (Math.abs(d) < ARCH_R) yb = Math.max(yb, WHEEL_R + Math.sqrt(ARCH_R * ARCH_R - d * d));
  return {
    w: fW(s),
    yb,
    ymid: 0.98,
    yacc: fAcc(s),
    ybelt: fBelt(s),
    ywt: Y_WIN_TOP,
    yt: fYt(s),
    rx: fRx(s),
    ry: fRy(s),
    th: fTh(s),
    crown: fCrown(s),
    rb: 0.035,
  };
}

function levels(c: Sec) {
  const xf = Math.max(0.05, c.w - c.th - c.rx);
  const ysh = c.yt - c.crown - c.ry;
  const low = c.yb + c.rb;
  const belt = clamp(Math.min(c.ybelt, ysh - 0.02), low, 99);
  const wt = clamp(Math.min(c.ywt, ysh - 0.07), belt, Math.max(belt, ysh));
  const accTop = clamp(Math.min(c.yacc + ACC_W, belt), low, belt);
  const acc = clamp(Math.min(c.yacc, accTop), low, accTop);
  const mid = clamp(c.ymid, low, acc);
  const leanY = Math.max(low, Math.min(c.ybelt, ysh - 0.13));
  const kS = clamp((c.th - 0.1) / 0.08, 0, 1);
  const sideX = (y: number) => {
    if (y <= leanY) return c.w;
    const t = clamp((y - leanY) / Math.max(1e-4, ysh - leanY), 0, 1);
    return c.w - c.th * lerp(t, t * t * (3 - 2 * t), kS);
  };
  return { xf, ysh, low, belt, wt, accTop, acc, mid, sideX };
}

const N_TOP = 5;
const N_COR = 6;
const N_UP = 2;
const N_WIN = 2;
const N_LB = 2;
const N_ACC = 1;
const N_LA1 = 2;
const N_LA2 = 2;
const N_BC = 2;
const N_BOT = 2;
const HALF_SEGS = N_TOP + N_COR + N_UP + N_WIN + N_LB + N_ACC + N_LA1 + N_LA2 + N_BC + N_BOT; // 26
const RING = HALF_SEGS * 2;
type SegGroup = 'top' | 'corner' | 'upper' | 'window' | 'lowerB' | 'accent' | 'lowerA1' | 'lowerA2' | 'bcorner' | 'bottom';
const SEG_GROUPS: SegGroup[] = [];
(
  [
    ['top', N_TOP],
    ['corner', N_COR],
    ['upper', N_UP],
    ['window', N_WIN],
    ['lowerB', N_LB],
    ['accent', N_ACC],
    ['lowerA1', N_LA1],
    ['lowerA2', N_LA2],
    ['bcorner', N_BC],
    ['bottom', N_BOT],
  ] as [SegGroup, number][]
).forEach(([g, n]) => {
  for (let i = 0; i < n; i++) SEG_GROUPS.push(g);
});

/** Half profile (x >= 0) from the top centre round to the bottom centre: HALF_SEGS + 1 points. */
function profile(c: Sec): [number, number][] {
  const L = levels(c);
  const pts: [number, number][] = [];
  for (let i = 0; i <= N_TOP; i++) {
    const x = (L.xf * i) / N_TOP;
    pts.push([x, c.yt - c.crown * (x / L.xf) ** 2]);
  }
  for (let i = 1; i <= N_COR; i++) {
    const a = ((i / N_COR) * Math.PI) / 2;
    pts.push([L.xf + c.rx * Math.sin(a), L.ysh + c.ry * Math.cos(a)]);
  }
  const run = (from: number, to: number, n: number) => {
    for (let i = 1; i <= n; i++) {
      const y = lerp(from, to, i / n);
      pts.push([L.sideX(y), y]);
    }
  };
  run(L.ysh, L.wt, N_UP);
  run(L.wt, L.belt, N_WIN);
  run(L.belt, L.accTop, N_LB);
  run(L.accTop, L.acc, N_ACC);
  run(L.acc, L.mid, N_LA1);
  run(L.mid, L.low, N_LA2);
  for (let i = 1; i <= N_BC; i++) {
    const a = ((i / N_BC) * Math.PI) / 2;
    pts.push([c.w - c.rb + c.rb * Math.cos(a), c.yb + c.rb * (1 - Math.sin(a))]);
  }
  for (let i = 1; i <= N_BOT; i++) pts.push([(c.w - c.rb) * (1 - i / N_BOT), c.yb]);
  return pts;
}

/** Outer x of the body side at station s and height y. */
function bodyX(s: number, y: number) {
  return levels(secAt(s)).sideX(y);
}
/** Height of the roof / hood / windshield skin at station s, lateral x. */
function topY(s: number, x: number) {
  const c = secAt(s);
  const L = levels(c);
  const ax = Math.abs(x);
  if (ax <= L.xf) return c.yt - c.crown * (ax / L.xf) ** 2;
  const sn = clamp((ax - L.xf) / c.rx, 0, 1);
  return L.ysh + c.ry * Math.sqrt(1 - sn * sn);
}

interface LoftResult {
  geos: Map<string, THREE.BufferGeometry>;
  lines: number[];
  accentLines: number[];
  stations: number[];
  disposeBase(): void;
}

function buildLoft(
  stations: number[],
  matFor: (sMid: number, g: SegGroup) => string | null,
  ringStations: number[],
  lineIdx: number[],
): LoftResult {
  const nS = stations.length;
  const pos = new Float32Array(nS * RING * 3);
  for (let i = 0; i < nS; i++) {
    const p = profile(secAt(stations[i]));
    for (let k = 0; k < RING; k++) {
      const right = k <= HALF_SEGS;
      const pt = right ? p[k] : p[RING - k];
      const o = (i * RING + k) * 3;
      pos[o] = right ? pt[0] : -pt[0];
      pos[o + 1] = pt[1];
      pos[o + 2] = zs(stations[i]);
    }
  }
  const idxBy = new Map<string, number[]>();
  const all: number[] = [];
  for (let i = 0; i < nS - 1; i++) {
    const sMid = (stations[i] + stations[i + 1]) / 2;
    for (let k = 0; k < RING; k++) {
      const seg = k < HALF_SEGS ? k : RING - 1 - k;
      const key = matFor(sMid, SEG_GROUPS[seg]);
      const a = i * RING + k;
      const b = i * RING + ((k + 1) % RING);
      const c = (i + 1) * RING + k;
      const d = (i + 1) * RING + ((k + 1) % RING);
      all.push(a, c, b, b, c, d);
      if (!key) continue;
      let list = idxBy.get(key);
      if (!list) idxBy.set(key, (list = []));
      list.push(a, c, b, b, c, d);
    }
  }
  const base = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pos, 3);
  base.setAttribute('position', posAttr);
  base.setIndex(all);
  base.computeVertexNormals();
  const nAttr = base.getAttribute('normal');
  const geos = new Map<string, THREE.BufferGeometry>();
  idxBy.forEach((list, key) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', posAttr);
    g.setAttribute('normal', nAttr);
    g.setIndex(list);
    geos.set(key, g);
  });
  // blueprint contour lines
  const lines: number[] = [];
  const accentLines: number[] = [];
  const P = (i: number, k: number, target: number[]) => {
    const o = (i * RING + ((k + RING) % RING)) * 3;
    target.push(pos[o], pos[o + 1], pos[o + 2]);
  };
  const ACC_IDX = N_TOP + N_COR + N_UP + N_WIN + N_LB;
  for (const j of lineIdx) {
    for (const k of j === 0 ? [0] : [j, RING - j]) {
      const target = j === ACC_IDX ? accentLines : lines;
      for (let i = 0; i < nS - 1; i++) {
        P(i, k, target);
        P(i + 1, k, target);
      }
    }
  }
  for (const rs of ringStations) {
    let best = 0;
    for (let i = 1; i < nS; i++) if (Math.abs(stations[i] - rs) < Math.abs(stations[best] - rs)) best = i;
    for (let k = 0; k < RING; k++) {
      P(best, k, lines);
      P(best, k + 1, lines);
    }
  }
  return { geos, lines, accentLines, stations, disposeBase: () => base.dispose() };
}

function loftCap(s: number, facing: -1 | 1) {
  const p = profile(secAt(s));
  const ring: [number, number][] = [];
  for (let k = 0; k < RING; k++) {
    const right = k <= HALF_SEGS;
    const pt = right ? p[k] : p[RING - k];
    ring.push([right ? pt[0] : -pt[0], pt[1]]);
  }
  const cy = (p[0][1] + p[HALF_SEGS][1]) / 2;
  const z = zs(s);
  const v: number[] = [];
  for (let k = 0; k < RING; k++) {
    const a = ring[k];
    const b = ring[(k + 1) % RING];
    if (facing < 0) v.push(0, cy, z, a[0], a[1], z, b[0], b[1], z);
    else v.push(0, cy, z, b[0], b[1], z, a[0], a[1], z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3));
  g.computeVertexNormals();
  // make sure it faces the requested way
  const n = g.getAttribute('normal');
  if (Math.sign(n.getZ(1)) !== facing) {
    const pa = g.getAttribute('position');
    for (let i = 0; i < pa.count; i += 3) {
      const x1 = pa.getX(i + 1), y1 = pa.getY(i + 1);
      pa.setXYZ(i + 1, pa.getX(i + 2), pa.getY(i + 2), z);
      pa.setXYZ(i + 2, x1, y1, z);
    }
    g.computeVertexNormals();
  }
  return g;
}

/** A patch that hugs the body side: grid over (s, y). side: +1 right (+x), -1 left. */
function sidePatch(
  sA: number,
  sB: number,
  nS: number,
  yA: (s: number) => number,
  yB: (s: number) => number,
  nY: number,
  off: number,
  side: 1 | -1,
) {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= nS; i++) {
    const s = lerp(sA, sB, i / nS);
    for (let j = 0; j <= nY; j++) {
      const y = lerp(yA(s), yB(s), j / nY);
      const x = bodyX(s, y);
      const dxds = (bodyX(s + 0.01, y) - bodyX(s - 0.01, y)) / 0.02;
      const dxdy = (bodyX(s, y + 0.01) - bodyX(s, y - 0.01)) / 0.02;
      const len = Math.hypot(1, dxds, dxdy);
      pos.push(side * (x + off / len), y - (off * dxdy) / len, zs(s) - (off * dxds) / len);
    }
  }
  const row = nY + 1;
  for (let i = 0; i < nS; i++) {
    for (let j = 0; j < nY; j++) {
      const a = i * row + j;
      const b = (i + 1) * row + j;
      const c = i * row + j + 1;
      const d = (i + 1) * row + j + 1;
      if (side > 0) idx.push(a, c, b, b, c, d);
      else idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Outward unit normal of the body side (+x side) at (s, y). */
function sideNormal(s: number, y: number) {
  const dxds = (bodyX(s + 0.01, y) - bodyX(s - 0.01, y)) / 0.02;
  return new THREE.Vector3(1, 0, -dxds).normalize();
}

/* ------------------------------------------------------------------ */
/* createTruck                                                         */
/* ------------------------------------------------------------------ */

export function createTruck(): Truck {
  const group = new THREE.Group();
  group.name = 'truck';

  const textures: THREE.Texture[] = [];
  const track = <T extends THREE.Texture>(t: T) => {
    textures.push(t);
    return t;
  };

  /* ---------- sprung groups ---------- */
  const cabPivot = new THREE.Group();
  cabPivot.position.set(0, 0.9, zs(3.0));
  const cab = new THREE.Group();
  cab.position.copy(cabPivot.position).multiplyScalar(-1);
  cabPivot.add(cab);
  const trailerPivot = new THREE.Group();
  trailerPivot.position.set(0, 1.0, zs(S_FIFTH));
  const trailer = new THREE.Group();
  trailer.position.copy(trailerPivot.position).multiplyScalar(-1);
  trailerPivot.add(trailer);
  group.add(cabPivot, trailerPivot);

  /* ---------- environment ---------- */
  const envCanvas = makeCanvas(512, 256);
  drawEnv(envCanvas);
  const envTex = track(canvasTexture(envCanvas));
  envTex.mapping = THREE.EquirectangularReflectionMapping;

  /* ---------- x-ray bookkeeping ---------- */
  type Zone = 0 | 1;
  interface Fade {
    m: THREE.Material & { color: THREE.Color; opacity: number };
    zone: Zone;
    baseOp: number;
    xOp: number;
    baseTransparent: boolean;
    baseColor: THREE.Color;
    xColor: THREE.Color;
    prepass: boolean;
  }
  const fades: Fade[] = [];
  const fadeOf = new Map<THREE.Material, Fade>();
  const twins: THREE.Object3D[][] = [[], []];
  const GLASS_TINT = new THREE.Color('#0b1a30');
  function reg<T extends THREE.Material>(m: T, zone: Zone, xOp = 0.1, prepass = true, tintAmt = 0.85): T {
    const mm = m as unknown as Fade['m'];
    const f: Fade = {
      m: mm,
      zone,
      baseOp: mm.opacity,
      xOp,
      baseTransparent: mm.transparent,
      baseColor: mm.color.clone(),
      xColor: mm.color.clone().lerp(GLASS_TINT, tintAmt),
      prepass,
    };
    fades.push(f);
    fadeOf.set(m, f);
    return m;
  }
  const preFront = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true, transparent: true });
  const preDouble = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true, transparent: true, side: THREE.DoubleSide });

  function addMesh(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, name?: string) {
    const me = new THREE.Mesh(geo, mat);
    if (name) me.name = name;
    const f = fadeOf.get(mat);
    if (f) {
      me.renderOrder = 3;
      if (f.prepass) {
        const tw = new THREE.Mesh(geo, mat.side === THREE.DoubleSide ? preDouble : preFront);
        tw.renderOrder = 2;
        tw.visible = false;
        parent.add(tw);
        twins[f.zone].push(tw);
      }
    }
    parent.add(me);
    return me;
  }

  /* ---------- materials ---------- */
  const std = (p: THREE.MeshStandardMaterialParameters) =>
    new THREE.MeshStandardMaterial({ envMap: envTex, envMapIntensity: 1, ...p });

  const paint = reg(
    new THREE.MeshPhysicalMaterial({
      color: '#0e2e59', // reads as brand navy #0b2545 once it is under night lighting
      metalness: 0.18,
      roughness: 0.5,
      specularIntensity: 0.45,
      clearcoat: 0.28,
      clearcoatRoughness: 0.45,
      sheen: 0.3,
      sheenColor: new THREE.Color('#6f9be0'),
      sheenRoughness: 0.45,
      envMap: envTex,
      envMapIntensity: 1.5,
    }),
    0,
    0.13,
  );
  const paintDouble = reg(paint.clone(), 0, 0.13);
  paintDouble.side = THREE.DoubleSide;
  const accent = reg(
    std({ color: ORANGE, roughness: 0.4, metalness: 0.1, emissive: new THREE.Color(ORANGE), emissiveIntensity: 0.35 }),
    0,
    0.9,
    false,
    0,
  );
  const trim = reg(std({ color: '#07090d', roughness: 0.36, metalness: 0.3, envMapIntensity: 1.4 }), 0, 0.16);
  const plastic = reg(std({ color: '#12161c', roughness: 0.72, metalness: 0.1, envMapIntensity: 0.5 }), 0, 0.14);
  const chrome = reg(std({ color: '#d5dbe3', roughness: 0.3, metalness: 1, envMapIntensity: 1.2 }), 0, 0.3, false, 0.3);
  const glass = reg(
    new THREE.MeshPhysicalMaterial({
      color: '#0a1522',
      metalness: 0.2,
      roughness: 0.2,
      transparent: true,
      opacity: 0.66,
      depthWrite: false,
      envMap: envTex,
      envMapIntensity: 2.0,
    }),
    0,
    0.14,
    false,
    0.2,
  );
  const liner = reg(
    std({ color: '#1a1512', roughness: 0.95, metalness: 0, side: THREE.BackSide, emissive: new THREE.Color('#ff9d5c'), emissiveIntensity: 0.11, envMapIntensity: 0 }),
    0,
    0,
    false,
    0,
  );
  const interior = reg(std({ color: '#2a2622', roughness: 0.9, emissive: new THREE.Color('#ff9d5c'), emissiveIntensity: 0.03, envMapIntensity: 0 }), 0, 0.22, false, 0.5);
  const chassis = std({ color: '#191d24', roughness: 0.62, metalness: 0.55, envMapIntensity: 0.7 });
  const chassisBase = chassis.color.clone();
  const alu = reg(std({ color: '#aab2bc', roughness: 0.4, metalness: 0.95, envMapIntensity: 1.2 }), 0, 0.3, false, 0.4);
  const rubber = reg(std({ color: '#0c0d0f', roughness: 0.92, metalness: 0, envMapIntensity: 0.2 }), 0, 0.3, false, 0.2);

  const tyreCanvas = makeCanvas(512, 96);
  drawTyre(tyreCanvas);
  const tyreTex = track(canvasTexture(tyreCanvas));
  tyreTex.wrapS = THREE.RepeatWrapping;
  tyreTex.repeat.set(8, 1);
  const mkTyre = (zone: Zone) => reg(std({ color: '#ffffff', map: tyreTex, roughness: 0.88, metalness: 0, envMapIntensity: 0.25 }), zone, 0.28, true, 0.3);
  const mkRim = (zone: Zone) =>
    reg(std({ color: '#aeb6bf', roughness: 0.42, metalness: 1, envMapIntensity: 1.3, vertexColors: true, side: THREE.DoubleSide }), zone, 0.4, true, 0.3);
  const tyreMat: [THREE.Material, THREE.Material] = [mkTyre(0), mkTyre(1)];
  const rimMat: [THREE.Material, THREE.Material] = [mkRim(0), mkRim(1)];

  // trailer
  const sideCanvasR = makeCanvas(4096, 724);
  const sideCanvasL = makeCanvas(4096, 724);
  const doorCanvas = makeCanvas(1024, 1146);
  const bumpCanvas = makeCanvas(2048, 362);
  drawTrailerBump(bumpCanvas);
  const roofCanvas = makeCanvas(2048, 330);
  const tapeCanvas = makeCanvas(64, 8);
  drawTape(tapeCanvas);
  const sideTexR = track(canvasTexture(sideCanvasR));
  const sideTexL = track(canvasTexture(sideCanvasL));
  const doorTex = track(canvasTexture(doorCanvas));
  const bumpTex = track(canvasTexture(bumpCanvas, false));
  const roofTex = track(canvasTexture(roofCanvas));
  const tapeTex = track(canvasTexture(tapeCanvas));
  tapeTex.wrapS = THREE.RepeatWrapping;
  tapeTex.magFilter = THREE.NearestFilter;
  const redrawText = () => {
    drawTrailerSide(sideCanvasR, true);
    drawTrailerSide(sideCanvasL, false);
    drawRearDoors(doorCanvas);
    drawRoof(roofCanvas);
    roofTex.needsUpdate = true;
    sideTexR.needsUpdate = true;
    sideTexL.needsUpdate = true;
    doorTex.needsUpdate = true;
  };
  redrawText();

  const whiteP = { color: '#ffffff', roughness: 0.5, metalness: 0.12, envMapIntensity: 0.55 };
  const lit = { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.1 };
  const sideMatR = reg(std({ ...whiteP, ...lit, map: sideTexR, emissiveMap: sideTexR, bumpMap: bumpTex, bumpScale: 1.2 }), 1, 0.1);
  const sideMatL = reg(std({ ...whiteP, ...lit, map: sideTexL, emissiveMap: sideTexL, bumpMap: bumpTex, bumpScale: 1.2 }), 1, 0.1);
  const roofMat = reg(std({ ...whiteP, map: roofTex }), 1, 0.07);
  const whiteMat = reg(std({ ...whiteP, color: '#eeece6' }), 1, 0.1);
  const doorMat = reg(std({ ...whiteP, map: doorTex }), 1, 0.1);
  const skirtMat = reg(std({ color: '#dcdad4', roughness: 0.6, metalness: 0.05, envMapIntensity: 0.4, side: THREE.DoubleSide }), 1, 0.1);
  const tAlu = reg(std({ color: '#b4bbc4', roughness: 0.42, metalness: 0.9, envMapIntensity: 1.1 }), 1, 0.3, false, 0.4);
  const floorMat = reg(std({ color: '#2a2622', roughness: 0.85, metalness: 0.1, envMapIntensity: 0.2 }), 1, 0.45, false, 0.3);
  const tRubber = reg(std({ color: '#0c0d0f', roughness: 0.92, metalness: 0, envMapIntensity: 0.2 }), 1, 0.3, false, 0.2);
  const bogie = std({ color: '#191d24', roughness: 0.62, metalness: 0.55, envMapIntensity: 0.7 });
  const tapeMat = reg(
    std({ color: '#ffffff', map: tapeTex, emissive: new THREE.Color('#ffffff'), emissiveMap: tapeTex, emissiveIntensity: 0.3, roughness: 0.35, metalness: 0.2 }),
    1,
    0.75,
    false,
    0,
  );

  const plateMat = std({ color: '#e6e6e1', roughness: 0.5, metalness: 0.1, envMapIntensity: 0.4 });
  const driver = reg(std({ color: '#141a24', roughness: 0.85, envMapIntensity: 0, emissive: new THREE.Color('#ff9d5c'), emissiveIntensity: 0.02 }), 0, 0.3, false, 0.3);
  const domeLamp = new THREE.MeshBasicMaterial({ color: '#ffb070', side: THREE.DoubleSide });
  const airLineMat = std({ color: '#ffffff', vertexColors: true, roughness: 0.5, envMapIntensity: 0.4 });
  const airLines: THREE.BufferGeometry[] = [];

  /* ---------- lamps ---------- */
  type LampKind = 'head' | 'drl' | 'marker' | 'tail' | 'fog';
  interface Lamp {
    m: THREE.MeshBasicMaterial;
    base: THREE.Color;
    intensity: number;
    kind: LampKind;
  }
  const lamps: Lamp[] = [];
  const lamp = (hex: string, intensity: number, kind: LampKind, double = false) => {
    const m = new THREE.MeshBasicMaterial({ color: hex, side: double ? THREE.DoubleSide : THREE.FrontSide });
    lamps.push({ m, base: new THREE.Color(hex), intensity, kind });
    return m;
  };
  const headMat = lamp('#fff3dc', 3.6, 'head');
  const drlMat = lamp('#f4f1ff', 2.2, 'drl', true);
  const fogMat = lamp('#ffe9c4', 1.6, 'fog');
  const amberMat = lamp('#ff8a1e', 2.6, 'marker');
  const redMat = lamp('#ff1a12', 3.2, 'tail');
  const redDimMat = lamp('#ff1a12', 2.2, 'marker');
  const screenMat = lamp('#ffb070', 0.9, 'marker');

  /* ---------- batches ---------- */
  type LineKey = 'tractor' | 'tractorKey' | 'trailer' | 'trailerFaint' | 'trailerKey' | 'cargo';
  const lineColors: Record<LineKey, [string, number]> = {
    tractor: [OFFWHITE, 0.85],
    tractorKey: [ORANGE_LIGHT, 0.95],
    trailer: ['#c9d2e0', 0.85],
    trailerFaint: ['#c9d2e0', 0.3],
    trailerKey: [ORANGE_LIGHT, 0.95],
    cargo: ['#ffd9a8', 0.32],
  };
  const lineMats = {} as Record<LineKey, THREE.LineBasicMaterial>;
  (Object.keys(lineColors) as LineKey[]).forEach((k) => {
    lineMats[k] = new THREE.LineBasicMaterial({ color: lineColors[k][0], transparent: true, opacity: 0, depthWrite: false });
  });
  const lineObjs: THREE.LineSegments[] = [];

  class Batch {
    geos = new Map<THREE.Material, THREE.BufferGeometry[]>();
    lines = new Map<LineKey, number[]>();
    constructor(public parent: THREE.Object3D) {}
    line(key: LineKey) {
      let l = this.lines.get(key);
      if (!l) this.lines.set(key, (l = []));
      return l;
    }
    add(mat: THREE.Material, geo: THREE.BufferGeometry, lineKey?: LineKey | null, angle = 30) {
      const g = prep(geo);
      if (lineKey) pushEdges(this.line(lineKey), g, angle);
      let list = this.geos.get(mat);
      if (!list) this.geos.set(mat, (list = []));
      list.push(g);
      return this;
    }
    build() {
      this.geos.forEach((list, mat) => {
        const merged = mergeGeometries(list, false);
        list.forEach((g) => g.dispose());
        if (merged) addMesh(this.parent, merged, mat);
      });
      this.lines.forEach((arr, key) => {
        if (!arr.length) return;
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr), 3));
        const ls = new THREE.LineSegments(g, lineMats[key]);
        ls.renderOrder = 1;
        ls.visible = false;
        ls.frustumCulled = false;
        this.parent.add(ls);
        lineObjs.push(ls);
      });
    }
  }

  const bCab = new Batch(cab);
  const bChassis = new Batch(group);
  const bTrailer = new Batch(trailer);
  const bBogie = new Batch(group);

  /* ================================================================ */
  /* TRACTOR BODY                                                      */
  /* ================================================================ */
  {
    // station sampling: uniform + key breakpoints + fine steps round the wheel arch
    const set: number[] = [];
    for (let s = 0.04; s <= S_CAB_BACK + 1e-6; s += 0.06) set.push(s);
    set.push(0.07, 0.5, 2.0, 2.03, 2.06, 2.08, 2.2, 2.78, 2.8, 2.83, 2.86, 3.42, 3.44, S_CAB_BACK);
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * Math.PI;
      set.push(S_STEER - Math.cos(a) * ARCH_R * 0.9995);
    }
    set.push(S_STEER - ARCH_R - 0.012, S_STEER + ARCH_R + 0.012);
    set.sort((a, b) => a - b);
    const stations: number[] = [];
    for (const s of set) if (!stations.length || s - stations[stations.length - 1] > 0.014) stations.push(s);

    const matFor = (s: number, g: SegGroup): string => {
      if (g === 'top') return s > 2.08 && s < 2.78 ? 'glass' : 'paint';
      if (g === 'corner') return s > 2.06 && s < 2.8 ? 'trim' : 'paint';
      if (g === 'window') return s > 2.2 && s < 3.42 ? 'glass' : s > 3.42 && s < 3.44 ? 'trim' : 'paint';
      if (g === 'accent') return s < 0.5 ? 'trim' : 'accent';
      if (g === 'lowerA1') return s < 0.5 ? 'trim' : 'paint';
      return 'paint';
    };
    const LI = [
      0,
      N_TOP,
      N_TOP + N_COR,
      N_TOP + N_COR + N_UP + N_WIN,
      N_TOP + N_COR + N_UP + N_WIN + N_LB,
      HALF_SEGS - N_BC - N_BOT,
    ];
    const loft = buildLoft(stations, matFor, [0.04, 0.5, 1.28, 2.06, 2.8, 3.43, 4.0, S_CAB_BACK], LI);
    const mats: Record<string, THREE.Material> = { paint, glass, trim, accent };
    // interior liner first (so it sits behind in creation order), reusing every non-glass cell
    const linerIdx: number[] = [];
    loft.geos.forEach((g, key) => {
      if (key !== 'glass') linerIdx.push(...(g.index!.array as unknown as number[]));
    });
    const linerGeo = new THREE.BufferGeometry();
    linerGeo.setAttribute('position', loft.geos.get('paint')!.getAttribute('position'));
    linerGeo.setAttribute('normal', loft.geos.get('paint')!.getAttribute('normal'));
    linerGeo.setIndex(linerIdx);
    addMesh(cab, linerGeo, liner, 'cabLiner');
    loft.geos.forEach((g, key) => addMesh(cab, g, mats[key], `cab_${key}`));
    loft.disposeBase();
    bCab.line('tractor').push(...loft.lines);
    bCab.line('tractorKey').push(...loft.accentLines);

    // cab extenders (open shell closing the gap to the trailer)
    const ext = buildLoft(
      [S_CAB_BACK, S_CAB_BACK + 0.016, 4.76, 4.9, S_EXT],
      (s, g) => {
        if (g === 'lowerA2' || g === 'bcorner' || g === 'bottom') return null;
        if (s < S_CAB_BACK + 0.016) return 'trim';
        return g === 'accent' ? 'accent' : 'paint';
      },
      [S_EXT],
      [0, N_TOP + N_COR],
    );
    const trimDouble = reg(trim.clone(), 0, 0.16, false);
    trimDouble.side = THREE.DoubleSide;
    const accentDouble = reg(accent.clone(), 0, 0.9, false, 0);
    accentDouble.side = THREE.DoubleSide;
    const extMats: Record<string, THREE.Material> = { paint: paintDouble, trim: trimDouble, accent: accentDouble };
    ext.geos.forEach((g, key) => addMesh(cab, g, extMats[key]));
    ext.disposeBase();
    bCab.line('tractor').push(...ext.lines);

    bCab.add(paint, loftCap(0.04, -1));
    bCab.add(paint, loftCap(S_CAB_BACK, 1));
  }

  /* ---------- grille ---------- */
  {
    const zf = zs(0.04);
    const gs = new THREE.Shape();
    gs.moveTo(-0.5, 0.95);
    gs.lineTo(0.5, 0.95);
    gs.quadraticCurveTo(0.565, 0.95, 0.56, 1.01);
    gs.lineTo(0.5, 1.47);
    gs.quadraticCurveTo(0.49, 1.54, 0.41, 1.54);
    gs.lineTo(-0.41, 1.54);
    gs.quadraticCurveTo(-0.49, 1.54, -0.5, 1.47);
    gs.lineTo(-0.56, 1.01);
    gs.quadraticCurveTo(-0.565, 0.95, -0.5, 0.95);
    const surround = new THREE.ExtrudeGeometry(gs, { depth: 0.03, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2, curveSegments: 6 });
    surround.rotateY(Math.PI);
    surround.translate(0, 0, zf + 0.012);
    bCab.add(chrome, surround, 'tractor', 50);
    const inner = new THREE.ShapeGeometry(gs, 6);
    inner.translate(0, -1.245, 0);
    inner.scale(0.93, 0.9, 1);
    inner.translate(0, 1.245, 0);
    inner.rotateY(Math.PI);
    inner.translate(0, 0, zf - 0.036);
    bCab.add(plastic, inner);
    for (let i = 0; i < 8; i++) {
      const y = 1.02 + i * 0.064;
      const hw = 0.515 - (y - 0.95) * 0.13;
      bCab.add(plastic, box(hw * 2, 0.03, 0.04, 0, y, zf - 0.046));
    }
    bCab.add(chrome, box(0.03, 0.52, 0.034, 0, 1.245, zf - 0.05));
  }

  /* ---------- bumper ---------- */
  {
    const P = (x: number, s: number): [number, number] => [x, -zs(s)];
    const mk = (w: number, front: number) => {
      const sh = new THREE.Shape();
      sh.moveTo(...P(-w, 0.64));
      sh.lineTo(...P(-w, 0.52));
      sh.bezierCurveTo(...P(-w, 0.2), ...P(-w + 0.22, front), ...P(-0.62, front));
      sh.lineTo(...P(0.62, front));
      sh.bezierCurveTo(...P(w - 0.22, front), ...P(w, 0.2), ...P(w, 0.52));
      sh.lineTo(...P(w, 0.64));
      sh.closePath();
      return sh;
    };
    bCab.add(paint, extrudePlan(mk(1.215, 0.028), 0.47, 0.4, 0.028, 14), 'tractor', 60);
    bCab.add(plastic, extrudePlan(mk(1.2, 0.05), 0.27, 0.2, 0.012, 14));
    // centre intake, fog lamps, plate
    const zf = Z0 - 0.002;
    bCab.add(trim, box(0.92, 0.2, 0.02, 0, 0.6, zf));
    for (let i = 0; i < 3; i++) bCab.add(plastic, box(0.88, 0.016, 0.03, 0, 0.545 + i * 0.055, zf - 0.004));
    for (const sx of [-1, 1]) {
      bCab.add(trim, box(0.2, 0.09, 0.02, sx * 0.62, 0.6, zf + 0.004));
      bCab.add(fogMat, box(0.15, 0.045, 0.02, sx * 0.62, 0.6, zf - 0.002));
    }
    bCab.add(chrome, box(1.5, 0.018, 0.02, 0, 0.8, zf + 0.002));
    bCab.add(plateMat, box(0.31, 0.155, 0.012, 0, 0.385, zf + 0.02));
  }

  /* ---------- headlights (lens region is part of the loft) ---------- */
  const HEAD_Y = 1.1;
  const headPos: THREE.Vector3[] = [];
  {
    for (const side of [1, -1] as const) {
      // LED signature strip along the top edge of the lamp, wrapping the corner
      bCab.add(
        drlMat,
        sidePatch(0.052, 0.49, 16, (s) => levels(secAt(s)).accTop - 0.036, (s) => levels(secAt(s)).accTop - 0.008, 1, 0.006, side),
      );
      // lower thin strip
      bCab.add(drlMat, sidePatch(0.3, 0.49, 6, () => 1.0, () => 1.02, 1, 0.006, side));
      // projector lenses
      for (const [s, r] of [
        [0.085, 0.052],
        [0.2, 0.046],
      ] as [number, number][]) {
        const n = sideNormal(s, HEAD_Y);
        const x = bodyX(s, HEAD_Y);
        const p = V(x, HEAD_Y, zs(s)).addScaledVector(n, 0.008);
        const q = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), n);
        const ring = new THREE.RingGeometry(r, r + 0.012, 20);
        ring.applyQuaternion(q);
        ring.translate(p.x, p.y, p.z);
        const disc = new THREE.CircleGeometry(r, 20);
        disc.applyQuaternion(q);
        disc.translate(p.x + n.x * 0.002, p.y, p.z + n.z * 0.002);
        if (side < 0) {
          ring.scale(-1, 1, 1);
          disc.scale(-1, 1, 1);
          flipWinding(ring);
          flipWinding(disc);
        }
        bCab.add(chrome, ring);
        bCab.add(headMat, disc);
      }
      headPos.push(V(side * bodyX(0.13, HEAD_Y), HEAD_Y, zs(0.13)));
    }
  }
  function flipWinding(g: THREE.BufferGeometry) {
    const idx = g.index;
    if (idx) {
      for (let i = 0; i < idx.count; i += 3) {
        const a = idx.getX(i + 1);
        idx.setX(i + 1, idx.getX(i + 2));
        idx.setX(i + 2, a);
      }
    }
    g.computeVertexNormals();
  }

  /* ---------- cab details ---------- */
  {
    for (const side of [1, -1] as const) {
      // door seams
      const yTop = (s: number) => levels(secAt(s)).wt + 0.03;
      bCab.add(trim, sidePatch(2.16, 2.172, 1, () => 1.0, () => 2.14, 6, 0.003, side));
      bCab.add(trim, sidePatch(3.43, 3.442, 1, () => 1.0, () => 2.16, 6, 0.003, side));
      bCab.add(trim, sidePatch(2.16, 3.442, 10, () => 1.0, () => 1.012, 1, 0.003, side));
      // window surround
      bCab.add(trim, sidePatch(2.32, 3.44, 14, (s) => levels(secAt(s)).wt - 0.004, yTop, 1, 0.004, side));
      bCab.add(trim, sidePatch(2.2, 3.44, 12, () => 2.125, () => 2.164, 1, 0.004, side));
      // step well + treads
      bCab.add(plastic, sidePatch(2.3, 3.36, 6, () => 0.455, () => 0.98, 3, 0.004, side));
      for (const y of [0.5, 0.78]) {
        bCab.add(alu, box(0.1, 0.028, 0.98, side * 1.262, y, zs(2.83)), 'tractor');
      }
      // door handle + grab rail
      bCab.add(chrome, box(0.02, 0.035, 0.16, side * (bodyX(3.28, 1.92) + 0.012), 1.92, zs(3.28)));
      const gx = side * (bodyX(3.56, 2.0) + 0.05);
      bCab.add(chrome, tube(V(gx, 1.52, zs(3.56)), V(gx, 2.72, zs(3.56)), 0.014, 8));
      for (const y of [1.54, 2.7]) bCab.add(chrome, tube(V(gx, y, zs(3.56)), V(side * 1.21, y, zs(3.56)), 0.012, 6));
      // sleeper vent / toolbox door outline
      bCab.add(trim, sidePatch(3.78, 4.42, 6, () => 1.0, () => 1.012, 1, 0.003, side));
      bCab.add(trim, sidePatch(3.78, 3.79, 1, () => 0.5, () => 1.0, 3, 0.003, side));
      bCab.add(trim, sidePatch(4.41, 4.42, 1, () => 0.5, () => 1.0, 3, 0.003, side));
      // wheel-arch lip
      const lip: THREE.BufferGeometry[] = [];
      const N = 22;
      for (let i = 0; i < N; i++) {
        const a0 = (i / N) * Math.PI;
        const a1 = ((i + 1) / N) * Math.PI;
        const r = ARCH_R + 0.012;
        lip.push(
          tube(
            V(side * 1.232, WHEEL_R + Math.sin(a0) * r, zs(S_STEER) - Math.cos(a0) * r),
            V(side * 1.232, WHEEL_R + Math.sin(a1) * r, zs(S_STEER) - Math.cos(a1) * r),
            0.022,
            6,
          ),
        );
      }
      lip.forEach((g) => bCab.add(plastic, g));

      // main mirror
      const mz = zs(2.34);
      const housing = new THREE.ExtrudeGeometry(roundedRect(0.2, 0.58, 0.06), { depth: 0.07, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 3, curveSegments: 6 });
      housing.translate(side * 1.5, 2.56, mz - 0.035);
      bCab.add(trim, housing, 'tractor', 50);
      bCab.add(chrome, box(0.17, 0.52, 0.006, side * 1.5, 2.56, mz + 0.062));
      bCab.add(plastic, tube(V(side * 1.17, 2.3, zs(2.4)), V(side * 1.5, 2.34, mz), 0.018, 8));
      bCab.add(plastic, tube(V(side * 1.14, 2.84, zs(2.56)), V(side * 1.5, 2.8, mz), 0.018, 8));
      bCab.add(amberMat, box(0.01, 0.05, 0.05, side * 1.622, 2.56, mz));
      // hood mirror
      const hm = new THREE.SphereGeometry(0.1, 14, 10);
      hm.scale(0.75, 1.15, 0.5);
      hm.translate(side * 1.32, 1.78, zs(0.84));
      bCab.add(trim, hm);
      bCab.add(plastic, tube(V(side * 1.06, 1.5, zs(0.98)), V(side * 1.31, 1.72, zs(0.85)), 0.014, 6));
      // wipers
      const wx = side > 0 ? 0.1 : -0.62;
      const w0 = V(wx, topY(2.075, wx) + 0.018, zs(2.075));
      const w1 = V(wx + 0.5, topY(2.4, wx + 0.5) + 0.02, zs(2.4));
      bCab.add(plastic, tube(w0, w1, 0.011, 6));
    }
    // cowl strip at the base of the windshield
    bCab.add(plastic, box(1.9, 0.03, 0.07, 0, 2.165, zs(2.045)));

    // sun visor
    const P = (x: number, s: number): [number, number] => [x, -zs(s)];
    const vs = new THREE.Shape();
    vs.moveTo(...P(-1.1, 2.9));
    vs.lineTo(...P(-1.13, 2.72));
    vs.quadraticCurveTo(...P(-1.06, 2.55), ...P(-0.6, 2.5));
    vs.lineTo(...P(0.6, 2.5));
    vs.quadraticCurveTo(...P(1.06, 2.55), ...P(1.13, 2.72));
    vs.lineTo(...P(1.1, 2.9));
    vs.closePath();
    const visor = extrudePlan(vs, 0, 0.03, 0.008, 8);
    // tilt: front edge lower
    visor.translate(0, 0, -zs(2.9));
    visor.rotateX(0.2);
    visor.translate(0, 3.075, zs(2.9));
    bCab.add(trim, visor, 'tractor', 50);

    // roof marker lamps (5 amber)
    for (const x of [-0.84, -0.26, 0, 0.26, 0.84]) {
      const s = 2.97;
      const m = new THREE.SphereGeometry(0.05, 10, 8);
      m.scale(1.1, 0.5, 1.5);
      m.translate(x, topY(s, x) + 0.012, zs(s));
      bCab.add(amberMat, m);
      bCab.add(plastic, box(0.13, 0.014, 0.17, x, topY(s, x) + 0.004, zs(s)));
    }
    // telematics puck + stub antenna
    bCab.add(plastic, cylY(0.075, 0.04, 0.32, topY(3.7, 0.32) + 0.018, zs(3.7), 16, 0.09));
    bCab.add(plastic, tube(V(-0.45, topY(3.9, 0.45), zs(3.9)), V(-0.45, topY(3.9, 0.45) + 0.34, zs(3.97)), 0.008, 5));
    const led = new THREE.SphereGeometry(0.012, 6, 5);
    led.translate(0.32, topY(3.7, 0.32) + 0.042, zs(3.7));
    bCab.add(screenMat, led);

    // side sleeper marker + rear cab lamps
    for (const side of [1, -1]) {
      bCab.add(amberMat, box(0.012, 0.03, 0.09, side * (bodyX(4.5, 1.3) + 0.004), 1.3, zs(4.5)));
      bCab.add(amberMat, box(0.012, 0.03, 0.09, side * (bodyX(1.0, 1.16) + 0.004), 1.16, zs(2.0)));
    }
  }

  /* ---------- interior ---------- */
  {
    const bi = new Batch(cab);
    const seat = (x: number) => {
      bi.add(interior, box(0.52, 0.14, 0.5, x, 1.82, zs(3.1)));
      const back = new THREE.BoxGeometry(0.5, 0.78, 0.12);
      back.rotateX(0.14);
      back.translate(x, 2.26, zs(3.38));
      bi.add(interior, back);
      bi.add(interior, box(0.26, 0.2, 0.1, x, 2.76, zs(3.46)));
      bi.add(interior, box(0.3, 0.36, 0.3, x, 1.58, zs(3.12)));
    };
    seat(-0.62);
    seat(0.62);
    // driver silhouette
    const torso = new THREE.CapsuleGeometry(0.19, 0.36, 4, 10);
    torso.translate(-0.62, 2.28, zs(3.24));
    bi.add(driver, torso);
    const head = new THREE.SphereGeometry(0.115, 12, 10);
    head.translate(-0.62, 2.76, zs(3.2));
    bi.add(driver, head);
    bi.add(driver, tube(V(-0.8, 2.42, zs(3.16)), V(-0.76, 2.3, zs(2.78)), 0.05, 6));
    bi.add(driver, tube(V(-0.44, 2.42, zs(3.16)), V(-0.5, 2.3, zs(2.78)), 0.05, 6));
    // dash, wheel, screens
    bi.add(interior, box(2.2, 0.34, 0.5, 0, 1.98, zs(2.36)));
    bi.add(interior, box(2.3, 0.1, 2.4, 0, 1.5, zs(3.3)));
    const wheel = new THREE.TorusGeometry(0.21, 0.02, 6, 20);
    wheel.rotateX(-1.05);
    wheel.translate(-0.62, 2.3, zs(2.76));
    bi.add(interior, wheel);
    const scr = (w: number, h: number, x: number, y: number, s: number) => {
      const g = new THREE.PlaneGeometry(w, h);
      g.rotateX(-0.5);
      g.translate(x, y, zs(s));
      bi.add(screenMat, g);
    };
    scr(0.34, 0.1, -0.62, 2.18, 2.6);
    scr(0.26, 0.16, -0.05, 2.14, 2.62);
    // sleeper bunk wall + soft dome light
    bi.add(interior, box(2.2, 1.9, 0.08, 0, 2.5, zs(3.62)));
    const dome = new THREE.PlaneGeometry(0.5, 0.3);
    dome.rotateX(Math.PI / 2);
    dome.translate(0, 3.0, zs(3.2));
    bi.add(domeLamp, dome);
    bi.build();
  }

  /* ================================================================ */
  /* CHASSIS (unsprung / static)                                       */
  /* ================================================================ */
  {
    const key: LineKey = 'tractorKey';
    for (const sx of [-1, 1]) {
      bChassis.add(chassis, box(0.09, 0.28, S_FRAME_END - 0.6, sx * 0.43, 0.86, zs((S_FRAME_END + 0.6) / 2)), key);
    }
    for (const s of [0.8, 2.7, 3.9, 5.15, 6.4, S_FRAME_END - 0.06]) bChassis.add(chassis, box(0.78, 0.14, 0.09, 0, 0.86, zs(s)), 'tractor');
    // engine, radiator, transmission, driveline
    bChassis.add(chassis, box(0.72, 0.7, 1.15, 0, 1.2, zs(1.45)), 'tractor');
    bChassis.add(chassis, box(0.4, 0.14, 1.0, 0, 1.62, zs(1.45)), 'tractor');
    bChassis.add(chassis, box(0.98, 0.84, 0.1, 0, 1.12, zs(0.42)), 'tractor');
    bChassis.add(chassis, cylZ(0.3, 0.85, 0, 0.98, zs(2.45), 14, 0.2), 'tractor', 50);
    bChassis.add(chassis, tube(V(0, 0.94, zs(2.88)), V(0, 0.56, zs(S_DRIVE1 - 0.22)), 0.05, 8), key, 50);
    bChassis.add(chassis, tube(V(0, 0.56, zs(S_DRIVE1 + 0.22)), V(0, 0.56, zs(S_DRIVE2 - 0.22)), 0.045, 8), key, 50);
    // axles
    bChassis.add(chassis, cylX(0.06, 2.0, 0, 0.47, zs(S_STEER), 8), key, 50);
    for (const s of [S_DRIVE1, S_DRIVE2]) {
      bChassis.add(chassis, cylX(0.085, 1.9, 0, WHEEL_R, zs(s), 10), key, 50);
      const diff = new THREE.SphereGeometry(0.23, 12, 8);
      diff.scale(1.05, 0.95, 1.0);
      diff.translate(0, 0.52, zs(s));
      bChassis.add(chassis, diff);
      for (const sx of [-1, 1]) {
        bChassis.add(rubber, cylY(0.12, 0.2, sx * 0.43, 0.63, zs(s + 0.3), 10));
        bChassis.add(chassis, box(0.07, 0.07, 0.9, sx * 0.43, 0.56, zs(s)), null);
      }
    }
    for (const sx of [-1, 1]) {
      // leaf springs
      bChassis.add(chassis, box(0.08, 0.05, 1.3, sx * 0.43, 0.6, zs(S_STEER)));
      // fuel tanks + straps
      bChassis.add(alu, cylZ(0.29, 1.5, sx * 0.9, 0.76, zs(3.72), 20), key, 50);
      for (const ds of [-0.45, 0.45]) bChassis.add(chassis, cylZ(0.297, 0.05, sx * 0.9, 0.76, zs(3.72 + ds), 20));
      // battery / DEF boxes
      bChassis.add(chassis, box(0.5, 0.42, 0.55, sx * 0.9, 0.72, zs(2.5)), 'tractor');
      // mudflaps + hangers
      bChassis.add(rubber, box(0.62, 0.62, 0.018, sx * 0.945, 0.5, zs(S_DRIVE2 + 0.64)), 'tractor');
      bChassis.add(chassis, tube(V(sx * 0.4, 0.84, zs(S_DRIVE2 + 0.63)), V(sx * 1.25, 0.84, zs(S_DRIVE2 + 0.63)), 0.02, 6));
      bChassis.add(redDimMat, box(0.16, 0.07, 0.02, sx * 0.3, 0.86, zs(S_FRAME_END) + 0.012));
    }
    // deck plate + fifth wheel
    bChassis.add(alu, box(0.95, 0.018, 0.62, 0, 1.012, zs(5.42)), 'tractor');
    bChassis.add(chassis, box(0.9, 0.05, 0.95, 0, 1.025, zs(S_FIFTH)), key);
    for (const sx of [-1, 1]) bChassis.add(chassis, box(0.08, 0.09, 0.3, sx * 0.4, 1.09, zs(S_FIFTH)));
    const plate = new THREE.Shape();
    plate.absarc(0, 0, 0.47, Math.PI * 0.62, Math.PI * 2.38, false);
    plate.lineTo(0.07, -0.05);
    plate.lineTo(-0.07, -0.05);
    plate.closePath();
    const fw = extrudePlan(plate, 1.125, 0.04, 0, 20);
    fw.translate(0, 0, zs(S_FIFTH));
    bChassis.add(chassis, fw, key, 40);
    // air lines between cab and trailer
    const cols = ['#c8201c', '#1f58c8', '#1c8a3c'];
    cols.forEach((c, i) => {
      const x = (i - 1) * 0.14;
      const curve = new THREE.CatmullRomCurve3([
        V(x, 2.25, zs(S_CAB_BACK)),
        V(x, 2.0, zs(S_CAB_BACK + 0.22)),
        V(x * 1.4, 1.72, zs(5.05)),
        V(x * 1.6, 1.86, zs(5.3)),
        V(x * 1.6, 2.0, TF),
      ]);
      airLines.push(tint(prep(new THREE.TubeGeometry(curve, 16, 0.014, 5)), c));
    });
  }

  /* ================================================================ */
  /* TRAILER                                                           */
  /* ================================================================ */
  const TZ = (TF + TR) / 2;
  {
    const wallH = T_TOP - T_FLOOR;
    const wy = (T_TOP + T_FLOOR) / 2;
    const sR = new THREE.PlaneGeometry(T_LEN, wallH);
    sR.rotateY(Math.PI / 2);
    sR.translate(TW, wy, TZ);
    addMesh(trailer, sR, sideMatR, 'trailerSideR');
    const sL = new THREE.PlaneGeometry(T_LEN, wallH);
    sL.rotateY(-Math.PI / 2);
    sL.translate(-TW, wy, TZ);
    addMesh(trailer, sL, sideMatL, 'trailerSideL');
    const roof = new THREE.PlaneGeometry(T_LEN, TW * 2);
    roof.rotateX(-Math.PI / 2);
    roof.rotateY(Math.PI / 2);
    roof.translate(0, T_TOP, TZ);
    addMesh(trailer, roof, roofMat, 'trailerRoof');
    const front = new THREE.PlaneGeometry(TW * 2, wallH);
    front.rotateY(Math.PI);
    front.translate(0, wy, TF);
    bTrailer.add(whiteMat, front);
    const door = new THREE.PlaneGeometry(2.42, 2.71);
    door.translate(0, 1.25 + 2.71 / 2, TR + 0.004);
    addMesh(trailer, door, doorMat, 'trailerDoors');

    // box outline + posts for the blueprint
    const outline = box(TW * 2, wallH, T_LEN, 0, wy, TZ);
    pushEdges(bTrailer.line('trailer'), outline);
    outline.dispose();
    const faint = bTrailer.line('trailerFaint');
    for (let z = TF + 1.2192; z < TR - 0.3; z += 1.2192) {
      for (const sx of [-1, 1]) faint.push(sx * TW, T_FLOOR, z, sx * TW, T_TOP, z);
      faint.push(-TW, T_TOP, z, TW, T_TOP, z);
    }
    const keyL = bTrailer.line('trailerKey');
    const fy = T_FLOOR + 0.006;
    keyL.push(-TW, fy, TF, TW, fy, TF, TW, fy, TF, TW, fy, TR, TW, fy, TR, -TW, fy, TR, -TW, fy, TR, -TW, fy, TF);

    // floor
    bTrailer.add(floorMat, box(TW * 2 - 0.04, 0.08, T_LEN - 0.04, 0, T_FLOOR - 0.04, TZ));
    // rails
    for (const sx of [-1, 1]) {
      bTrailer.add(tAlu, box(0.03, 0.11, T_LEN, sx * (TW + 0.006), T_TOP - 0.045, TZ));
      bTrailer.add(tAlu, box(0.034, 0.16, T_LEN, sx * (TW + 0.006), 1.2, TZ));
      // rounded front corner posts
      bTrailer.add(tAlu, cylY(0.055, wallH + 0.12, sx * (TW - 0.03), wy - 0.04, TF + 0.03, 12));
      // rear frame posts
      bTrailer.add(tAlu, box(0.1, wallH + 0.13, 0.12, sx * (TW - 0.05), wy - 0.045, TR - 0.04), 'trailer');
      // conspicuity tape along the lower rail
      const tape = new THREE.PlaneGeometry(T_LEN - 0.5, 0.052);
      const uv = tape.getAttribute('uv');
      for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * ((T_LEN - 0.5) / 0.46));
      tape.rotateY((sx * Math.PI) / 2);
      tape.translate(sx * (TW + 0.0245), 1.175, TZ);
      bTrailer.add(tapeMat, tape);
      // amber side markers along the lower rail, red at the rear
      const n = 7;
      for (let i = 0; i < n; i++) {
        const z = TF + 0.22 + ((T_LEN - 0.44) * i) / (n - 1);
        bTrailer.add(i === n - 1 ? redDimMat : amberMat, box(0.016, 0.034, 0.11, sx * (TW + 0.028), 1.243, z));
      }
      // top front corner markers (side + front)
      bTrailer.add(amberMat, box(0.016, 0.036, 0.11, sx * (TW + 0.024), T_TOP - 0.05, TF + 0.2));
      bTrailer.add(amberMat, box(0.11, 0.036, 0.016, sx * (TW - 0.2), T_TOP - 0.07, TF - 0.01));
      bTrailer.add(redDimMat, box(0.016, 0.036, 0.11, sx * (TW + 0.024), T_TOP - 0.05, TR - 0.2));
    }
    bTrailer.add(tAlu, box(TW * 2, 0.11, 0.03, 0, T_TOP - 0.045, TF - 0.006));
    bTrailer.add(tAlu, box(TW * 2, 0.16, 0.03, 0, 1.2, TF - 0.006));
    // rear header + sill
    bTrailer.add(tAlu, box(TW * 2, 0.15, 0.12, 0, T_TOP - 0.07, TR - 0.04), 'trailer');
    bTrailer.add(tAlu, box(TW * 2, 0.2, 0.12, 0, 1.15, TR - 0.04), 'trailer');
    // lock rods, handles, hinges
    for (const x of [-0.86, -0.3, 0.3, 0.86]) {
      bTrailer.add(tAlu, cylY(0.015, 2.86, x, 2.62, TR + 0.03, 8), 'trailerFaint', 80);
      for (const y of [1.36, 2.6, 3.86]) bTrailer.add(tAlu, box(0.07, 0.05, 0.035, x, y, TR + 0.022));
      bTrailer.add(tAlu, box(0.34, 0.03, 0.02, x + (x < 0 ? 0.15 : -0.15), 1.78, TR + 0.045));
    }
    for (const sx of [-1, 1]) for (const y of [1.55, 2.12, 2.7, 3.28, 3.82]) bTrailer.add(tAlu, box(0.09, 0.09, 0.03, sx * 1.2, y, TR + 0.02));
    // tail lamps (sill) + ID lamps (header)
    for (const sx of [-1, 1]) {
      for (const x of [0.86, 1.06]) {
        bTrailer.add(redMat, cylZ(0.058, 0.02, sx * x, 1.15, TR + 0.03, 16));
        bTrailer.add(chassis, cylZ(0.07, 0.016, sx * x, 1.15, TR + 0.024, 16));
      }
      bTrailer.add(redDimMat, box(0.12, 0.034, 0.016, sx * 1.18, T_TOP - 0.07, TR + 0.026));
    }
    for (const x of [-0.17, 0, 0.17]) bTrailer.add(redDimMat, box(0.11, 0.034, 0.016, x, T_TOP - 0.07, TR + 0.026));
    bTrailer.add(plateMat, box(0.31, 0.155, 0.01, 0, 1.15, TR + 0.026));
    // sill tape
    const st = new THREE.PlaneGeometry(1.5, 0.05);
    const suv = st.getAttribute('uv');
    for (let i = 0; i < suv.count; i++) suv.setX(i, suv.getX(i) * (1.5 / 0.46));
    st.translate(0, 1.075, TR + 0.022);
    bTrailer.add(tapeMat, st);

    // underride guard
    bTrailer.add(bogie, box(2.36, 0.1, 0.1, 0, 0.56, TR - 0.06), 'trailer');
    for (const sx of [-1, 1]) {
      bTrailer.add(bogie, box(0.08, 0.5, 0.08, sx * 0.72, 0.84, TR - 0.06), 'trailer');
      bTrailer.add(bogie, tube(V(sx * 0.72, 0.6, TR - 0.08), V(sx * 0.72, 1.08, TR - 0.55), 0.03, 6));
    }
    const gt = new THREE.PlaneGeometry(2.3, 0.05);
    const guv = gt.getAttribute('uv');
    for (let i = 0; i < guv.count; i++) guv.setX(i, guv.getX(i) * (2.3 / 0.46));
    gt.translate(0, 0.56, TR - 0.008);
    bTrailer.add(tapeMat, gt);

    // coupler plate + kingpin + cross-members
    bTrailer.add(bogie, box(1.3, 0.03, 1.7, 0, 1.155, zs(S_FIFTH) + 0.1), 'trailer');
    bTrailer.add(bogie, cylY(0.045, 0.1, 0, 1.1, zs(S_FIFTH), 10), 'trailerKey', 50);
    for (let z = TF + 2.2; z < TR - 0.3; z += 0.62) bTrailer.add(bogie, box(TW * 2 - 0.1, 0.09, 0.045, 0, 1.165, z));

    // landing gear
    for (const sx of [-1, 1]) {
      bTrailer.add(bogie, box(0.11, 0.86, 0.11, sx * 0.86, 0.73, T_LANDING), 'trailer');
      bTrailer.add(bogie, box(0.26, 0.03, 0.26, sx * 0.86, 0.285, T_LANDING), 'trailer');
      bTrailer.add(bogie, tube(V(sx * 0.86, 0.5, T_LANDING), V(sx * 0.86, 1.14, T_LANDING + 0.7), 0.025, 6));
    }
    bTrailer.add(bogie, tube(V(-0.86, 0.72, T_LANDING), V(0.86, 0.72, T_LANDING), 0.022, 6));
    bTrailer.add(bogie, tube(V(-0.86, 0.5, T_LANDING), V(0.86, 1.1, T_LANDING), 0.02, 6));

    // aero side skirts
    for (const sx of [-1, 1]) {
      const z0 = T_LANDING + 0.55;
      const z1 = T_AXLE1 - 0.72;
      const pos = [
        sx * 1.02, 1.12, z0, sx * 1.02, 0.42, z0 + 0.25,
        sx * 1.27, 1.12, z0 + 2.6, sx * 1.27, 0.34, z0 + 2.6,
        sx * 1.27, 1.12, z1, sx * 1.27, 0.34, z1,
      ];
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
      g.setIndex(sx > 0 ? [0, 1, 2, 2, 1, 3, 2, 3, 4, 4, 3, 5] : [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3]);
      g.computeVertexNormals();
      bTrailer.add(skirtMat, g, 'trailer', 5);
    }
  }

  /* ---------- trailer bogie (static) ---------- */
  {
    const zc = (T_AXLE1 + T_AXLE2) / 2;
    for (const sx of [-1, 1]) {
      bBogie.add(bogie, box(0.1, 0.16, 3.0, sx * 0.5, 1.03, zc), 'trailer');
      for (const z of [T_AXLE1, T_AXLE2]) {
        bBogie.add(bogie, box(0.09, 0.42, 0.14, sx * 0.5, 0.78, z - 0.42));
        bBogie.add(bogie, box(0.07, 0.07, 0.86, sx * 0.5, 0.56, z - 0.02));
        bBogie.add(tRubber, cylY(0.12, 0.26, sx * 0.5, 0.74, z + 0.3, 10));
      }
      bBogie.add(tRubber, box(0.62, 0.62, 0.018, sx * 0.985, 0.5, T_AXLE2 + 0.64), 'trailer');
      bBogie.add(bogie, tube(V(sx * 0.5, 0.86, T_AXLE2 + 0.63), V(sx * 1.28, 0.86, T_AXLE2 + 0.63), 0.02, 6));
    }
    for (const z of [T_AXLE1, T_AXLE2]) bBogie.add(bogie, cylX(0.065, 2.0, 0, WHEEL_R, z, 10), 'trailerKey', 50);
    bBogie.add(bogie, box(1.0, 0.1, 0.1, 0, 1.03, zc - 1.3));
    bBogie.add(bogie, box(1.0, 0.1, 0.1, 0, 1.03, zc + 1.3));
    bBogie.add(bogie, cylX(0.13, 0.7, 0, 0.9, zc, 12), 'trailer', 50);
  }

  /* ---------- extra materials referenced above ---------- */
  bCab.build();
  bChassis.build();
  bTrailer.build();
  bBogie.build();
  {
    const merged = mergeGeometries(airLines, false);
    airLines.forEach((g) => g.dispose());
    if (merged) addMesh(group, merged, airLineMat);
  }

  /* ================================================================ */
  /* CARGO                                                             */
  /* ================================================================ */
  const cartonCanvas = makeCanvas(256, 256);
  drawCarton(cartonCanvas);
  const cartonTex = track(canvasTexture(cartonCanvas));
  const cargoMat = std({
    color: '#ffffff',
    map: cartonTex,
    roughness: 0.82,
    metalness: 0,
    envMapIntensity: 0.25,
    emissive: new THREE.Color('#ffffff'),
    emissiveMap: cartonTex,
    emissiveIntensity: 0,
  });
  const palletMat = std({ color: '#8a6a40', roughness: 0.9, metalness: 0, envMapIntensity: 0.1, emissive: new THREE.Color('#5a4020'), emissiveIntensity: 0 });
  let cargo: THREE.InstancedMesh;
  let pallets: THREE.InstancedMesh;
  {
    const rnd = mulberry(20240613);
    const boxes: { p: THREE.Vector3; s: THREE.Vector3; c: THREE.Color }[] = [];
    const bases: THREE.Vector3[] = [];
    const tones = ['#ffffff', '#f0dcc0', '#e2c39c', '#fff0d8', '#d9b78c', '#f6e2c4'];
    const wraps = [new THREE.Color(1.22, 1.24, 1.3), new THREE.Color(1.3, 1.28, 1.22), new THREE.Color(1.08, 1.12, 1.2)];
    const cargoLines: number[] = [];
    const ROWS = 13;
    for (let r = 0; r < ROWS; r++) {
      const zc = TF + 0.14 + 0.61 + r * 1.22;
      for (const sx of [-1, 1]) {
        const xc = sx * 0.6;
        const y0 = T_FLOOR + 0.002;
        bases.push(V(xc, y0 + 0.07, zc));
        const H = 1.45 + rnd() * 0.95;
        const yb = y0 + 0.14;
        const kind = rnd();
        if (kind < 0.24) {
          const c = wraps[Math.floor(rnd() * wraps.length)].clone();
          boxes.push({ p: V(xc, yb + H / 2, zc), s: V(1.06, H, 1.12), c });
        } else {
          const lh = 0.38 + rnd() * 0.2;
          const n = Math.max(2, Math.floor(H / lh));
          const base = new THREE.Color(tones[Math.floor(rnd() * tones.length)]);
          for (let l = 0; l < n; l++) {
            const slab = rnd() < 0.18;
            const y = yb + lh * (l + 0.5);
            if (slab) {
              boxes.push({ p: V(xc, y, zc), s: V(1.05, lh - 0.012, 1.12), c: base.clone().multiplyScalar(0.9 + rnd() * 0.14) });
              continue;
            }
            for (const ix of [-1, 1])
              for (const iz of [-1, 1]) {
                if (l === n - 1 && n > 2 && rnd() < 0.16) continue;
                boxes.push({
                  p: V(xc + ix * 0.265 + (rnd() - 0.5) * 0.012, y, zc + iz * 0.283 + (rnd() - 0.5) * 0.012),
                  s: V(0.515, lh - 0.012, 0.55),
                  c: base.clone().multiplyScalar(0.86 + rnd() * 0.2),
                });
              }
          }
        }
        const top = Math.max(...boxes.slice(-40).filter((b) => Math.abs(b.p.x - xc) < 0.5 && Math.abs(b.p.z - zc) < 0.5).map((b) => b.p.y + b.s.y / 2));
        const o = box(1.08, top - y0, 1.14, xc, (top + y0) / 2, zc);
        pushEdges(cargoLines, o);
        o.dispose();
      }
    }
    const unit = new THREE.BoxGeometry(1, 1, 1);
    cargo = new THREE.InstancedMesh(unit, cargoMat, boxes.length);
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    boxes.forEach((b, i) => {
      m4.compose(b.p, q, b.s);
      cargo.setMatrixAt(i, m4);
      cargo.setColorAt(i, b.c);
    });
    cargo.name = 'cargo';
    cargo.frustumCulled = false;
    pallets = new THREE.InstancedMesh(unit, palletMat, bases.length);
    bases.forEach((p, i) => {
      m4.compose(p, q, V(1.1, 0.14, 1.16));
      pallets.setMatrixAt(i, m4);
    });
    pallets.frustumCulled = false;
    cargo.visible = pallets.visible = false;
    trailer.add(cargo, pallets);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cargoLines), 3));
    const ls = new THREE.LineSegments(g, lineMats.cargo);
    ls.renderOrder = 1;
    ls.visible = false;
    ls.frustumCulled = false;
    trailer.add(ls);
    lineObjs.push(ls);
  }

  /* ================================================================ */
  /* WHEELS                                                            */
  /* ================================================================ */
  interface WheelDef {
    x: number;
    z: number;
    flip: boolean;
  }
  const wheelSets: { tyre: THREE.InstancedMesh; rims: { mesh: THREE.InstancedMesh; defs: WheelDef[] }[]; defs: WheelDef[] }[] = [];
  {
    const tyreProfile = [
      [0.285, -0.128],
      [0.33, -0.146],
      [0.41, -0.152],
      [0.468, -0.142],
      [0.497, -0.115],
      [0.5, -0.058],
      [0.5, 0],
      [0.5, 0.058],
      [0.497, 0.115],
      [0.468, 0.142],
      [0.41, 0.152],
      [0.33, 0.146],
      [0.285, 0.128],
    ].map(([r, a]) => new THREE.Vector2(r, a));
    const tyreGeo = new THREE.LatheGeometry(tyreProfile, 36);
    tyreGeo.rotateZ(-Math.PI / 2);

    const mkRim = (profile: number[][], holeR: number, holeA: number, lugA: number) => {
      const lathe = new THREE.LatheGeometry(profile.map(([r, a]) => new THREE.Vector2(r, a)), 32);
      lathe.rotateZ(-Math.PI / 2);
      const parts: THREE.BufferGeometry[] = [tint(prep(lathe), '#ffffff')];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const lug = cylX(0.013, 0.03, lugA, Math.cos(a) * 0.145, Math.sin(a) * 0.145, 6);
        parts.push(tint(prep(lug), '#ffffff'));
      }
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.3;
        const hole = new THREE.CircleGeometry(0.034, 12);
        hole.rotateY(Math.PI / 2);
        hole.translate(holeA, Math.cos(a) * holeR, Math.sin(a) * holeR);
        parts.push(tint(prep(hole), '#050505'));
      }
      const merged = mergeGeometries(parts, false)!;
      parts.forEach((p) => p.dispose());
      return merged;
    };
    const rimDual = mkRim(
      [
        [0.0, 0.1],
        [0.06, 0.1],
        [0.09, 0.075],
        [0.11, 0.03],
        [0.17, 0.02],
        [0.2, -0.03],
        [0.245, -0.055],
        [0.272, 0.01],
        [0.283, 0.12],
        [0.3, 0.13],
      ],
      0.222,
      -0.036,
      0.035,
    );
    const rimSteer = mkRim(
      [
        [0.0, 0.175],
        [0.07, 0.172],
        [0.1, 0.15],
        [0.115, 0.105],
        [0.17, 0.095],
        [0.205, 0.07],
        [0.262, 0.045],
        [0.278, 0.07],
        [0.284, 0.12],
        [0.3, 0.13],
      ],
      0.225,
      0.068,
      0.11,
    );

    const mkSet = (zone: Zone, defs: WheelDef[], steerCount: number) => {
      const tyre = new THREE.InstancedMesh(tyreGeo, tyreMat[zone], defs.length);
      tyre.renderOrder = 3;
      tyre.frustumCulled = false;
      const tw = new THREE.InstancedMesh(tyreGeo, preFront, defs.length);
      tw.instanceMatrix = tyre.instanceMatrix;
      tw.renderOrder = 2;
      tw.visible = false;
      tw.frustumCulled = false;
      twins[zone].push(tw);
      group.add(tw, tyre);
      const rims: { mesh: THREE.InstancedMesh; defs: WheelDef[] }[] = [];
      const mkR = (geo: THREE.BufferGeometry, sub: WheelDef[]) => {
        if (!sub.length) return;
        const mesh = new THREE.InstancedMesh(geo, rimMat[zone], sub.length);
        mesh.renderOrder = 3;
        mesh.frustumCulled = false;
        const rtw = new THREE.InstancedMesh(geo, preDouble, sub.length);
        rtw.instanceMatrix = mesh.instanceMatrix;
        rtw.renderOrder = 2;
        rtw.visible = false;
        rtw.frustumCulled = false;
        twins[zone].push(rtw);
        group.add(rtw, mesh);
        rims.push({ mesh, defs: sub });
      };
      mkR(rimSteer, defs.slice(0, steerCount));
      mkR(rimDual, defs.slice(steerCount));
      wheelSets.push({ tyre, rims, defs });
    };
    const tractorDefs: WheelDef[] = [
      { x: 1.07, z: zs(S_STEER), flip: false },
      { x: -1.07, z: zs(S_STEER), flip: true },
    ];
    for (const s of [S_DRIVE1, S_DRIVE2]) {
      tractorDefs.push({ x: 1.1, z: zs(s), flip: false }, { x: 0.78, z: zs(s), flip: true });
      tractorDefs.push({ x: -1.1, z: zs(s), flip: true }, { x: -0.78, z: zs(s), flip: false });
    }
    const trailerDefs: WheelDef[] = [];
    for (const z of [T_AXLE1, T_AXLE2]) {
      trailerDefs.push({ x: 1.14, z, flip: false }, { x: 0.82, z, flip: true });
      trailerDefs.push({ x: -1.14, z, flip: true }, { x: -0.82, z, flip: false });
    }
    mkSet(0, tractorDefs, 2);
    mkSet(1, trailerDefs, 0);

    // blueprint wheel circles
    const wl = new Batch(group);
    for (const d of tractorDefs) {
      const outer = Math.abs(d.x) > 1;
      if (!outer) continue;
      const x = d.x + Math.sign(d.x) * 0.15;
      pushCircleX(wl.line('tractor'), x, WHEEL_R, d.z, 0.5);
      pushCircleX(wl.line('tractor'), x, WHEEL_R, d.z, 0.29);
      pushCircleX(wl.line('tractorKey'), x, WHEEL_R, d.z, 0.11, 14);
    }
    for (const d of trailerDefs) {
      if (Math.abs(d.x) < 1) continue;
      const x = d.x + Math.sign(d.x) * 0.15;
      pushCircleX(wl.line('trailer'), x, WHEEL_R, d.z, 0.5);
      pushCircleX(wl.line('trailer'), x, WHEEL_R, d.z, 0.29);
      pushCircleX(wl.line('trailerKey'), x, WHEEL_R, d.z, 0.11, 14);
    }
    wl.build();
  }

  /* ================================================================ */
  /* GLOWS + BEAMS                                                     */
  /* ================================================================ */
  const glowCanvas = makeCanvas(128, 128);
  drawGlow(glowCanvas);
  const glowTex = track(canvasTexture(glowCanvas));
  const headGlowMat = new THREE.SpriteMaterial({ map: glowTex, color: '#ffe6c0', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 });
  const headGlows: THREE.Sprite[] = [];
  for (const p of headPos) {
    const sp = new THREE.Sprite(headGlowMat);
    sp.position.set(p.x * 0.97, p.y, p.z - 0.16);
    sp.scale.setScalar(1.5);
    sp.renderOrder = 4;
    cab.add(sp);
    headGlows.push(sp);
  }
  const tailGlowMat = new THREE.MeshBasicMaterial({ map: glowTex, color: '#ff2a1a', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 });
  const tailGlows: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    const g = new THREE.PlaneGeometry(1.5, 1.0);
    g.translate(sx * 0.96, 1.15, TR + 0.07);
    const m = new THREE.Mesh(g, tailGlowMat);
    m.renderOrder = 4;
    trailer.add(m);
    tailGlows.push(m);
  }
  {
    const g = new THREE.PlaneGeometry(3.4, 1.1);
    g.translate(0, 1.12, TR + 0.065);
    const m = new THREE.Mesh(g, tailGlowMat);
    m.renderOrder = 4;
    trailer.add(m);
    tailGlows.push(m);
  }

  const BEAM_LEN = 36;
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color('#ffe9c8') }, uIntensity: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aT;
      varying float vT;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vT = aT;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vV = -mv.xyz;
        vN = normalMatrix * normal;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying float vT;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        float nv = abs(dot(normalize(vN), normalize(vV)));
        float edge = pow(nv, 3.0);
        float along = exp(-2.8 * vT) * (1.0 - smoothstep(0.55, 1.0, vT)) * smoothstep(0.0, 0.012, vT);
        gl_FragColor = vec4(uColor * (uIntensity * edge * along), 1.0);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beams = new THREE.Group();
  beams.name = 'headlightBeams';
  for (const p of headPos) {
    const g = new THREE.CylinderGeometry(3.6, 0.16, BEAM_LEN, 40, 28, true);
    const posA = g.getAttribute('position');
    const aT = new Float32Array(posA.count);
    for (let i = 0; i < posA.count; i++) aT[i] = posA.getY(i) / BEAM_LEN + 0.5;
    g.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
    g.translate(0, BEAM_LEN / 2, 0);
    g.rotateX(-Math.PI / 2); // +Y -> -Z
    const keep = g.getAttribute('normal').clone(); // keep the round normals: soft falloff from every angle
    g.scale(1, 0.5, 1);
    g.setAttribute('normal', keep);
    const m = new THREE.Mesh(g, beamMat);
    m.position.set(p.x * 0.97, p.y, p.z - 0.05);
    m.rotation.set(-0.03, Math.sign(p.x) * -0.012, 0);
    m.renderOrder = 5;
    m.frustumCulled = false;
    beams.add(m);
  }
  cab.add(beams);

  const poolMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color('#ffe2b8') }, uIntensity: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec2 vUv;
      void main() {
        float t = vUv.y;
        float x = (vUv.x - 0.5) * 2.0;
        float w = mix(0.2, 0.82, pow(t, 0.8));
        float lat = exp(-pow(x / w, 2.0) * 2.6);
        float lon = smoothstep(0.0, 0.16, t) * pow(1.0 - t, 1.7);
        gl_FragColor = vec4(uColor * (uIntensity * lat * lon), 1.0);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  {
    const g = new THREE.PlaneGeometry(15, 40);
    g.rotateX(-Math.PI / 2); // uv.y: 0 at +z (near truck) -> 1 at -z
    g.translate(0, 0.02, Z0 - 20.6);
    const pool = new THREE.Mesh(g, poolMat);
    pool.name = 'headlightPool';
    pool.renderOrder = 4;
    pool.frustumCulled = false;
    group.add(pool);
  }

  /* ================================================================ */
  /* STATE                                                             */
  /* ================================================================ */
  let headLevel = 1;
  let daylight = 0;
  let xr: [number, number] = [0, 0];
  let time = 0;
  let wheelAngle = 0;
  let shimmer = 1;
  let disposed = false;
  const DARK_LENS = new THREE.Color('#0d0f13');
  const tmpC = new THREE.Color();

  function refreshLamps() {
    const dayMarker = 1 - 0.4 * daylight;
    const lv = clamp(headLevel, 0, 2);
    const on = Math.min(1, lv);
    const high = Math.max(0, lv - 1);
    for (const l of lamps) {
      let k = l.intensity;
      if (l.kind === 'marker') k *= dayMarker * shimmer;
      else if (l.kind === 'tail') k *= (1 - 0.3 * daylight) * (0.97 + 0.03 * shimmer);
      else if (l.kind === 'head') k *= on * (1 + high * 2.2);
      else if (l.kind === 'drl') k *= on * (1 + high * 0.5);
      else if (l.kind === 'fog') k *= on;
      tmpC.copy(l.base).multiplyScalar(k);
      if (l.kind === 'head' || l.kind === 'drl' || l.kind === 'fog') tmpC.lerp(DARK_LENS, 1 - on);
      l.m.color.copy(tmpC);
    }
    const dayBeam = 1 - 0.55 * daylight;
    beamMat.uniforms.uIntensity.value = (on * 0.22 + high * 0.26) * dayBeam;
    poolMat.uniforms.uIntensity.value = (on * 0.34 + high * 0.3) * dayBeam;
    beams.rotation.x = high * 0.022;
    beams.visible = on > 0.001;
    headGlowMat.opacity = (on * 0.3 + high * 0.6) * (1 - 0.35 * daylight);
    for (const s of headGlows) {
      s.scale.setScalar(0.95 + high * 1.4);
      s.visible = on > 0.001;
    }
    tailGlowMat.opacity = 0.5 * (1 - 0.45 * daylight);
    liner.emissiveIntensity = 0.11 * (1 - 0.6 * daylight);
    interior.emissiveIntensity = 0.03 * (1 - 0.6 * daylight);
    domeLamp.color.set('#ffb070').multiplyScalar(0.3 * (1 - 0.7 * daylight));
    const env = 1 + 0.5 * daylight;
    paint.envMapIntensity = paintDouble.envMapIntensity = 1.5 * env;
  }

  const CHASSIS_X = new THREE.Color('#2c4264');
  function applyXray() {
    for (const f of fades) {
      const t = xr[f.zone];
      const e = smooth(t);
      const on = t > 0.001;
      f.m.opacity = lerp(f.baseOp, f.xOp, e);
      const tr = f.baseTransparent || on;
      const dw = !f.baseTransparent && !on;
      if (f.m.transparent !== tr || f.m.depthWrite !== dw) {
        // `transparent` is baked into the shader (#define OPAQUE), so a flip needs a recompile
        f.m.transparent = tr;
        f.m.depthWrite = dw;
        f.m.needsUpdate = true;
      }
      f.m.color.copy(f.baseColor).lerp(f.xColor, e);
      f.m.visible = f.m.opacity > 0.003;
    }
    for (const z of [0, 1] as const) for (const tw of twins[z]) tw.visible = xr[z] > 0.001;
    const eT = smooth(xr[0]);
    const eR = smooth(xr[1]);
    const setLine = (k: LineKey, e: number) => {
      lineMats[k].opacity = lineColors[k][1] * e;
    };
    setLine('tractor', eT);
    setLine('tractorKey', eT);
    setLine('trailer', eR);
    setLine('trailerFaint', eR);
    setLine('trailerKey', eR);
    setLine('cargo', eR);
    for (const l of lineObjs) l.visible = (l.material as THREE.LineBasicMaterial).opacity > 0.003;
    cargo.visible = pallets.visible = xr[1] > 0.001;
    cargoMat.emissiveIntensity = 0.2 * eR;
    palletMat.emissiveIntensity = 0.5 * eR;
    chassis.color.copy(chassisBase).lerp(CHASSIS_X, eT * 0.8);
    chassis.emissive.set('#16263f').multiplyScalar(eT);
    bogie.color.copy(chassisBase).lerp(CHASSIS_X, eR * 0.8);
    bogie.emissive.set('#16263f').multiplyScalar(eR);
  }

  const m4 = new THREE.Matrix4();
  const qSpin = new THREE.Quaternion();
  const qFlip = new THREE.Quaternion().setFromAxisAngle(_up, Math.PI);
  const q = new THREE.Quaternion();
  const one = new THREE.Vector3(1, 1, 1);
  const xAxis = new THREE.Vector3(1, 0, 0);
  const pv = new THREE.Vector3();
  function placeWheels() {
    qSpin.setFromAxisAngle(xAxis, wheelAngle);
    const write = (mesh: THREE.InstancedMesh, defs: WheelDef[]) => {
      for (let i = 0; i < defs.length; i++) {
        const d = defs[i];
        q.copy(qSpin);
        if (d.flip) q.multiply(qFlip);
        m4.compose(pv.set(d.x, WHEEL_R, d.z), q, one);
        mesh.setMatrixAt(i, m4);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
    for (const set of wheelSets) {
      write(set.tyre, set.defs);
      for (const r of set.rims) write(r.mesh, r.defs);
    }
  }

  function update(dt: number, speed: number) {
    if (disposed) return;
    time += dt;
    wheelAngle -= (speed / WHEEL_R) * dt;
    if (wheelAngle < -1e4) wheelAngle += Math.PI * 2 * 1000;
    placeWheels();
    const k = clamp(Math.abs(speed) / 25, 0, 1);
    const idle = 1 - k;
    cabPivot.position.y = 0.9 + k * (Math.sin(time * 7.3) * 0.004 + Math.sin(time * 12.7 + 1.3) * 0.0022) + idle * Math.sin(time * 38) * 0.0006;
    cabPivot.rotation.z = k * (Math.sin(time * 2.1 + 0.4) * 0.0042 + Math.sin(time * 5.3) * 0.0012);
    cabPivot.rotation.x = k * (Math.sin(time * 3.4 + 2.0) * 0.0018);
    trailerPivot.position.y = 1.0 + k * (Math.sin(time * 5.1 + 0.7) * 0.003 + Math.sin(time * 9.4) * 0.0012);
    trailerPivot.rotation.z = k * (Math.sin(time * 1.7 + 1.1) * 0.0032 + Math.sin(time * 4.1) * 0.0008);
    shimmer = 1 + 0.035 * Math.sin(time * 13.1) + 0.025 * Math.sin(time * 29.7 + 1.0) + 0.02 * Math.sin(time * 47.3);
    refreshLamps();
  }

  function onFonts() {
    if (!disposed) redrawText();
  }
  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(onFonts).catch(() => undefined);
    try {
      document.fonts.addEventListener('loadingdone', onFonts);
      // nudges the browser to finish a face the page already declares; never adds a new one
      document.fonts.load('500 64px "Bricolage Grotesque"', 'FreightFlow').then(onFonts, () => undefined);
    } catch {
      /* noop */
    }
  }

  placeWheels();
  refreshLamps();
  applyXray();

  const TY = (s: number, x: number) => topY(s, x);
  const anchors: TruckAnchors = {
    tractor: V(bodyX(2.8, 1.7), 1.7, zs(2.8)),
    sleeper: V(0, TY(4.1, 0), zs(4.1)),
    trailer: V(TW, 3.2, TZ),
    telematics: V(0.32, TY(3.7, 0.32) + 0.04, zs(3.7)),
    trailerRear: V(0, 2.6, TR),
    headlights: V(0, HEAD_Y, zs(0.04)),
  };

  return {
    group,
    anchors,
    length: RIG_LENGTH,
    update,
    setHeadlights(level: number) {
      headLevel = level;
      refreshLamps();
    },
    setXray(tractorT: number, trailerT: number) {
      xr = [clamp(tractorT, 0, 1), clamp(trailerT, 0, 1)];
      applyXray();
    },
    setDaylight(t: number) {
      daylight = clamp(t, 0, 1);
      refreshLamps();
    },
    dispose() {
      disposed = true;
      if (typeof document !== 'undefined' && document.fonts) {
        try {
          document.fonts.removeEventListener('loadingdone', onFonts);
        } catch {
          /* noop */
        }
      }
      const geos = new Set<THREE.BufferGeometry>();
      const mats = new Set<THREE.Material>();
      group.traverse((o) => {
        const any = o as THREE.Mesh;
        if (any.geometry) geos.add(any.geometry);
        const m = any.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(m)) m.forEach((x) => mats.add(x));
        else if (m) mats.add(m);
        if ((o as THREE.InstancedMesh).isInstancedMesh) (o as THREE.InstancedMesh).dispose();
      });
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      Object.values(lineMats).forEach((m) => m.dispose());
      preFront.dispose();
      preDouble.dispose();
      textures.forEach((t) => t.dispose());
      group.removeFromParent();
      group.clear();
    },
  };
}
