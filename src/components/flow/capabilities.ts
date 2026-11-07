/**
 * Decides how the particle field runs on this device. Pure functions over a plain
 * environment snapshot so the choice is unit-testable.
 */

export type FlowMode = 'webgl' | 'canvas2d' | 'static';

export interface FlowEnvironment {
  reducedMotion: boolean;
  /** navigator.connection.saveData */
  saveData: boolean;
  webgl: boolean;
  canvas2d: boolean;
  /** min(innerWidth, screen.width) */
  viewportWidth: number;
  devicePixelRatio: number;
  /** navigator.hardwareConcurrency (undefined when the browser hides it) */
  cores?: number;
  /** navigator.deviceMemory in GB (Chromium only) */
  memory?: number;
  /** WebGL is a CPU rasteriser (SwiftShader, llvmpipe, Microsoft Basic Render) */
  softwareGL?: boolean;
}

export interface FlowPlan {
  mode: FlowMode;
  /** Reduced motion: render one settled frame per change instead of animating. */
  still: boolean;
  particles: number;
  dpr: number;
  small: boolean;
}

export const SMALL_BREAKPOINT = 760;

/** Save-data and missing canvas support both get the static CSS art (no atlas fetch, no loop). */
export function selectMode(env: Pick<FlowEnvironment, 'saveData' | 'webgl' | 'canvas2d'>): FlowMode {
  if (env.saveData) return 'static';
  if (env.webgl) return 'webgl';
  if (env.canvas2d) return 'canvas2d';
  return 'static';
}

export function particleBudget(mode: FlowMode, small: boolean, cores?: number, memory?: number, softwareGL = false): number {
  if (mode === 'static') return 0;
  let n = mode === 'webgl' ? (small ? 10000 : 24000) : small ? 2500 : 6000;
  const weak = (cores !== undefined && cores <= 4) || (memory !== undefined && memory < 4);
  if (weak) n *= 0.6;
  if (softwareGL && mode === 'webgl') n *= 0.35;
  return Math.round(n / 100) * 100;
}

/** True when the WebGL renderer string names a CPU rasteriser. */
export function isSoftwareRenderer(renderer: string | null | undefined): boolean {
  return !!renderer && /swiftshader|llvmpipe|softpipe|basic render|software/i.test(renderer);
}

/**
 * `scale` is the runtime downgrade factor: the field halves it when frames stay slow.
 */
export function planFlow(env: FlowEnvironment, scale = 1): FlowPlan {
  const mode = selectMode(env);
  const small = env.viewportWidth < SMALL_BREAKPOINT;
  return {
    mode,
    still: env.reducedMotion,
    particles: Math.round((particleBudget(mode, small, env.cores, env.memory, env.softwareGL) * scale) / 100) * 100,
    dpr: Math.min(small ? 1.5 : 2, env.devicePixelRatio || 1),
    small,
  };
}

/** Browser-side snapshot of everything except the canvas probes (those need the real canvas). */
export function readEnvironment(): Omit<FlowEnvironment, 'webgl' | 'canvas2d'> {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  return {
    reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    saveData: !!nav.connection?.saveData,
    viewportWidth: Math.min(window.innerWidth, window.screen?.width || window.innerWidth),
    devicePixelRatio: window.devicePixelRatio || 1,
    cores: nav.hardwareConcurrency || undefined,
    memory: nav.deviceMemory,
  };
}

/** Runtime downgrade ladder: frames averaging slower than this for `SLOW_WINDOW_S` trigger the next step. */
export const SLOW_FRAME_MS = 50;
export const SLOW_WINDOW_S = 2;

export type DowngradeStep = { mode: FlowMode; scale: number };

/** WebGL full → WebGL half → 2D canvas (half) → static. */
export function nextDowngrade(current: DowngradeStep): DowngradeStep {
  if (current.mode === 'webgl' && current.scale > 0.5) return { mode: 'webgl', scale: 0.5 };
  if (current.mode === 'webgl') return { mode: 'canvas2d', scale: 0.5 };
  if (current.mode === 'canvas2d' && current.scale > 0.5) return { mode: 'canvas2d', scale: 0.5 };
  return { mode: 'static', scale: 0 };
}
