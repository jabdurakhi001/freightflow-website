import { motion, useScroll, useSpring } from 'motion/react';

/**
 * A thin bar pinned to the top of the page that fills horizontally as the
 * user scrolls through the document.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[55] h-1 origin-left bg-secondary"
      aria-hidden="true"
    />
  );
}
