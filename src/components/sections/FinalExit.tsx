import { motion } from 'motion/react';
import { useQuoteModal } from '../../QuoteContext';
import { COMPANY, openChat } from '../../content';
import { rise, SIGN_SPRING, stagger } from '../../lib/motion';
import { SignArrow } from '../ui/Signs';

/**
 * Closing call to action: an exit sign on two posts. On desktop it stands on
 * the right shoulder of a desert interstate, with the truck on the road beside
 * it heading for the exit; on phones the photo is a band above the sign.
 */
export default function FinalExit() {
  const { openQuote } = useQuoteModal();
  return (
    <section aria-labelledby="final-exit-title" className="relative isolate overflow-hidden bg-surface">
      <div aria-hidden="true" className="relative h-[15rem] sm:h-[22rem] lg:absolute lg:inset-0 lg:-z-10 lg:h-auto">
        <img
          src="/photos/final.jpg"
          alt=""
          width={1600}
          height={900}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-[30%_62%] lg:object-[30%_75%]"
        />
        {/* Phones: fade into the page below. Desktop: blend in from the section above. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,var(--color-surface)_100%)] lg:bg-[linear-gradient(180deg,var(--color-surface)_0%,transparent_16%)]" />
      </div>
      <div className="relative mx-auto -mt-12 max-w-6xl px-5 sm:-mt-16 sm:px-8 lg:mt-0 lg:max-w-none lg:px-10 lg:pt-28 xl:px-16">
        <div className="lg:ml-auto lg:w-[32rem] xl:w-[40rem]">
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
              className="guide-sign grid items-center gap-10 px-7 py-10 sm:px-12 sm:py-14 md:grid-cols-[1fr_auto] lg:block lg:px-10 lg:py-11"
              variants={stagger(0.08, 0.25)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
            >
              <div>
                <motion.h2
                  id="final-exit-title"
                  variants={rise}
                  className="text-[clamp(2.8rem,7vw,5.6rem)] font-black leading-[0.95] tracking-[-0.04em] lg:pr-16 lg:text-[clamp(3.2rem,4.2vw,4.2rem)]"
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
                className="hidden md:block lg:absolute lg:right-9 lg:top-10"
              >
                <SignArrow dir="up-right" className="h-44 w-40 lg:h-20 lg:w-[4.2rem]" />
              </motion.div>
            </motion.div>
          </motion.div>
          {/* Sign posts */}
          <div aria-hidden="true" className="mx-auto flex h-24 w-[70%] justify-between sm:h-32">
            <span className="post w-3 sm:w-4" />
            <span className="post w-3 sm:w-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
