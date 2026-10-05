import type { ReactNode, SVGProps } from 'react';

/*
 * Signage primitives. Shapes are original (not the AASHTO Interstate
 * shield); colours and proportions follow MUTCD guide/regulatory practice.
 */

/** FreightFlow route shield — the logo mark. */
export function ShieldMark({ className, label = 'FF' }: { className?: string; label?: string }) {
  return (
    <svg viewBox="0 0 100 112" className={className} aria-hidden="true">
      <path d="M6 16 Q50 0 94 16 L94 54 Q94 92 50 110 Q6 92 6 54 Z" fill="var(--color-sign)" />
      <path
        d="M12 20 Q50 7 88 20 L88 54 Q88 87 50 103 Q12 87 12 54 Z"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
      />
      <rect x="12" y="30" width="76" height="6" fill="#fff" />
      <text
        x="50"
        y="78"
        textAnchor="middle"
        fontFamily="Overpass, sans-serif"
        fontWeight="800"
        fontSize="36"
        fill="#fff"
        letterSpacing="-1"
      >
        {label}
      </text>
    </svg>
  );
}

/** Route shield carrying a number or short word, e.g. 48. */
export function RouteShield({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={`relative inline-grid place-items-center ${className ?? ''}`}>
      <svg viewBox="0 0 100 112" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M6 16 Q50 0 94 16 L94 54 Q94 92 50 110 Q6 92 6 54 Z" fill="#fff" />
        <path d="M12 20 Q50 7 88 20 L88 54 Q88 87 50 103 Q12 87 12 54 Z" fill="var(--color-sign-deep)" />
      </svg>
      <span className="relative -mt-1 font-black tracking-tight text-white">{children}</span>
    </span>
  );
}

type ArrowDir = 'up' | 'up-right' | 'right' | 'down' | 'left';
const ROTATE: Record<ArrowDir, number> = { up: 0, 'up-right': 45, right: 90, down: 180, left: -90 };

/** Guide-sign arrow: thick shaft, wide triangular head (sign style, not UI chevron). */
export function SignArrow({ dir = 'up', className, ...rest }: { dir?: ArrowDir } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 48" className={className} aria-hidden="true" {...rest}>
      <g transform={`rotate(${ROTATE[dir]} 20 24)`}>
        <path d="M20 2 L38 22 L26 22 L26 46 L14 46 L14 22 L2 22 Z" fill="currentColor" />
      </g>
    </svg>
  );
}

/** Small "EXIT n" tab that sits on the top edge of a guide sign. */
export function ExitTab({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`legend inline-flex items-center rounded-t-lg bg-sign px-3 pb-1 pt-1.5 text-[0.7rem] text-white shadow-[inset_0_0_0_2px_#fff] ${className ?? ''}`}
    >
      {children}
    </span>
  );
}

/** Yellow warning diamond (truck-crossing style). */
export function WarningDiamond({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={`relative inline-grid place-items-center ${className ?? ''}`}>
      <span className="absolute inset-[14.6%] rotate-45 rounded-[10%] bg-caution shadow-[inset_0_0_0_4px_var(--color-caution),inset_0_0_0_7px_#0f1512,0_20px_40px_-20px_rgba(0,0,0,0.5)]" />
      <span className="relative text-[#0f1512]">{children}</span>
    </span>
  );
}
