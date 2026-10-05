import { useId, type ReactNode, type SVGProps } from 'react';

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
  const sheen = `shield-sheen-${useId()}`;
  return (
    <span className={`relative inline-grid place-items-center ${className ?? ''}`}>
      <svg viewBox="0 0 100 112" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.14" />
          </linearGradient>
        </defs>
        <path d="M6 16 Q50 0 94 16 L94 54 Q94 92 50 110 Q6 92 6 54 Z" fill="#fff" stroke="#8a928c" strokeWidth="1.5" />
        <path d="M12 20 Q50 7 88 20 L88 54 Q88 87 50 103 Q12 87 12 54 Z" fill="var(--color-sign-deep)" />
        <path d="M6 16 Q50 0 94 16 L94 54 Q94 92 50 110 Q6 92 6 54 Z" fill={`url(#${sheen})`} />
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
      className={`sheen legend inline-flex items-center rounded-t-lg bg-sign px-3 pb-1 pt-1.5 text-[0.7rem] text-white shadow-[inset_0_0_0_2px_#fff,0_0_0_1px_rgba(120,128,123,0.8)] ${className ?? ''}`}
    >
      {children}
    </span>
  );
}

/** Yellow warning diamond (truck-crossing style), bolted top and bottom. */
export function WarningDiamond({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={`relative inline-grid place-items-center ${className ?? ''}`}>
      <span className="sheen absolute inset-[14.6%] rotate-45 rounded-[10%] bg-caution shadow-[inset_0_0_0_4px_var(--color-caution),inset_0_0_0_7px_#0f1512,0_0_0_1px_rgba(255,255,255,0.3),0_0_0_2px_rgba(120,128,123,0.75),0_20px_40px_-20px_rgba(0,0,0,0.5)]">
        {/* Bolts sit on the square's top-left and bottom-right corners: top and bottom once rotated */}
        <span className="bolt absolute left-[9%] top-[9%]" />
        <span className="bolt absolute bottom-[9%] right-[9%]" />
      </span>
      <span className="relative text-[#0f1512]">{children}</span>
    </span>
  );
}
