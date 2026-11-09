import { COMPANY } from '../../../../content';
import { edge, fract, rectOf, smooth, type Formation, type FormationContext, type Rect } from '../state';
import { yieldToMain } from '../usMap';

abstract class StageFormation implements Formation {
  protected r: Rect = { x: 0, y: 0, w: 0, h: 0 };
  protected f: number[] = [];
  constructor(protected ctx: FormationContext, protected stage: HTMLElement) {}
  measure() { this.r = rectOf(this.stage); }
  /** Claim `share` of all particles with spring stiffness `k`. */
  protected claim(list: Int32Array, share: number, k: number, from = 0): number[] {
    const { P } = this.ctx;
    const out = Array.from(list.subarray(from, from + Math.floor(P.n * share)));
    for (const i of out) { P.has[i] = 1; P.kk[i] = k; }
    return out;
  }
  abstract assign(list: Int32Array, t: number): void;
  abstract step(t: number, dt: number): void;
}

/**
 * How it works: loads (top lane) and trucks/drivers (bottom lane) converge, are matched by
 * the agents, then queue at the dispatcher's gate and only move on once it opens.
 */
export class HowFormation extends StageFormation {
  private g: number[] = [];
  assign(list: Int32Array) {
    const { P } = this.ctx;
    this.f = this.claim(list, 0.3, 26);
    for (const i of this.f) P.uS[i] = P.s1[i];
    this.g = this.claim(list, 0.012, 20, this.f.length);
  }
  step(t: number, dt: number) {
    const { P } = this.ctx;
    const { x: X, y: Y, w, h } = this.r, narrow = w < 600;
    const top = narrow ? 0.3 : 0.2, mid = h * 0.52, GU = 0.6, MG = 0.34;
    const open = t % 3.4 < 1.0;
    for (const i of this.f) {
      let u = P.uS[i];
      if (dt > 0) {
        const lim = GU - 0.006 - P.s3[i] * 0.06;
        let nu = u + (dt / 15) * (0.85 + 0.3 * P.s3[i]);
        if (!open && u < GU && nu > lim) nu = Math.max(u, lim);
        if (nu > 1) nu -= 1;
        P.uS[i] = u = nu;
      }
      const lane = P.s2[i] < 0.5, y0 = lane ? h * top : h * (1 - top + 0.04), jit = fract(P.s2[i] * 7.31) - 0.5;
      let y: number, r: number, g: number, b: number;
      if (u < MG) { const e = smooth(u / MG); y = y0 + (mid - y0) * e + jit * (16 * (1 - e) + 8); [r, g, b] = lane ? [0.86, 0.86, 0.84] : [0.7, 0.74, 0.8]; }
      else if (u < GU) { y = mid + jit * 9; r = 0.9; g = 0.88; b = 0.85; }
      else { y = mid + jit * 5 * (1 + (u - GU) * 2); r = 1; g = 0.58; b = 0.26; }
      const x = u * w;
      P.tx[i] = X + x; P.ty[i] = Y + y;
      P.setC(i, r, g, b, 0.7 * edge(x, w, 0.04));
    }
    for (const i of this.g) {
      P.tx[i] = X + GU * w + (P.s1[i] - 0.5) * 3; P.ty[i] = Y + mid + (P.s2[i] - 0.5) * h * 0.5;
      P.setC(i, 1, 0.47, 0.16, open ? 1 : 0.6);
    }
  }
}

/**
 * Compliance: the USDOT number, drawn in particles, with a warm wave passing through.
 * The glyph raster is scanned in slices off the measure call, so resizes never block a frame.
 */
