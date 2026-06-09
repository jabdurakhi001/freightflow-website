import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  label: string;
  children: ReactNode;
}

/**
 * Shared modal chrome: backdrop, escape-to-close, body scroll lock, and the
 * enter/exit animation. Content (header, form, close button) is supplied by
 * the caller.
 */
export default function ModalShell({ open, onClose, label, children }: ModalShellProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
          aria-modal="true"
          role="dialog"
          aria-label={label}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-primary/80 backdrop-blur-sm cursor-default"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-primary-container to-primary border border-white/10 shadow-2xl grain"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
