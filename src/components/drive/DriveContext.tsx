import { createContext, useContext, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { DriveBridge, type BridgeMode } from './bridge';

const Ctx = createContext<DriveBridge | null>(null);

export function DriveProvider({ children }: { children: ReactNode }) {
  const ref = useRef<DriveBridge>(null);
  if (!ref.current) ref.current = new DriveBridge();
  return <Ctx.Provider value={ref.current}>{children}</Ctx.Provider>;
}

export function useDrive(): DriveBridge {
  const b = useContext(Ctx);
  if (!b) throw new Error('useDrive outside DriveProvider');
  return b;
}

/** 'pending' until the engine has decided; then how the scene runs on this device. */
export function useDriveMode(): BridgeMode {
  const b = useDrive();
  return useSyncExternalStore(b.onMode, () => b.mode, () => 'pending' as BridgeMode);
}

/** Reduced motion: the scene cuts between chapters and nothing is pinned or scrubbed. */
export function useDriveStill(): boolean {
  const b = useDrive();
  return useSyncExternalStore(b.onMode, () => b.still, () => false);
}

export function useLane(): { from: string; to: string | null } {
  const b = useDrive();
  return useSyncExternalStore(b.onLane, () => b.lane, () => b.lane);
}
