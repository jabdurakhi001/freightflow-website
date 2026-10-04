import type { ReactNode } from 'react';
import { motion, type Variants } from 'motion/react';
import { EASE_BRAND, EASE_OUT_EXPO } from '../lib/motion';

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

// Rule draws across first, then the label, title and subtitle rise in sequence.
const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const rule: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.9, ease: EASE_OUT_EXPO } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_BRAND } },
};

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
  const centered = align === 'center';

  // MotionConfig (App.tsx) honours prefers-reduced-motion: transforms snap to
  // their end state, so only the short opacity fades remain.
  return (
    <motion.div
      className={`${centered ? 'text-center' : ''} ${className ?? ''}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
    >
      {(index || eyebrow || meta) && (
        <div
          className={`relative flex items-baseline gap-4 pb-6 pt-4 ${centered ? 'justify-center' : 'justify-between'}`}
        >
          <motion.span
            variants={rule}
            aria-hidden="true"
            className={`absolute inset-x-0 top-0 h-px ${centered ? 'origin-center' : 'origin-left'} ${
              light ? 'bg-white/15' : 'bg-outline-variant/60'
            }`}
          />
          <motion.span variants={item} className={`flex items-baseline gap-4 ${centered ? 'justify-center' : ''}`}>
            {index && <span className="section-index">{index}</span>}
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          </motion.span>
          {meta && !centered && (
            <motion.span
              variants={item}
              className={`mono-label hidden md:block ${light ? 'text-white/35' : 'text-on-surface-variant/70'}`}
            >
              {meta}
            </motion.span>
          )}
        </div>
      )}
      <motion.h2
        variants={item}
        className={`text-4xl md:text-[3.4rem] font-black tracking-tight leading-[1.02] ${
          light ? 'text-white' : 'text-primary dark:text-white'
        } ${centered ? 'mx-auto max-w-3xl' : 'max-w-3xl'}`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={item}
          className={`mt-5 text-lg leading-relaxed max-w-2xl ${centered ? 'mx-auto' : ''} ${
            light ? 'text-white/70' : 'text-on-surface-variant'
          }`}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
