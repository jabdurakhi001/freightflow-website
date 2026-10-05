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

function Bolt({ style }: { style: CSSProperties }) {
  return (
    <span
      style={{
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #ffffff 0 18%, #c9cfcb 35%, #7d857f 75%, #5b625d 100%)',
        boxShadow: '0 1px 1px rgba(0,0,0,0.5)',
        ...style,
      }}
    />
  );
}

/**
 * Physical guide sign: extruded aluminium rim, green reflective sheeting with
 * a soft sheen, inset white border and four mounting bolts.
 */
export function Panel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'relative',
        background: `linear-gradient(155deg, #0c7b4d 0%, ${C.sign} 42%, #00552f 100%)`,
        color: C.white,
        borderRadius: 18,
        boxShadow: [
          `inset 0 0 0 7px ${C.sign}`,
          `inset 0 0 0 11px ${C.white}`,
          `0 0 0 3px #b8bfba`,
          `0 0 0 4px #6f7772`,
          `0 30px 60px -20px rgba(0,0,0,0.7)`,
        ].join(','),
        fontFamily: SANS,
        ...style,
      }}
    >
      {/* Reflective sheeting sheen */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: 'linear-gradient(115deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.06) 100%)',
          pointerEvents: 'none',
        }}
      />
      <Bolt style={{ top: 22, left: 22 }} />
      <Bolt style={{ top: 22, right: 22 }} />
      <Bolt style={{ bottom: 22, left: 22 }} />
      <Bolt style={{ bottom: 22, right: 22 }} />
      <div style={{ position: 'relative' }}>{children}</div>
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
