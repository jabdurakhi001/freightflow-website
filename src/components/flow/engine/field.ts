import type { FlowBridge, FlowEngineHandle, FlowRegistration } from '../bridge';
import { SLOW_FRAME_MS, SLOW_WINDOW_S, type FlowPlan } from '../capabilities';
import { HeroFormation } from './formations/hero';
import { ComplianceFormation, CtaFormation, DriversFormation, FleetFormation, HowFormation, PlatformFormation } from './formations/sections';
import { Canvas2DRenderer, WebGLRenderer, type Renderer } from './renderers';
import { Particles, T_STILL, type Formation, type FormationContext } from './state';
import { UsMap } from './usMap';

/**
 * One particle system for the whole page, drawn on a fixed full-viewport canvas.
 *
 * - Which formation is active comes from an IntersectionObserver watching the registered
 *   sections against the viewport's middle line (no per-frame layout reads).
 * - Unowned particles drift in an ambient current; owned ones spring to their targets.
 * - The loop pauses while the tab is hidden, while a WebGL context is lost and while a
 *   modal covers the page.
 * - It watches its own frame time: frames averaging over 50ms for 2s call `onSlow`, and the
 *   host steps down (half the particles, then the 2D canvas, then static art).
 * - Reduced motion renders one settled frame per change (scroll, resize, lane).
 */

export interface FieldOptions {
  canvas: HTMLCanvasElement;
  plan: FlowPlan;
  gl: WebGLRenderingContext | null;
  c2d: CanvasRenderingContext2D | null;
  bridge: FlowBridge;
  mapUrl: string;
  /** Frames stayed slow: the host should rebuild the field one step down. */
  onSlow?: () => void;
}

export interface FlowField extends FlowEngineHandle {
  destroy(): void;
}

/** Ambient (unowned) particles stay faint so they never streak through body text. */
const AMB_ALPHA = 0.06;

const AMB: [number, number, number] = [0.8, 0.8, 0.8];

