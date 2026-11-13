import { DEFAULT_DESTINATION, HUB } from '../../lib/lanes';
import type { DriveHandle } from '../../drive/engine';
import type { DriveMode } from './capabilities';

export type BridgeMode = DriveMode | 'pending';

/**
 * A small, framework-free hand-off between React and the lazily loaded 3D engine. Chapters
 * talk to it from their first render; the engine attaches once it has loaded (after first
 * paint) and gets everything set so far replayed.
 */
export class DriveBridge {
  private engine: DriveHandle | null = null;
  private labels = new Map<string, HTMLElement>();
  private modeListeners = new Set<() => void>();
  private laneListeners = new Set<() => void>();
  lane: { from: string; to: string | null } = { from: HUB, to: DEFAULT_DESTINATION };
  paused = false;
  mode: BridgeMode = 'pending';
  still = false;

  setLane(from: string, to: string | null) {
    this.lane = { from, to };
    this.engine?.setLane(from, to);
    this.laneListeners.forEach((cb) => cb());
  }
  setPaused(paused: boolean) { this.paused = paused; this.engine?.setPaused(paused); }
  setLabel(name: string, el: HTMLElement | null) {
    if (el) this.labels.set(name, el); else this.labels.delete(name);
    this.engine?.setLabel(name, el);
  }
  flash() { this.engine?.flash(); }
  orbit(delta: number) { this.engine?.orbit(delta); }

  attach(engine: DriveHandle) {
    this.engine = engine;
    engine.setLane(this.lane.from, this.lane.to);
    if (this.paused) engine.setPaused(true);
    this.labels.forEach((el, name) => engine.setLabel(name, el));
  }
  detach() { this.engine = null; }

  setMode(mode: BridgeMode, still: boolean) {
    this.mode = mode; this.still = still;
    this.modeListeners.forEach((cb) => cb());
  }
  onMode = (cb: () => void) => { this.modeListeners.add(cb); return () => { this.modeListeners.delete(cb); }; };
  onLane = (cb: () => void) => { this.laneListeners.add(cb); return () => { this.laneListeners.delete(cb); }; };
}
