import { describe, expect, it } from 'vitest';
import { isSoftwareRenderer, nextDowngrade, parseOverride, planDrive, type DriveEnvironment } from './capabilities';

const desktop: DriveEnvironment = { reducedMotion: false, saveData: false, webgl: true, viewportWidth: 1440, cores: 8, memory: 8 };

describe('planDrive', () => {
  it('runs the full scene on a capable desktop', () => {
    expect(planDrive(desktop)).toEqual({ mode: 'high', still: false });
  });
  it('falls back to the painted backdrop without WebGL or with save-data', () => {
    expect(planDrive({ ...desktop, webgl: false }).mode).toBe('static');
    expect(planDrive({ ...desktop, saveData: true }).mode).toBe('static');
  });
  it('keeps the scene but stops it moving under reduced motion', () => {
    expect(planDrive({ ...desktop, reducedMotion: true })).toEqual({ mode: 'high', still: true });
  });
  it('drops post-processing on software GL and on weak phones', () => {
    expect(planDrive({ ...desktop, softwareGL: true }).mode).toBe('low');
    expect(planDrive({ ...desktop, viewportWidth: 390, cores: 4 }).mode).toBe('low');
    expect(planDrive({ ...desktop, viewportWidth: 390, cores: 8, memory: 8 }).mode).toBe('high');
    expect(planDrive({ ...desktop, cores: 4 }).mode).toBe('high');
  });
});

describe('ladder and helpers', () => {
  it('steps high → low → static and stays there', () => {
    expect(nextDowngrade('high')).toBe('low');
    expect(nextDowngrade('low')).toBe('static');
    expect(nextDowngrade('static')).toBe('static');
  });
  it('spots CPU rasterisers', () => {
    expect(isSoftwareRenderer('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device))')).toBe(true);
    expect(isSoftwareRenderer('llvmpipe (LLVM 15.0.7, 256 bits)')).toBe(true);
    expect(isSoftwareRenderer('ANGLE (Apple, Apple M2, OpenGL 4.1)')).toBe(false);
    expect(isSoftwareRenderer(null)).toBe(false);
  });
  it('reads the testing override', () => {
    expect(parseOverride('?drive=low')).toBe('low');
    expect(parseOverride('?drive=fast')).toBeNull();
    expect(parseOverride('')).toBeNull();
  });
});