export function createFlowField({ canvas, plan, gl, c2d, bridge, mapUrl, onSlow }: FieldOptions): FlowField {
  const { small, still, dpr: DPR } = plan;
  const N = plan.particles;
  const P = new Particles(N);
  const ctx: FormationContext = { P, small, still };
  const usMap = new UsMap();
  const ambAlpha = AMB_ALPHA;
  const now = () => performance.now() / 1000;

  let vw = window.innerWidth, vh = window.innerHeight, sx = window.scrollX, sy = window.scrollY;
  for (let i = 0; i < N; i++) {
    P.px[i] = Math.random() * vw; P.py[i] = sy + Math.random() * vh;
    P.vx[i] = 20; P.al[i] = 0; P.aT[i] = 0.13;
    P.cr[i] = P.tr[i] = 0.62; P.cg[i] = P.tg[i] = 0.7; P.cb[i] = P.tb[i] = 0.92;
  }

  /* ---------------- formations, driven by section visibility ---------------- */
  const formations = new Map<FlowRegistration, Formation>();
  const visible = new Set<FlowRegistration>();
  let lane: { from: string; to: string | null } = bridge.lane;
  let active: Formation | null = null;

  function create(reg: FlowRegistration): Formation {
    switch (reg.kind) {
      case 'hero': {
        const h = new HeroFormation(ctx, reg.stage, usMap, (g) => bridge.emitGeometry(g));
        h.measure();
        h.setLane(lane.from, lane.to, now(), false);
        return h;
      }
      case 'how': return new HowFormation(ctx, reg.stage);
      case 'compliance': {
        const c = new ComplianceFormation(ctx, reg.stage);
        c.onReady = () => redraw();
        return c;
      }
      case 'platform': return new PlatformFormation(ctx, reg.stage);
      case 'fleet': return new FleetFormation(ctx, reg.stage);
      case 'drivers': return new DriversFormation(ctx, reg.stage);
      case 'cta': return new CtaFormation(ctx, reg.stage);
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const reg = [...formations.keys()].find((r) => r.section === e.target);
        if (!reg) continue;
        if (e.isIntersecting) visible.add(reg); else visible.delete(reg);
      }
      redraw();
    },
    // A zero-height band across the middle of the viewport: the section under it is active.
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
  );

  function pick(): Formation | null {
    for (const reg of visible) {
      const f = formations.get(reg) ?? null;
      if (f instanceof HeroFormation && !usMap.ready) return null;
      return f;
    }
    return null;
  }

  function activate(f: Formation | null, t: number) {
    if (f === active) return;
    for (let i = 0; i < N; i++) {
      // the old shape dissolves quickly instead of lingering as a ghost over the next section
      if (P.has[i] && !still) {
        P.al[i] *= 0.3;
        P.vx[i] += (Math.random() - 0.5) * 220; P.vy[i] += (Math.random() - 0.5) * 220; // scatter the shape
      }
      P.has[i] = 0; P.pX[i] = NaN; P.setC(i, AMB[0], AMB[1], AMB[2], ambAlpha);
    }
    active = f;
    // after a long jump, bring stragglers to just off-screen so they pour in instead of crossing the page
    const lo = sy - vh * 0.35, hi = sy + vh * 1.35;
    for (let i = 0; i < N; i++) {
      if (P.py[i] < lo) { P.py[i] = lo - Math.random() * vh * 0.25; P.vy[i] = Math.max(P.vy[i], 0); }
      else if (P.py[i] > hi) { P.py[i] = hi + Math.random() * vh * 0.25; P.vy[i] = Math.min(P.vy[i], 0); }
    }
    if (!f) return;
    f.assign(P.perm, t);
    for (let i = 0; i < N; i++) if (P.has[i]) P.wake[i] = still ? 0 : t + Math.random() * 0.5;
  }

  function measureAll() {
    vw = window.innerWidth; vh = window.innerHeight;
    formations.forEach((f) => f.measure());
  }

  /* ---------------- pointer: water around a hand (mouse, pen or a tap) ---------------- */
  let mx = -1e5, my = -1e5, pmx = 0, pmy = 0, pvx = 0, pvy = 0, touchTimer = 0;
  const away = () => { mx = my = -1e5; };
  const onMove = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
  const onDown = (e: PointerEvent) => {
    mx = e.clientX; my = e.clientY;
    if (e.pointerType !== 'mouse') { window.clearTimeout(touchTimer); touchTimer = window.setTimeout(away, 700); }
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  window.addEventListener('pointercancel', away, { passive: true });
  document.addEventListener('pointerleave', away);
  window.addEventListener('blur', away);

  /* ---------------- simulation ---------------- */
  function physics(t: number, dt: number) {
    const mpx = mx + sx, mpy = my + sy, R = small ? 60 : 90, R2 = R * R;
    if (mx < -1e4 || pmx < -1e4 || dt <= 0) { pvx = pvy = 0; } else { pvx += ((mx - pmx) / dt - pvx) * 0.2; pvy += ((my - pmy) / dt - pvy) * 0.2; }
    pmx = mx; pmy = my;
    const hv = mx < -1e4 ? 0 : 1;
    const top = sy - 60, span = vh + 120, fa = Math.min(1, dt * 2.6), fc = Math.min(1, dt * 3.5);
    const { px, py, vx, vy, tx, ty, pX, pY, kk, has, tele, wake, al, aT, cr, cg, cb, tr, tg, tb, s1, s2 } = P;
    for (let i = 0; i < N; i++) {
      let x = px[i], y = py[i], ux = vx[i], uy = vy[i], ax: number, ay: number;
      if (has[i] && t >= wake[i]) {
        const X = tx[i], Y = ty[i];
        if (tele[i] || (pX[i] === pX[i] && Math.abs(X - pX[i]) + Math.abs(Y - pY[i]) > 90)) {
          x = X; y = Y; ux = uy = 0; al[i] = 0; tele[i] = 0;
        }
        pX[i] = X; pY[i] = Y;
        const k = kk[i], c = 1.25 * Math.sqrt(k);
        ax = (X - x) * k - ux * c; ay = (Y - y) * k - uy * c;
        // a little turbulence while travelling
        const far = Math.min(1, (Math.abs(X - x) + Math.abs(Y - y)) / 300);
        if (far > 0.05) {
          ax += far * 240 * Math.sin(y * 0.006 + t * 0.7 + s1[i] * 6);
          ay += far * 240 * Math.cos(x * 0.006 - t * 0.5 + s2[i] * 6);
        }
      } else {
        tele[i] = 0;
        const fx = 24 + 18 * Math.sin(y * 0.0029 + t * 0.21 + s1[i] * 1.5), fy = 10 * Math.sin(x * 0.0041 - t * 0.17) + 6 * Math.cos(y * 0.0023 + t * 0.12 + s2[i]);
        ax = (fx - ux) * 1.4; ay = (fy - uy) * 1.4;
        if (!has[i]) {
          if (y < top) { y += span; al[i] = 0; } else if (y > top + span) { y -= span; al[i] = 0; }
          if (x > vw + 10) { x -= vw + 20; al[i] = 0; } else if (x < -10) { x += vw + 20; al[i] = 0; }
        }
      }
      if (hv) {
        const dx = x - mpx, dy = y - mpy, d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.01) {
          const d = Math.sqrt(d2), f = (1 - d / R) ** 2 * 1500;
          ax += (dx / d) * f - (dy / d) * f * 0.45; ay += (dy / d) * f + (dx / d) * f * 0.45;
          ax += pvx * (1 - d / R) * 1.2; ay += pvy * (1 - d / R) * 1.2;
        }
      }
      ux += ax * dt; uy += ay * dt;
      const sp = ux * ux + uy * uy;
      if (sp > 6.25e6) { const m = 2500 / Math.sqrt(sp); ux *= m; uy *= m; }
      px[i] = x + ux * dt; py[i] = y + uy * dt; vx[i] = ux; vy[i] = uy;
      al[i] += (aT[i] - al[i]) * fa;
      cr[i] += (tr[i] - cr[i]) * fc; cg[i] += (tg[i] - cg[i]) * fc; cb[i] += (tb[i] - cb[i]) * fc;
    }
  }

  /** Reduced motion: everything straight to its place. */
  function settle() {
    for (let i = 0; i < N; i++) {
      if (P.has[i]) { P.px[i] = P.tx[i]; P.py[i] = P.ty[i]; }
      else { P.px[i] = P.s1[i] * vw; P.py[i] = sy + P.s2[i] * vh; }
      P.al[i] = P.aT[i]; P.cr[i] = P.tr[i]; P.cg[i] = P.tg[i]; P.cb[i] = P.tb[i]; P.vx[i] = P.vy[i] = 0;
    }
  }

  /* ---------------- rendering ---------------- */
  const renderer: Renderer = gl
    ? new WebGLRenderer(gl, N, DPR, small ? 2.1 : 1.9)
    : new Canvas2DRenderer(c2d!, DPR);
  let cssW = 0, cssH = 0;
  function size() {
    cssW = canvas.clientWidth || window.innerWidth;
    cssH = canvas.clientHeight || window.innerHeight;
    const w = Math.round(cssW * DPR), h = Math.round(cssH * DPR);
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
  }
  const draw = () => renderer.draw(P, sx, sy, cssW, cssH);

  /* ---------------- loop ---------------- */
  let raf = 0, last = now(), lost = false, destroyed = false, paused = false;
  // frame-time monitor: a rolling window of real frame durations
  const bootAt = now();
  let winStart = 0, winSum = 0, winCount = 0, slowFired = false;
  function monitor(t: number, raw: number) {
    if (slowFired || !onSlow || t - bootAt < 1.5) return; // skip boot jank
    if (!winStart) winStart = t;
    // Cap, don't skip, very long frames: one stall after a tab return can't trip the average on
    // a healthy device, but a device stuck at a few frames a second still steps down.
    winSum += Math.min(raw, 0.5); winCount++;
    if (t - winStart >= SLOW_WINDOW_S) {
      const avgMs = (winSum / winCount) * 1000;
      winStart = t; winSum = 0; winCount = 0;
      if (avgMs > SLOW_FRAME_MS) { slowFired = true; onSlow(); }
    }
  }
  function frame() {
    raf = 0;
    if (document.hidden || lost || destroyed || paused) return;
    const t = now(), raw = Math.max(0, t - last), dt = Math.min(1 / 20, raw);
    last = t;
    monitor(t, raw);
    sx = window.scrollX; sy = window.scrollY;
    const f = pick();
    if (f !== active) activate(f, t);
    active?.step(t, dt);
    physics(t, dt);
    draw();
    raf = requestAnimationFrame(frame);
  }
  function stillFrame() {
    if (lost || destroyed) return;
    sx = window.scrollX; sy = window.scrollY;
    const f = pick();
    if (f !== active) activate(f, T_STILL);
    active?.step(T_STILL, 0);
    for (let i = 0; i < N; i++) if (!P.has[i]) P.setC(i, AMB[0], AMB[1], AMB[2], ambAlpha);
    settle();
    draw();
  }
  let pend = 0;
  function redraw() {
    if (still && !pend) pend = requestAnimationFrame(() => { pend = 0; stillFrame(); });
  }
  function start() {
    if (destroyed || lost || paused) return;
    if (still) { redraw(); return; }
    if (!raf && !document.hidden) { last = now(); winStart = 0; winSum = 0; winCount = 0; raf = requestAnimationFrame(frame); }
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  /* ---------------- events ---------------- */
  let rs = 0;
  const onResize = () => {
    window.clearTimeout(rs);
    rs = window.setTimeout(() => {
      size(); measureAll();
      if (active instanceof HeroFormation) active.launch(now());
      redraw(); start();
    }, 120);
  };
  const ro = new ResizeObserver(() => { measureAll(); redraw(); });
  const onVisibility = () => { if (document.hidden) stop(); else start(); };
  const onScroll = () => redraw();
  const onLost = (e: Event) => { e.preventDefault(); lost = true; stop(); };
  const onRestored = () => { lost = false; renderer.restore(); size(); start(); redraw(); };

  window.addEventListener('resize', onResize);
  ro.observe(document.body);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('scroll', onScroll, { passive: true });
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);
  document.fonts?.ready.then(() => { if (!destroyed) { formations.forEach((f) => f instanceof ComplianceFormation && f.measure()); redraw(); } });

  const mapAbort = new AbortController();
  usMap.load(mapUrl, mapAbort.signal).then(() => {
    if (destroyed) return;
    formations.forEach((f) => { if (f instanceof HeroFormation) { f.geom(); f.measure(); } });
    redraw();
  });

  size();
  start();

  return {
    add(reg) {
      if (formations.has(reg)) return;
      const f = create(reg);
      f.measure();
      formations.set(reg, f);
      io.observe(reg.section);
    },
    remove(reg) {
      const f = formations.get(reg);
      formations.delete(reg);
      visible.delete(reg);
      io.unobserve(reg.section);
      if (f && f === active) activate(null, now());
    },
    setPaused(p) {
      paused = p;
      if (p) stop(); else start();
    },
    setLane(from, to) {
      lane = { from, to };
      formations.forEach((f) => { if (f instanceof HeroFormation) f.setLane(from, to, now(), f === active); });
      redraw();
    },
    destroy() {
      destroyed = true;
      stop();
      cancelAnimationFrame(pend);
      window.clearTimeout(rs);
      window.clearTimeout(touchTimer);
      mapAbort.abort();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointercancel', away);
      document.removeEventListener('pointerleave', away);
      window.removeEventListener('blur', away);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('scroll', onScroll);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    },
  };
}
