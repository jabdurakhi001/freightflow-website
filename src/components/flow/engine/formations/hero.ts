import { CITIES } from '../../../../lib/lanes';
import type { LaneGeometry } from '../../bridge';
import { MAP_H, MAP_W, laneControl, projectAlbers } from '../../projection';
import { fract, rectOf, T_STILL, type Formation, type FormationContext, type Rect } from '../state';
import type { UsMap } from '../usMap';

/**
 * Hero: about three quarters of the particles hold the lower-48 outline and drift in a
 * slow eastward current; a tenth pour along the chosen lane as an amber→orange stream.
 */
export class HeroFormation implements Formation {
  private r: Rect = { x: 0, y: 0, w: 0, h: 0 };
  private s = 1; private ox = 0; private oy = 0;
  private route: number[] = [];
  private map: number[] = [];
  private lane: { from: string; to: string | null } | null = null;
  private p1: [number, number] = [0, 0];
  private p2: [number, number] | null = null;
  private c: [number, number] = [0, 0];
  private T = 3;
  private par = 0;
  private tmp = [0, 0];

  constructor(
    private ctx: FormationContext,
    private stage: HTMLElement,
    private usMap: UsMap,
    private onGeometry: (g: LaneGeometry | null) => void,
  ) {}

  measure() {
    const r = (this.r = rectOf(this.stage));
    const s = (this.s = Math.min(r.w / MAP_W, r.h / MAP_H));
    this.ox = r.x + (r.w - MAP_W * s) / 2;
    this.oy = r.y + (r.h - MAP_H * s) / 2;
  }

  assign(list: Int32Array, t: number) {
    const { P } = this.ctx, N = P.n;
    const nR = Math.floor(N * 0.1), nM = Math.floor(N * 0.74);
    this.route = Array.from(list.subarray(0, nR));
    this.map = Array.from(list.subarray(nR, nR + nM));
    for (let k = 0; k < nR + nM; k++) { P.has[list[k]] = 1; P.kk[list[k]] = 14; }
    if (this.lane) this.launch(t);
  }

  setLane(from: string, to: string | null, t: number, active: boolean) {
    this.lane = { from, to };
    this.geom();
    if (active) this.launch(t);
  }

  /** Re-project after the outline loads (onLand needs the mask). */
  geom() {
    const L = this.lane;
    if (!L || !CITIES[L.from]) return;
    this.p1 = this.usMap.onLand(projectAlbers(CITIES[L.from]));
    if (!L.to || !CITIES[L.to]) {
      this.p2 = null;
    } else {
      const p2 = (this.p2 = this.usMap.onLand(projectAlbers(CITIES[L.to])));
      this.c = laneControl(this.p1, p2);
      this.T = 1.8 + Math.hypot(p2[0] - this.p1[0], p2[1] - this.p1[1]) / 260;
    }
    if (this.usMap.ready) this.onGeometry({ p1: this.p1, p2: this.p2 });
  }

  /** Queue the stream particles at the origin, nearest first, so the lane pours out in order. */
  launch(t: number) {
    if (!this.lane || !this.p2) return;
    const { P, still } = this.ctx;
    const ox = this.ox + this.p1[0] * this.s, oy = this.oy + this.p1[1] * this.s;
    const R = this.route, d = R.map((i) => (P.px[i] - ox) ** 2 + (P.py[i] - oy) ** 2);
    const order = R.map((_, k) => k).sort((a, b) => d[a] - d[b]);
    const n = R.length;
    order.forEach((k, rank) => {
      const i = R[k];
      P.uS[i] = still ? T_STILL - (rank / n) * this.T : t + 0.6 + (rank / n) * this.T;
      P.pX[i] = NaN;
    });
  }

  step(t: number, dt: number) {
    const { P } = this.ctx, m = this.usMap, tmp = this.tmp;
    const s = this.s, ox = this.ox, oy = this.oy;
    this.par ^= 1;
    const flowing = !!(this.lane && this.p2);
    const wave = fract(t / 26) * 1700 - 360;
    const nm = this.map.length, nl = flowing ? nm : nm + this.route.length;
    for (let j = 0; j < nl; j++) {
      const i = j < nm ? this.map[j] : this.route[j - nm];
      if (P.mX[i] !== P.mX[i]) { m.sample(tmp); P.mX[i] = tmp[0]; P.mY[i] = tmp[1]; }
      let x = P.mX[i], y = P.mY[i];
      if (dt > 0 && (j & 1) === this.par) {
        // a slow eastward current inside the outline (half the anchors per frame)
        const fx = 6 * Math.sin(y * 0.021 + t * 0.13), fy = 6 * Math.cos(x * 0.017 - t * 0.11);
        x += fx * dt * 2; y += fy * dt * 2;
        if (!m.inside(x, y) || Math.random() < 0.0008) { m.sample(tmp); x = tmp[0]; y = tmp[1]; P.tele[i] = 1; }
        P.mX[i] = x; P.mY[i] = y;
      }
      P.tx[i] = ox + x * s; P.ty[i] = oy + y * s; P.kk[i] = 14;
      // a broad, soft warm sweep (wide falloff, gentle boost) so stills never show a stripe
      const dw = (x - wave) / 220, w = dw > -1 && dw < 1 ? (1 - dw * dw) * (1 - dw * dw) : 0;
      const tw = Math.abs(2 * fract(t * 0.12 * (0.6 + P.s2[i]) + P.s3[i]) - 1);
      P.setC(i, 0.78 + 0.16 * w, 0.79 + 0.04 * w, 0.8 - 0.16 * w, (flowing ? 0.34 : 0.42) + 0.14 * tw + 0.1 * w);
    }
    if (!flowing || !this.p2) return;
    const p1 = this.p1, p2 = this.p2, c = this.c, T = this.T;
    const sp = Math.max(0.6, s / 0.75);
    for (const i of this.route) {
      const st = P.uS[i];
      if (t < st) {
        // waiting at the origin
        const a = P.s1[i] * 6.283, rr = 5 * Math.sqrt(P.s2[i]) * sp;
        P.tx[i] = ox + p1[0] * s + Math.cos(a) * rr; P.ty[i] = oy + p1[1] * s + Math.sin(a) * rr; P.kk[i] = 9;
        P.setC(i, 1, 0.8, 0.6, 0.75);
        continue;
      }
      const u = fract((t - st) / T), v = 1 - u;
      const bx = v * v * p1[0] + 2 * v * u * c[0] + u * u * p2[0], by = v * v * p1[1] + 2 * v * u * c[1] + u * u * p2[1];
      let gx = 2 * v * (c[0] - p1[0]) + 2 * u * (p2[0] - c[0]), gy = 2 * v * (c[1] - p1[1]) + 2 * u * (p2[1] - c[1]);
      const gl = Math.hypot(gx, gy) || 1; gx /= gl; gy /= gl;
      const g = (P.s2[i] + P.s3[i] + P.s1[i] - 1.5) * 2.4;
      const off = g * (1.6 + 3.2 * Math.sin(Math.PI * u)) + Math.sin(u * 22 - t * 2.6 + P.s1[i] * 6) * 0.9;
      P.tx[i] = ox + (bx - gy * off) * s; P.ty[i] = oy + (by + gx * off) * s; P.kk[i] = 60;
      P.setC(i, 1, 0.82 - 0.4 * u, 0.6 - 0.5 * u, Math.min(1, v * 30, 0.7 + u * 8));
    }
  }
}