export class ComplianceFormation extends StageFormation {
  private pts: number[] | null = null;
  private job = 0;
  /** Called when a fresh raster is ready (the engine redraws still frames). */
  onReady?: () => void;
  measure() {
    const r = (this.r = rectOf(this.stage));
    const job = ++this.job;
    void this.rasterize(Math.max(1, Math.round(r.w)), Math.max(1, Math.round(r.h)), job);
  }
  private async rasterize(w: number, h: number, job: number) {
    const oc = document.createElement('canvas');
    oc.width = w; oc.height = h;
    const ctx = oc.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const text = COMPANY.usdot;
    let fs = h * 1.05;
    ctx.font = `250 ${fs}px "Bricolage Grotesque", sans-serif`;
    const mw = ctx.measureText(text).width;
    if (mw > w * 0.99) { fs *= (w * 0.99) / mw; ctx.font = `250 ${fs}px "Bricolage Grotesque", sans-serif`; }
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, h * 0.54);
    const pts: number[] = [], st = w > 700 ? 2 : 1, BAND = 48;
    let t0 = performance.now();
    for (let y0 = 0; y0 < h; y0 += BAND) {
      const bh = Math.min(BAND, h - y0);
      const d = ctx.getImageData(0, y0, w, bh).data;
      for (let yy = (st - (y0 % st)) % st; yy < bh; yy += st) for (let xx = 0; xx < w; xx += st) if (d[(yy * w + xx) * 4 + 3] > 120) pts.push(xx, y0 + yy);
      if (performance.now() - t0 > 8) {
        await yieldToMain();
        if (job !== this.job) return; // a newer measure superseded this one
        t0 = performance.now();
      }
    }
    for (let k = pts.length / 2 - 1; k > 0; k--) {
      const j = (Math.random() * (k + 1)) | 0;
      [pts[2 * k], pts[2 * j]] = [pts[2 * j], pts[2 * k]];
      [pts[2 * k + 1], pts[2 * j + 1]] = [pts[2 * j + 1], pts[2 * k + 1]];
    }
    if (job === this.job) { this.pts = pts.length ? pts : null; this.onReady?.(); }
  }
  assign(list: Int32Array) { this.f = this.claim(list, 0.4, 16); }
  step(t: number) {
    const { P } = this.ctx;
    const { x, y, w, h } = this.r, pts = this.pts, n = pts ? pts.length / 2 : 0, f = this.f;
    const wave = (fract(t / 7) * 1.5 - 0.25) * w;
    for (let j = 0; j < f.length; j++) {
      const i = f[j];
      if (!pts || !n) { P.tx[i] = x + P.s1[i] * w; P.ty[i] = y + h / 2 + (P.s2[i] - 0.5) * 6; P.setC(i, 0.8, 0.8, 0.8, 0.3); continue; }
      const k = j % n;
      const lx = pts[2 * k] + (P.s1[i] - 0.5) * 1.6 + Math.sin(t * 0.8 + P.s3[i] * 30) * 0.7, ly = pts[2 * k + 1] + (P.s2[i] - 0.5) * 1.6;
      P.tx[i] = x + lx; P.ty[i] = y + ly;
      const wv = Math.exp(-((lx - wave) ** 2) / (w * w * 0.004));
      P.setC(i, 0.84 + 0.16 * wv, 0.84 - 0.3 * wv, 0.84 - 0.7 * wv, 0.55 + 0.4 * wv);
    }
  }
}

/**
 * Fleet: the 53-foot bar. Crisp top and bottom edges, faint dividers every 10 ft (echoing the
 * ruler), and a sparse flow inside that warms at the trailer's end.
 */
export class FleetFormation extends StageFormation {
  assign(list: Int32Array) { this.f = this.claim(list, 0.3, 22); }
  step(t: number) {
    const { P } = this.ctx;
    const { x, y, w, h } = this.r;
    for (const i of this.f) {
      const role = P.s3[i];
      if (role < 0.06) {
        // end walls: close the box at 0 ft and 53 ft
        const leftEnd = role < 0.03;
        P.tx[i] = x + (leftEnd ? 0 : w) + (P.s2[i] - 0.5) * 1.2; P.ty[i] = y + P.s1[i] * h;
        if (leftEnd) P.setC(i, 0.86, 0.87, 0.9, 0.85); else P.setC(i, 1, 0.54, 0.14, 0.9);
      } else if (role < 0.36) {
        // top and bottom edges: a tight line, drifting slowly along its length
        const top = role < 0.21;
        const lx = fract(P.s1[i] + t / 90) * w;
        P.tx[i] = x + lx; P.ty[i] = y + (top ? 0 : h) + (P.s2[i] - 0.5) * 1.2;
        P.setC(i, 0.86, 0.87, 0.9, 0.9);
      } else if (role < 0.46) {
        // dividers at 10, 20, 30, 40 and 50 ft
        const k = 1 + Math.floor(P.s1[i] * 5), lx = ((k * 10) / 53) * w;
        P.tx[i] = x + lx + (P.s2[i] - 0.5) * 0.8; P.ty[i] = y + fract(P.s2[i] * 13.7) * h;
        P.setC(i, 0.8, 0.82, 0.88, 0.3);
      } else {
        const lx = fract(P.s1[i] + (t / 60) * (0.8 + 0.4 * role)) * w, ly = (0.12 + 0.76 * P.s2[i]) * h;
        P.tx[i] = x + lx; P.ty[i] = y + ly;
        const end = lx > w * 0.97 ? 1 : 0;
        P.setC(i, 0.84 + 0.16 * end, 0.84 - 0.3 * end, 0.84 - 0.7 * end, 0.6 * Math.min(1, lx / 6 + 0.3));
      }
    }
  }
}

