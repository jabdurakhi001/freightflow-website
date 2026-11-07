import { MAP_H, MAP_W } from '../projection';

/**
 * The lower-48 outline as a pixel mask in the 975×610 map box. Until the vendored
 * outline (public/flow/us48.json, ~35 KB) arrives, a soft ellipse stands in.
 */
export class UsMap {
  private mask: Uint8Array | null = null;
  private insidePts: Int16Array | null = null;
  ready = false;

  inside(x: number, y: number): boolean {
    const m = this.mask;
    if (!m) { const dx = (x - 487) / 440, dy = (y - 300) / 250; return dx * dx + dy * dy < 1; }
    const ix = x | 0, iy = y | 0;
    return ix >= 0 && iy >= 0 && ix < MAP_W && iy < MAP_H && m[iy * MAP_W + ix] === 1;
  }

  /** A uniformly random point inside the outline. */
  sample(out: number[]) {
    const pts = this.insidePts;
    if (pts) {
      const k = (Math.random() * (pts.length / 2)) | 0;
      out[0] = pts[2 * k] + Math.random(); out[1] = pts[2 * k + 1] + Math.random();
      return;
    }
    let x: number, y: number;
    do { x = 47 + Math.random() * 880; y = 50 + Math.random() * 500; } while (!this.inside(x, y));
    out[0] = x; out[1] = y;
  }

  /** Coastal cities can sit a pixel or two off the outline: nudge a point onto solid land. */
  onLand(p: [number, number]): [number, number] {
    const solid = (x: number, y: number) => {
      for (let a = 0; a < 8; a++) if (!this.inside(x + Math.cos(a * 0.785) * 7, y + Math.sin(a * 0.785) * 7)) return false;
      return this.inside(x, y);
    };
    if (!this.mask || solid(p[0], p[1])) return p;
    let best = p, bd = Infinity;
    for (let dy = -22; dy <= 22; dy++) for (let dx = -22; dx <= 22; dx++) {
      const d = dx * dx + dy * dy;
      if (d < bd && solid(p[0] + dx, p[1] + dy)) { bd = d; best = [p[0] + dx, p[1] + dy]; }
    }
    return best;
  }

  async load(url: string, signal?: AbortSignal): Promise<boolean> {
    try {
      const res = await fetch(url, { signal });
      if (!res.ok) return false;
      const { d } = (await res.json()) as { d: string };
      await yieldToMain();
      const oc = document.createElement('canvas');
      oc.width = MAP_W; oc.height = MAP_H;
      const ctx = oc.getContext('2d', { willReadFrequently: true });
      if (!ctx || signal?.aborted) return false;
      ctx.fillStyle = '#fff';
      ctx.fill(new Path2D(d));
      // Read and scan the raster in bands, yielding between slices so no task runs long.
      const mask = new Uint8Array(MAP_W * MAP_H), pts: number[] = [];
      const BAND = 40;
      let t0 = performance.now();
      for (let y0 = 0; y0 < MAP_H; y0 += BAND) {
        const h = Math.min(BAND, MAP_H - y0);
        const px = ctx.getImageData(0, y0, MAP_W, h).data;
        for (let y = 0; y < h; y++) for (let x = 0; x < MAP_W; x++) {
          if (px[(y * MAP_W + x) * 4 + 3] > 140) { mask[(y0 + y) * MAP_W + x] = 1; pts.push(x, y0 + y); }
        }
        if (performance.now() - t0 > 8) {
          await yieldToMain();
          if (signal?.aborted) return false;
          t0 = performance.now();
        }
      }
      this.mask = mask;
      this.insidePts = new Int16Array(pts);
      this.ready = true;
      return true;
    } catch {
      return false; // keep the ellipse
    }
  }
}

/** Gives the main thread back (input, paint) between slices of work. */
export function yieldToMain(): Promise<void> {
  const sched = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (sched?.yield) return sched.yield();
  return new Promise((r) => setTimeout(r, 0));
}
