import type { CSSProperties, ReactNode } from 'react';
import { C } from './palette';
import { MONO, SANS } from './fonts';

/** Sign-style arrow (thick shaft, wide head). */
export function Arrow({ rotate = 0, size = 64, color = C.white }: { rotate?: number; size?: number; color?: string }) {
  return (
    <svg width={size * 0.83} height={size} viewBox="0 0 40 48" style={{ display: 'block' }}>
      <g transform={`rotate(${rotate} 20 24)`}>
        <path d="M20 2 L38 22 L26 22 L26 46 L14 46 L14 22 L2 22 Z" fill={color} />
      </g>
    </svg>
  );
}

/** Green guide-sign panel with the inset white border. */
export function Panel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: C.sign,
        color: C.white,
        borderRadius: 18,
        boxShadow: `inset 0 0 0 7px ${C.sign}, inset 0 0 0 11px ${C.white}`,
        fontFamily: SANS,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Legend({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span style={{ fontFamily: MONO, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', ...style }}>
      {children}
    </span>
  );
}
