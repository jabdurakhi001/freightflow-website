/**
 * Shared motion tokens so every animation on the site reads as one system.
 * Mirrors `--ease-brand` in index.css.
 */
export const EASE_BRAND = [0.21, 0.47, 0.32, 0.98] as const;

/** Sharper ease-out for masked text and image reveals — fast start, long settle. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Hover / press feedback for pill buttons and CTAs. */
export const HOVER_LIFT = { scale: 1.02 } as const;
export const TAP_PRESS = { scale: 0.97 } as const;
