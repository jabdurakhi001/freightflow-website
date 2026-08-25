import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'left' | 'center';
  /** Manifest index, e.g. "01" — renders mono beside the eyebrow with a hairline rule above. */
  index?: string;
  /** Right-aligned mono meta line (desktop only), e.g. "48 STATES · 2 HUBS". */
  meta?: string;
  /** Render light-on-dark variant for use over the primary/navy background. */
  light?: boolean;
  className?: string;
}

/**
 * Editorial section header in the "dispatch manifest" voice: a hairline rule,
 * mono index + eyebrow (with optional right-side meta), then a large expanded
 * display title and optional subtitle — revealed together on scroll.
 */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  index,
  meta,
  light = false,
  className,
}: SectionHeadingProps) {
  const reduceMotion = useReducedMotion();
  const centered = align === 'center';

  return (
    <motion.div
      className={`${centered ? 'text-center' : ''} ${className ?? ''}`}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {(index || eyebrow || meta) && (
        <div
          className={`flex items-baseline gap-4 border-t pb-6 pt-4 ${
            light ? 'border-white/15' : 'border-outline-variant/60'
          } ${centered ? 'justify-center' : 'justify-between'}`}
        >
          <span className={`flex items-baseline gap-4 ${centered ? 'justify-center' : ''}`}>
            {index && <span className="section-index">{index}</span>}
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          </span>
          {meta && !centered && (
            <span className={`mono-label hidden md:block ${light ? 'text-white/35' : 'text-on-surface-variant/70'}`}>
              {meta}
            </span>
          )}
        </div>
      )}
      <h2
        className={`text-4xl md:text-[3.4rem] font-black tracking-tight leading-[1.02] ${
          light ? 'text-white' : 'text-primary dark:text-white'
        } ${centered ? 'mx-auto max-w-3xl' : 'max-w-3xl'}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 text-lg leading-relaxed max-w-2xl ${centered ? 'mx-auto' : ''} ${
            light ? 'text-white/70' : 'text-on-surface-variant'
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
