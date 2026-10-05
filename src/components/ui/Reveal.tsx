import type { ReactNode } from 'react';
import { motion, type Variants } from 'motion/react';
import { rise, swingIn } from '../../lib/motion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** "swing" hinges the element in like a sign panel; "rise" fades it up. */
  kind?: 'rise' | 'swing';
  delay?: number;
  as?: 'div' | 'li' | 'section' | 'article';
}

/** Animates its children in the first time they scroll into view. */
export default function Reveal({ children, className, kind = 'rise', delay = 0, as = 'div' }: RevealProps) {
  const base = kind === 'swing' ? swingIn : rise;
  const variants: Variants = {
    hidden: base.hidden,
    visible: {
      ...(base.visible as object),
      transition: { ...((base.visible as { transition?: object }).transition ?? {}), delay },
    },
  };
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      style={kind === 'swing' ? { transformPerspective: 900, transformOrigin: 'top center' } : undefined}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      {children}
    </Tag>
  );
}
