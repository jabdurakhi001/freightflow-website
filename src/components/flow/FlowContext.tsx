import { createContext, useContext, useEffect, useState, type ReactNode, type RefObject } from 'react';
import { FlowBridge, type BridgeMode, type FlowKind, type LaneGeometry } from './bridge';

const FlowContext = createContext<FlowBridge | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [bridge] = useState(() => new FlowBridge());
  return <FlowContext.Provider value={bridge}>{children}</FlowContext.Provider>;
}

export function useFlowBridge(): FlowBridge {
  const b = useContext(FlowContext);
  if (!b) throw new Error('useFlowBridge must be used within FlowProvider');
  return b;
}

/** Registers a section and its stage so the particles re-form there while it is centred. */
export function useFlowSection(kind: FlowKind, section: RefObject<HTMLElement | null>, stage: RefObject<HTMLElement | null>) {
  const bridge = useFlowBridge();
  useEffect(() => {
    if (!section.current || !stage.current) return;
    return bridge.register({ kind, section: section.current, stage: stage.current });
  }, [bridge, kind, section, stage]);
}

/** 'pending' until the field has decided how it runs on this device. */
export function useFlowMode(): BridgeMode {
  const bridge = useFlowBridge();
  const [mode, setMode] = useState<BridgeMode>(bridge.mode);
  useEffect(() => {
    // The field may have decided before this subscriber's effect ran (child effects run first).
    setMode(bridge.mode);
    return bridge.onMode(setMode);
  }, [bridge]);
  return mode;
}

export function useLaneGeometry(): LaneGeometry | null {
  const bridge = useFlowBridge();
  const [g, setG] = useState<LaneGeometry | null>(null);
  useEffect(() => bridge.onGeometry(setG), [bridge]);
  return g;
}
