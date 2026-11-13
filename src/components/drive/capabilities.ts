/**
 * Decides how the 3D drive runs on this device. Pure functions over a plain environment
 * snapshot so the choice is unit-testable.
 *
 *  high   — full scene with bloom
 *  low    — same scene, no post-processing, 1× pixels, fewer particles
 *  static — no canvas at all: a painted backdrop behind the same content
 */
export type DriveMode = 'high' | 'low' | 'static';

export interface DriveEnvironment {
  reducedMotion: boolean;
  /** navigator.connection.saveData */
  saveData: boolean;
  webgl: boolean;
  /** min(innerWidth, screen.width) */
  viewportWidth: number;
  /** navigator.hardwareConcurrency (undefined when the browser hides it) */
  cores?: number;
  /** navigator.deviceMemory in GB (Chromium only) */
  memory?: number;
  /** WebGL is a CPU rasteriser (SwiftShader, llvmpipe, Microsoft Basic Render) */
  softwareGL?: boolean;
}

export interface DrivePlan {
  mode: DriveMode;
  /** Reduced motion: nothing moves on its own; the scene cuts between chapters as the page scrolls. */
  still: boolean;
}

export const SMALL_BREAKPOINT = 760;

/** True when the WebGL renderer string names a CPU rasteriser. */
export function isSoftwareRenderer(renderer: string | null | undefined): boolean {
  return !!renderer && /swiftshader|llvmpipe|softpipe|basic render|software/i.test(renderer);
}

export function planDrive(env: DriveEnvironment): DrivePlan {
  const still = env.reducedMotion;
  if (env.saveData || !env.webgl) return { mode: 'static', still };
  const weak = (env.cores !== undefined && env.cores <= 4) || (env.memory !== undefined && env.memory < 4);
  const small = env.viewportWidth < SMALL_BREAKPOINT;
  if (env.softwareGL || (weak && small)) return { mode: 'low', still };
  return { mode: 'high', still };
}

/** Runtime ladder: when frames stay slow the page steps down one rung. */
export function nextDowngrade(mode: DriveMode): DriveMode {
  return mode === 'high' ? 'low' : 'static';
}

/** `?drive=high|low|static` pins the mode (and turns the slow-frame watchdog off) for testing. */
export function parseOverride(search: string): DriveMode | null {
  const v = new URLSearchParams(search).get('drive');
  return v === 'high' || v === 'low' || v === 'static' ? v : null;
}

/** Browser-side snapshot of everything except the WebGL probe. */
export function readEnvironment(): Omit<DriveEnvironment, 'webgl' | 'softwareGL'> {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  return {
    reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    saveData: !!nav.connection?.saveData,
    viewportWidth: Math.min(window.innerWidth, window.screen?.width || window.innerWidth),
    cores: nav.hardwareConcurrency || undefined,
    memory: nav.deviceMemory,
  };
}
