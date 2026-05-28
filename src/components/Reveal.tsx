import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Direction the element slides in from. Defaults to "up". */
  direction?: Direction;
  /** Delay in seconds before the animation starts. */
  delay?: number;
  /** Distance in pixels the element travels. Defaults to 24. */
  distance?: number;
}

const OFFSETS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
  none: { x: 0, y: 0 },
};

/**
 * Fades + slides its children into view the first time they enter the viewport.
 * Honors the user's "reduce motion" preference by rendering instantly.
 */
export default function Reveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  distance = 24,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const offset = OFFSETS[direction];

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: offset.x * distance, y: offset.y * distance }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}
