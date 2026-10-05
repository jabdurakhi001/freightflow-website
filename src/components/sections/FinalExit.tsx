import { motion } from 'motion/react';
import { useQuoteModal } from '../../QuoteContext';
import { COMPANY, openChat } from '../../content';
import { rise, SIGN_SPRING, stagger } from '../../lib/motion';
import { SignArrow } from '../ui/Signs';

/** Closing call to action: a full-width guide sign on two posts. */
export default function FinalExit() {
  const { openQuote } = useQuoteModal();
  return (
    <section aria-labelledby="final-exit-title" className="relative isolate overflow-hidden bg-surface pb-0 pt-24 sm:pt-28">
      {/* Roadside backdrop: the photo fades into the ground the posts stand on */}
      <img
        src="/photos/final.jpg"
        alt=""
        aria-hidden="true"
        width={1600}
        height={900}
        loading="lazy"
        decoding="async"
        className="absolute inset-x-0 top-0 -z-10 h-[78%] w-full object-cover object-[55%_35%]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[78%] bg-[linear-gradient(180deg,var(--color-surface)_0%,color-mix(in_oklab,var(--color-surface)_20%,transparent)_22%,color-mix(in_oklab,var(--color-surface)_10%,transparent)_55%,var(--color-surface)_100%)]" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <motion.div
          className="relative pt-[30px]"
          style={{ transformPerspective: 1200, transformOrigin: 'top center' }}
          initial={{ opacity: 0, rotateX: -22, y: -24 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={SIGN_SPRING}
        >
          <span className="sheen legend absolute left-8 top-0 rounded-t-lg bg-sign px-4 pb-1.5 pt-2 text-sm text-white shadow-[inset_0_0_0_2px_#fff,0_0_0_1px_rgba(120,128,123,0.8)]">
            Next exit
          </span>
          <motion.div
            className="guide-sign grid items-center gap-10 px-7 py-10 sm:px-12 sm:py-14 md:grid-cols-[1fr_auto]"
            variants={stagger(0.08, 0.25)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
          >
            <div>
              <motion.h2
                id="final-exit-title"
                variants={rise}
                className="text-[clamp(2.8rem,7vw,5.6rem)] font-black leading-[0.95] tracking-[-0.04em]"
              >
                Your quote.
              </motion.h2>
              <motion.p variants={rise} className="mt-5 max-w-xl text-lg leading-relaxed text-white/88">
                Lane, dates and equipment — that’s all we need. The dispatch desk replies during business hours ({COMPANY.hours}).
              </motion.p>
              <motion.div variants={rise} className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={() => openQuote()} className="btn-cone px-7 py-4 text-lg">
                  Get a quote <SignArrow dir="right" className="h-5 w-4" />
                </button>
                <button type="button" onClick={openChat} className="btn-ghost px-7 py-4 text-lg text-white hover:bg-white/10">
                  Chat with dispatch
                </button>
              </motion.div>
            </div>
            <motion.div
              variants={{ hidden: { opacity: 0, x: -20, y: 20 }, visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.8, delay: 0.2 } } }}
              aria-hidden="true"
              className="hidden md:block"
            >
              <SignArrow dir="up-right" className="h-44 w-40 lg:h-52 lg:w-48" />
            </motion.div>
          </motion.div>
        </motion.div>
        {/* Sign posts */}
        <div aria-hidden="true" className="mx-auto flex h-24 w-[70%] justify-between sm:h-32">
          <span className="post w-3 sm:w-4" />
          <span className="post w-3 sm:w-4" />
        </div>
      </div>
    </section>
  );
}
