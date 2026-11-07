import { MotionConfig } from 'motion/react';
import ChatWidget from './ChatWidget';
import QuoteModal from './QuoteModal';

/**
 * The chat widget and quote modal, with the animation library they use. Split into their own
 * chunk and mounted after first paint, so neither weighs on the initial render.
 */
export default function Overlays() {
  return (
    <MotionConfig reducedMotion="user">
      <ChatWidget />
      <QuoteModal />
    </MotionConfig>
  );
}
