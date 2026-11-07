/**
 * Particle state for the whole page, structure-of-arrays. Positions are in page
 * coordinates (CSS px from the document's top-left), so formations never care about scroll.
 */
export class Particles {
  readonly n: number;
  // position, velocity
  readonly px: Float32Array; readonly py: Float32Array; readonly vx: Float32Array; readonly vy: Float32Array;
  // target, previous target (to detect teleports), spring stiffness
  readonly tx: Float32Array; readonly ty: Float32Array; readonly pX: Float32Array; readonly pY: Float32Array; readonly kk: Float32Array;
  /** 1 while a formation owns the particle */
  readonly has: Uint8Array;
  /** 1 = jump straight to target this frame (respawned map anchor) */
  readonly tele: Uint8Array;
  /** time before which an owned particle still drifts (staggered pour-in) */
  readonly wake: Float32Array;
  // alpha and colour (current / target)
  readonly al: Float32Array; readonly aT: Float32Array;
  readonly cr: Float32Array; readonly cg: Float32Array; readonly cb: Float32Array;
  readonly tr: Float32Array; readonly tg: Float32Array; readonly tb: Float32Array;
  /** per-particle random seeds */
  readonly s1: Float32Array; readonly s2: Float32Array; readonly s3: Float32Array;
  /** per-particle path parameter for stateful flows */
  readonly uS: Float32Array;
  /** map-space anchors (NaN = unassigned) */
  readonly mX: Float32Array; readonly mY: Float32Array;
  /** a fixed random permutation, so formations take a well-mixed subset */
  readonly perm: Int32Array;

  constructor(n: number) {
    this.n = n;
    const f = () => new Float32Array(n);
    this.px = f(); this.py = f(); this.vx = f(); this.vy = f();
    this.tx = f(); this.ty = f(); this.pX = f().fill(NaN); this.pY = f(); this.kk = f().fill(14);
    this.has = new Uint8Array(n); this.tele = new Uint8Array(n); this.wake = f();
    this.al = f(); this.aT = f();
    this.cr = f(); this.cg = f(); this.cb = f(); this.tr = f(); this.tg = f(); this.tb = f();
    this.s1 = f(); this.s2 = f(); this.s3 = f(); this.uS = f();
    this.mX = f().fill(NaN); this.mY = f();
    this.perm = new Int32Array(n);
    for (let i = 0; i < n; i++) { this.s1[i] = Math.random(); this.s2[i] = Math.random(); this.s3[i] = Math.random(); this.perm[i] = i; }
    for (let i = n - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = this.perm[i]; this.perm[i] = this.perm[j]; this.perm[j] = t; }
  }

  /** Target colour and alpha; the physics step eases towards them. */
  setC(i: number, r: number, g: number, b: number, a: number) {
    this.tr[i] = r; this.tg[i] = g; this.tb[i] = b; this.aT[i] = a;
  }
}

export interface Rect { x: number; y: number; w: number; h: number }

export const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
export const fract = (x: number) => x - Math.floor(x);
/** 0 at either end of [0, w], 1 once `f`·w in from the edge. */
export const edge = (x: number, w: number, f: number) => Math.min(1, Math.max(0, x / (w * f)), Math.max(0, (w - x) / (w * f)));

export function rectOf(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
}

/** What every formation gets from the engine. */
export interface FormationContext {
  P: Particles;
  small: boolean;
  still: boolean;
}

export interface Formation {
  /** Re-read the stage box (page coordinates). Called on resize and layout changes. */
  measure(): void;
  /** Claim particles from a shuffled list when the formation becomes active. */
  assign(list: Int32Array, t: number): void;
  /** Write targets/colours for owned particles. dt = 0 for reduced-motion still frames. */
  step(t: number, dt: number): void;
}

/** Reduced motion renders every formation at this fixed moment. */
export const T_STILL = 4.2;
