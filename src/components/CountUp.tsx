import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';

interface CountUpProps {
  /** The final value to count up to. */
  value: number;
  /** Number of decimal places to display. Defaults to 0. */
  decimals?: number;
  /** Text rendered before the number (e.g. "$"). */
  prefix?: string;
  /** Text rendered after the number (e.g. "%", " States"). */
  suffix?: string;
  /** Animation duration in milliseconds. Defaults to 1600. */
  duration?: number;
  className?: string;
}

// Ease-out cubic — fast start, gentle landing.
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Animates a number from 0 up to `value` the first time it scrolls into view.
 * Renders the final value immediately when reduced motion is preferred.
 */
export default function CountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1600,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!inView || reduceMotion) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(value * easeOut(progress));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
