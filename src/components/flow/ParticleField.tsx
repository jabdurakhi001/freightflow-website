import { useEffect, useRef, useState } from 'react';
import type { BridgeMode } from './bridge';
import { isSoftwareRenderer, nextDowngrade, planFlow, readEnvironment, type DowngradeStep } from './capabilities';
import { useFlowBridge } from './FlowContext';
import type { FlowField } from './engine/field';

const MAP_URL = '/flow/us48.json';

/** Resolves after the load event and two animation frames: the first paint is on screen. */
function afterFirstPaint(): Promise<void> {
  const loaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }));
  return loaded.then(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
}

function rendererName(gl: WebGLRenderingContext): string | null {
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
  } catch {
    return null;
  }
}

/**
 * The fixed particle canvas behind the page.
 *
 * The engine is a separate chunk, loaded only after the first paint is on screen, so it never
 * competes with the content. It runs on WebGL, then a 2D canvas, then static art; if frames stay
 * slow at runtime it steps down that ladder (half the particles first). Each step gets a fresh
 * <canvas>, because a canvas that has held a WebGL context can't hand out a 2D one.
 */
export default function ParticleField() {
  const bridge = useFlowBridge();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<BridgeMode>('pending');
  const [step, setStep] = useState<DowngradeStep>({ mode: 'webgl', scale: 1 });
  const [particles, setParticles] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let field: FlowField | null = null;
    const env = readEnvironment();

    const settle = (m: BridgeMode) => {
      setMode(m);
      bridge.setMode(m);
    };

    // Save-data, or the ladder has run out: decide now, fetch nothing.
    if (env.saveData || step.mode === 'static') {
      settle('static');
      return;
    }

    // Fetch the engine chunk in parallel with the first paint; run nothing until it's painted.
    const engine = import('./engine/field');
    engine.catch(() => {});
    const boot = async () => {
      await afterFirstPaint();
      const canvas = canvasRef.current;
      if (cancelled || !canvas) return;
      let gl: WebGLRenderingContext | null = null;
      let c2d: CanvasRenderingContext2D | null = null;
      if (step.mode === 'webgl') {
        try {
          gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
        } catch { /* no WebGL */ }
      }
      if (!gl) {
        try { c2d = canvas.getContext('2d'); } catch { /* no canvas */ }
      }
      const softwareGL = gl ? isSoftwareRenderer(rendererName(gl)) : false;
      const plan = planFlow({ ...env, webgl: !!gl, canvas2d: !!c2d, softwareGL }, step.scale);
      if (plan.mode === 'static' || plan.particles < 500) return settle('static');
      try {
        const { createFlowField } = await engine;
        if (cancelled) return;
        field = createFlowField({
          canvas, plan, gl, c2d, bridge, mapUrl: MAP_URL,
          onSlow: () => { if (!cancelled) setStep(nextDowngrade({ mode: plan.mode, scale: step.scale })); },
        });
        bridge.attach(field);
        setParticles(plan.particles);
        settle(plan.mode);
      } catch {
        if (!cancelled) settle('static');
      }
    };
    void boot();

    return () => {
      cancelled = true;
      field?.destroy();
      bridge.detach();
    };
  }, [bridge, step]);

  return (
    <>
      <canvas
        key={`${step.mode}-${step.scale}`}
        ref={canvasRef}
        className="flow-canvas"
        aria-hidden="true"
        hidden={mode === 'static'}
        data-mode={mode}
        data-scale={step.scale}
        data-particles={particles || undefined}
      />
      {mode === 'static' && <div className="fallback-art" aria-hidden="true" />}
    </>
  );
}
