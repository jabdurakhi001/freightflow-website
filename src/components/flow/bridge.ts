import { DEFAULT_DESTINATION, HUB } from '../../lib/lanes';
import type { FlowMode } from './capabilities';

/**
 * A small, framework-free hand-off between React and the lazily loaded particle engine.
 * Sections register their stage elements here as they mount; the engine attaches once it
 * has loaded (after first paint) and replays everything registered so far.
 */

/** Sections that re-form the particles. Sections without a formation simply aren't registered. */
export type FlowKind = 'hero' | 'how' | 'platform' | 'compliance' | 'fleet' | 'drivers' | 'cta';

export interface FlowRegistration {
  kind: FlowKind;
  /** The section whose visibility (crossing the viewport's middle line) activates the formation. */
  section: HTMLElement;
  /** The box the formation draws into. */
  stage: HTMLElement;
}

/** Lane endpoints in the 975×610 map box (already nudged onto land by the engine). */
export interface LaneGeometry {
  p1: [number, number];
  p2: [number, number] | null;
}

export interface FlowEngineHandle {
  add(reg: FlowRegistration): void;
  remove(reg: FlowRegistration): void;
  setLane(from: string, to: string | null): void;
  /** Stop animating while something (a modal) covers the page. */
  setPaused(paused: boolean): void;
}

export type BridgeMode = FlowMode | 'pending';

export class FlowBridge {
  private regs = new Set<FlowRegistration>();
  private engine: FlowEngineHandle | null = null;
  private geometry: LaneGeometry | null = null;
  private geometryListeners = new Set<(g: LaneGeometry | null) => void>();
  private modeListeners = new Set<(m: BridgeMode) => void>();
  lane: { from: string; to: string | null } = { from: HUB, to: DEFAULT_DESTINATION };
  paused = false;
  mode: BridgeMode = 'pending';

  register(reg: FlowRegistration): () => void {
    this.regs.add(reg);
    this.engine?.add(reg);
    return () => {
      this.regs.delete(reg);
      this.engine?.remove(reg);
    };
  }

  setLane(from: string, to: string | null) {
    this.lane = { from, to };
    this.engine?.setLane(from, to);
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    this.engine?.setPaused(paused);
  }

  attach(engine: FlowEngineHandle) {
    this.engine = engine;
    engine.setLane(this.lane.from, this.lane.to);
    if (this.paused) engine.setPaused(true);
    this.regs.forEach((r) => engine.add(r));
  }

  detach() {
    this.engine = null;
    this.emitGeometry(null);
  }

  setMode(mode: BridgeMode) {
    this.mode = mode;
    this.modeListeners.forEach((cb) => cb(mode));
  }

  onMode(cb: (m: BridgeMode) => void): () => void {
    this.modeListeners.add(cb);
    return () => this.modeListeners.delete(cb);
  }

  emitGeometry(g: LaneGeometry | null) {
    this.geometry = g;
    this.geometryListeners.forEach((cb) => cb(g));
  }

  onGeometry(cb: (g: LaneGeometry | null) => void): () => void {
    this.geometryListeners.add(cb);
    cb(this.geometry);
    return () => this.geometryListeners.delete(cb);
  }
}
