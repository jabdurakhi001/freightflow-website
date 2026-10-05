import type { Transition, Variants } from 'motion/react';

/**
 * Shared motion tokens so every animation on the site reads as one system.
 * EASE_BRAND mirrors `--ease-brand` in index.css.
 */
export const EASE_BRAND = [0.22, 0.61, 0.36, 1] as const;

/** Long-settle ease-out for masked text, wipes and the hero sign. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Hover / press feedback for buttons. */
export const HOVER_LIFT = { y: -2 } as const;
export const TAP_PRESS = { scale: 0.97 } as const;

/** Springy settle used when a sign "lands" on its mount. */
export const SIGN_SPRING: Transition = { type: 'spring', stiffness: 140, damping: 16, mass: 0.9 };

/**
 * Signs swing into view on their top hinge, the way a panel settles on a
 * gantry. Under reduced motion MotionConfig drops the transform and keeps the fade.
 */
export const swingIn: Variants = {
  hidden: { opacity: 0, rotateX: -24, y: -14 },
  visible: { opacity: 1, rotateX: 0, y: 0, transition: SIGN_SPRING },
};

/** Plain rise for text blocks. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_BRAND } },
};

/** Parent that staggers its children. */
export const stagger = (each = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: each, delayChildren: delay } },
});
