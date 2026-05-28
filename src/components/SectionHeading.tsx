import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'left' | 'center';
  /** Render light-on-dark variant for use over the primary/navy background. */
  light?: boolean;
  className?: string;
}

/**
 * Consistent section header: a small accented eyebrow label, a large display
 * title, and an optional subtitle — revealed together on scroll.
 */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  light = false,
  className,
}: SectionHeadingProps) {
  const reduceMotion = useReducedMotion();
  const alignment = align === 'center' ? 'text-center items-center mx-auto' : 'text-left items-start';

  return (
    <motion.div
      className={`flex flex-col ${alignment} max-w-2xl ${align === 'center' ? 'mx-auto' : ''} ${className ?? ''}`}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {eyebrow && <span className="eyebrow mb-4">{eyebrow}</span>}
      <h2
        className={`text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] ${
          light ? 'text-white' : 'text-primary dark:text-white'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-5 text-lg leading-relaxed ${light ? 'text-white/70' : 'text-on-surface-variant'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
