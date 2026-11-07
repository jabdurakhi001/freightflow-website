import { describe, expect, it } from 'vitest';
import { isSoftwareRenderer, nextDowngrade, particleBudget, planFlow, selectMode, type FlowEnvironment } from './capabilities';

const desktop: FlowEnvironment = {
  reducedMotion: false,
  saveData: false,
  webgl: true,
  canvas2d: true,
  viewportWidth: 1440,
  devicePixelRatio: 2,
  cores: 8,
  memory: 8,
};

describe('fallback selection', () => {
  it('uses WebGL when it is available', () => {
    expect(selectMode(desktop)).toBe('webgl');
  });

  it('falls back to the 2D canvas without WebGL', () => {
    expect(selectMode({ ...desktop, webgl: false })).toBe('canvas2d');
    expect(planFlow({ ...desktop, webgl: false }).particles).toBe(6000);
  });

  it('falls back to static art with neither WebGL nor 2D canvas', () => {
    const plan = planFlow({ ...desktop, webgl: false, canvas2d: false });
    expect(plan.mode).toBe('static');
    expect(plan.particles).toBe(0);
  });

  it('honours save-data with the static art, even when WebGL works', () => {
    expect(selectMode({ ...desktop, saveData: true })).toBe('static');
  });

  it('keeps rendering under reduced motion, as settled still frames', () => {
    const plan = planFlow({ ...desktop, reducedMotion: true });
    expect(plan.mode).toBe('webgl');
    expect(plan.still).toBe(true);
    expect(planFlow(desktop).still).toBe(false);
  });

  it('reduced motion without WebGL still picks the 2D canvas, still', () => {
    const plan = planFlow({ ...desktop, reducedMotion: true, webgl: false });
    expect(plan).toMatchObject({ mode: 'canvas2d', still: true });
  });
});

describe('device budget', () => {
  it('runs 24k particles on desktop and 10k on phones', () => {
    expect(planFlow(desktop).particles).toBe(24000);
    expect(planFlow({ ...desktop, viewportWidth: 390 }).particles).toBe(10000);
  });

  it('cuts the count on weak devices (4 cores or fewer, under 4 GB)', () => {
    expect(particleBudget('webgl', false, 4, undefined)).toBe(14400);
    expect(particleBudget('webgl', false, 6, 8)).toBe(24000);
    expect(particleBudget('webgl', true, undefined, 2)).toBe(6000);
  });

  it('treats software WebGL (SwiftShader, llvmpipe) as weak', () => {
    expect(isSoftwareRenderer('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)')).toBe(true);
    expect(isSoftwareRenderer('llvmpipe (LLVM 15.0.7, 256 bits)')).toBe(true);
    expect(isSoftwareRenderer('ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11)')).toBe(false);
    expect(planFlow({ ...desktop, softwareGL: true }).particles).toBe(8400);
  });

  it('downgrades WebGL → half → 2D canvas → static', () => {
    let step = { mode: 'webgl' as const, scale: 1 } as ReturnType<typeof nextDowngrade>;
    const seen = [];
    for (let k = 0; k < 4; k++) { step = nextDowngrade(step); seen.push(`${step.mode}:${step.scale}`); }
    expect(seen).toEqual(['webgl:0.5', 'canvas2d:0.5', 'static:0', 'static:0']);
    expect(planFlow(desktop, 0.5).particles).toBe(12000);
  });

  it('caps the pixel ratio at 2 on desktop and 1.5 on phones', () => {
    expect(planFlow({ ...desktop, devicePixelRatio: 3 }).dpr).toBe(2);
    expect(planFlow({ ...desktop, viewportWidth: 390, devicePixelRatio: 3 }).dpr).toBe(1.5);
    expect(planFlow({ ...desktop, devicePixelRatio: 1 }).dpr).toBe(1);
  });
});
