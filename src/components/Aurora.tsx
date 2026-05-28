interface AuroraProps {
  /** Tailwind/inline className for positioning overrides on the wrapper. */
  className?: string;
}

/**
 * Decorative animated gradient blobs for dark sections. Purely cosmetic and
 * pointer-transparent. The CSS `aurora-drift` animation is disabled under
 * prefers-reduced-motion.
 */
export default function Aurora({ className }: AuroraProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ''}`} aria-hidden="true">
      <div className="aurora aurora-drift -top-32 -left-24 w-[28rem] h-[28rem] bg-secondary/40" />
      <div className="aurora aurora-drift top-1/3 -right-24 w-[24rem] h-[24rem] bg-tertiary/30" style={{ animationDelay: '-6s' }} />
      <div className="aurora aurora-drift -bottom-32 left-1/3 w-[26rem] h-[26rem] bg-secondary/20" style={{ animationDelay: '-12s' }} />
    </div>
  );
}
