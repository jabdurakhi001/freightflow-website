import { useEffect, useRef, useState } from 'react';
import { FLEET_SPECS } from '../../content';
import { shortName } from '../../lib/lanes';
import { isSoftwareRenderer, nextDowngrade, parseOverride, planDrive, readEnvironment, type DriveMode } from './capabilities';
import type { BridgeMode } from './bridge';
import { useDrive, useLane } from './DriveContext';
import type { DriveHandle } from '../../drive/engine';

const MAP_URL = '/flow/us48.json';

/** Resolves after the load event and two animation frames: the first paint is on screen. */
function afterFirstPaint(): Promise<void> {
  const loaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }));
  return loaded.then(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
}

/** Ask a throwaway canvas whether WebGL exists and whether it's a CPU rasteriser. */
function probeWebGL(): { webgl: boolean; softwareGL: boolean } {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return { webgl: false, softwareGL: false };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return { webgl: true, softwareGL: isSoftwareRenderer(name) };
  } catch {
    return { webgl: false, softwareGL: false };
  }
}

const spec = (k: string) => FLEET_SPECS.find((s) => s.k === k)?.v ?? '';

/**
 * The fixed 3D scene behind the page, plus the labels it pins to things in the scene.
 *
 * The engine (three.js and the scene) is a separate chunk loaded only after the first paint is
 * on screen, so it never competes with the content. If frames stay slow it steps down:
 * full scene → no post-processing → a painted backdrop. Each step gets a fresh <canvas>.
 */
export default function DriveCanvas() {
  const bridge = useDrive();
  const lane = useLane();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<BridgeMode>('pending');
  const [cap, setCap] = useState<DriveMode>('high');
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let engine: DriveHandle | null = null;
    const env = readEnvironment();
    const override = parseOverride(window.location.search);
    const settle = (m: DriveMode, still: boolean) => { setMode(m); bridge.setMode(m, still); };

    if ((env.saveData && !override) || cap === 'static' || override === 'static') {
      settle('static', env.reducedMotion);
      return;
    }
    const chunk = import('../../drive/engine');
    chunk.catch(() => {});
    const boot = async () => {
      await afterFirstPaint();
      const canvas = canvasRef.current;
      if (cancelled || !canvas) return;
      const plan = planDrive({ ...env, ...probeWebGL() });
      // never run richer than the ladder has stepped down to
      const m: DriveMode = override ?? (plan.mode === 'static' ? 'static' : cap === 'low' ? 'low' : plan.mode);
      if (m === 'static') return settle('static', plan.still);
      try {
        const { createDrive } = await chunk;
        if (cancelled) return;
        engine = createDrive({
          canvas, quality: m, still: plan.still, mapUrl: MAP_URL,
          onSlow: override ? undefined : () => { if (!cancelled) setCap(nextDowngrade(m)); },
          onReady: () => { if (!cancelled) setLive(true); },
        });
        bridge.attach(engine);
        settle(m, plan.still);
      } catch {
        if (!cancelled) settle('static', plan.still);
      }
    };
    void boot();
    return () => {
      cancelled = true;
      setLive(false);
      engine?.destroy();
      bridge.detach();
    };
  }, [bridge, cap]);

  const pin = (name: string) => (el: HTMLElement | null) => bridge.setLabel(name, el);
  return (
    <>
      <div className={`backdrop${mode === 'static' ? ' is-art' : ''}`} aria-hidden="true" />
      <canvas key={cap} ref={canvasRef} className={`drive-canvas${live ? ' is-live' : ''}`} aria-hidden="true" hidden={mode === 'static'} data-mode={mode} />
      {mode !== 'static' && (
        <div className="pins" aria-hidden="true">
          <span className="pin pin-city" ref={pin('lane-from')}><i /><b>{shortName(lane.from)}</b></span>
          <span className="pin pin-city to" ref={pin('lane-to')}><i /><b>{lane.to ? shortName(lane.to) : ''}</b></span>
          <span className="pin pin-city" ref={pin('hub')}><i /><b>Chicago hub</b></span>
          <span className="pin pin-spec" ref={pin('fleet-tractor')}><i /><b><small>Tractor</small>{spec('Tractor')}</b></span>
          <span className="pin pin-spec up" ref={pin('fleet-trailer')}><i /><b><small>Trailer</small>{spec('Trailer')}</b></span>
          <span className="pin pin-spec up" ref={pin('fleet-sleeper')}><i /><b><small>Telematics</small>{spec('Telematics')}</b></span>
        </div>
      )}
    </>
  );
}
