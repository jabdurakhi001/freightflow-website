import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { rise, stagger } from '../../lib/motion';

interface SectionTitleProps {
  /** Short sign-legend label above the title, e.g. "Services". */
  kicker: string;
  /** Mile marker shown beside the kicker, e.g. "MM 02". */
  marker?: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Light text for dark (asphalt / sign) backgrounds. */
  onDark?: boolean;
  align?: 'left' | 'center';
  className?: string;
}

/** Section heading: mile-marker legend, large Overpass title, optional lede. */
export default function SectionTitle({ kicker, marker, title, lede, onDark, align = 'left', className }: SectionTitleProps) {
  const centered = align === 'center';
  return (
    <motion.header
      className={`${centered ? 'mx-auto text-center' : ''} max-w-3xl ${className ?? ''}`}
      variants={stagger(0.08)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      <motion.p
        variants={rise}
        className={`legend flex items-center gap-3 ${centered ? 'justify-center' : ''} ${onDark ? 'text-white/70' : 'text-on-surface-variant'}`}
      >
        {marker && (
          <span className="rounded-[5px] bg-sign px-1.5 py-0.5 text-[0.65rem] tracking-[0.12em] text-white shadow-[inset_0_0_0_1.5px_#fff]">
            {marker}
          </span>
        )}
        {kicker}
      </motion.p>
      <motion.h2
        variants={rise}
        className={`mt-4 text-[clamp(2.1rem,4.6vw,3.6rem)] font-black leading-[1.02] tracking-[-0.025em] ${
          onDark ? 'text-white' : 'text-on-surface'
        }`}
      >
        {title}
      </motion.h2>
      {lede && (
        <motion.p
          variants={rise}
          className={`mt-5 text-lg leading-relaxed ${centered ? 'mx-auto' : ''} max-w-2xl ${onDark ? 'text-white/75' : 'text-on-surface-variant'}`}
        >
          {lede}
        </motion.p>
      )}
    </motion.header>
  );
}