/**
 * Drivers: out-and-back runs from the Chicago hub. Five flat, narrow loops at different
 * headings and lengths read as routes on a map rather than petals.
 */
export class DriversFormation extends StageFormation {
  private static P: [number, number][] = [[-0.25, 0.46], [0.42, 0.34], [2.9, 0.44], [3.7, 0.3], [1.75, 0.24]];
  assign(list: Int32Array) { this.f = this.claim(list, 0.24, 40); }
  step(t: number) {
    const { P } = this.ctx;
    const { x, y, w, h } = this.r, hx = x + w / 2, hy = y + h / 2, loops = DriversFormation.P, np = loops.length;
    for (const i of this.f) {
      const k = Math.floor(P.s1[i] * np), [phi, Lf] = loops[k], L = Lf * w, T = 6 + Lf * 18;
      const u = fract(P.s1[i] * np - k + t / T), rr = L * Math.sin(Math.PI * u);
      // outbound on one side of the line, back on the other: a thin loop, 0.16 rad wide
      const ang = phi + (u - 0.5) * 0.16 + (P.s2[i] - 0.5) * 0.03;
      P.tx[i] = hx + Math.cos(ang) * rr; P.ty[i] = hy + Math.sin(ang) * rr * 0.85;
      P.setC(i, 0.84 + 0.16 * u, 0.84 - 0.3 * u, 0.84 - 0.7 * u, 0.62);
    }
  }
}

/**
 * Platform: one system. Three concentric orbits circling a warm core, with spokes of
 * particles travelling in to the core and back out.
 */
export class PlatformFormation extends StageFormation {
  assign(list: Int32Array) { this.f = this.claim(list, 0.22, 30); }
  step(t: number) {
    const { P } = this.ctx;
    const { x, y, w, h } = this.r, cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h / 0.62) * 0.48;
    for (const i of this.f) {
      const role = P.s3[i];
      if (role < 0.08) {
        const a = P.s1[i] * 6.283 + t * 0.4, rr = R * 0.09 * Math.sqrt(P.s2[i]);
        P.tx[i] = cx + Math.cos(a) * rr; P.ty[i] = cy + Math.sin(a) * rr;
        P.setC(i, 1, 0.62, 0.32, 0.9);
        continue;
      }
      if (role < 0.16) {
        const a = Math.floor(P.s1[i] * 6) * 1.047 + 0.3, u = fract(P.s2[i] + t / 5), rr = R * (0.12 + 0.88 * Math.abs(1 - 2 * u));
        P.tx[i] = cx + Math.cos(a) * rr; P.ty[i] = cy + Math.sin(a) * rr * 0.62;
        P.setC(i, 1, 0.75, 0.5, 0.45);
        continue;
      }
      const ring = role < 0.44 ? 0 : role < 0.72 ? 1 : 2, rr = R * (0.38 + ring * 0.3) + (P.s2[i] - 0.5) * 3;
      const a = P.s1[i] * 6.283 + t * (0.16 - ring * 0.04) * (ring === 1 ? -1 : 1);
      P.tx[i] = cx + Math.cos(a) * rr; P.ty[i] = cy + Math.sin(a) * rr * 0.62;
      P.setC(i, 0.84, 0.86, 0.9, 0.52 - ring * 0.08);
    }
  }
}

/** Closing CTA: a wide spread that narrows into one warm stream towards the button. */
export class CtaFormation extends StageFormation {
  assign(list: Int32Array) { this.f = this.claim(list, 0.22, 70); }
  step(t: number) {
    const { P } = this.ctx;
    const { x, y, w, h } = this.r;
    for (const i of this.f) {
      const u = fract(P.s1[i] + (t / 8) * (0.8 + 0.4 * P.s3[i])), v = Math.pow(1 - u, 1.7);
      const lx = u * w, ly = h / 2 + (P.s2[i] - 0.5) * h * 0.95 * v + Math.sin(u * 9 + t + P.s3[i] * 6) * 4 * v;
      P.tx[i] = x + lx; P.ty[i] = y + ly;
      P.setC(i, 0.84 + 0.16 * u, 0.84 - 0.38 * u, 0.84 - 0.74 * u, (0.4 + 0.6 * u) * Math.min(1, u * 8));
    }
  }
}
