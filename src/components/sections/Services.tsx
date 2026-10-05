import { motion } from 'motion/react';
import { useQuoteModal } from '../../QuoteContext';
import { stagger, swingIn } from '../../lib/motion';
import { SignArrow } from '../ui/Signs';
import SectionTitle from '../ui/SectionTitle';

const EXITS = [
  {
    n: 1,
    title: 'Full truckload',
    plate: "53' dry van",
    body: 'One shipper, one trailer, dock to dock. Your freight rides alone from pickup to delivery.',
  },
  {
    n: 2,
    title: 'Dedicated capacity',
    plate: 'Recurring lanes',
    body: 'Committed trucks on the lanes you run every week, so capacity is planned — not hunted for.',
  },
  {
    n: 3,
    title: 'Regional & long-haul',
    plate: 'Coast to coast',
    body: 'High-frequency regional runs and cross-country hauls, routed out of our Chicago hub.',
  },
  {
    n: 4,
    title: 'Logistics coordination',
    plate: 'One desk',
    body: 'Appointments, multi-stop loads and multimodal handoffs coordinated from a single dispatch desk.',
  },
];

/** Services as a row of exit signs; each one opens the quote form. */
export default function Services() {
  const { openQuote } = useQuoteModal();
  return (
    <section id="services" className="bg-surface py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle
          marker="MM 01"
          kicker="Services"
          title="Pick your exit."
          lede="Four ways to put a FreightFlow truck on your freight. Every one of them runs on the same dispatch desk, the same equipment standard and the same tracking."
        />

        <motion.ul
          className="mt-16 grid gap-x-6 gap-y-12 md:grid-cols-2"
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {EXITS.map((exit) => (
            <motion.li
              key={exit.n}
              variants={swingIn}
              style={{ transformPerspective: 900, transformOrigin: 'top center' }}
              className="relative pt-[26px]"
            >
              <span className="legend absolute left-6 top-0 rounded-t-lg bg-sign px-3 pb-1 pt-1.5 text-[0.72rem] text-white shadow-[inset_0_0_0_2px_#fff]">
                Exit {exit.n}
              </span>
              <button
                type="button"
                onClick={() => openQuote()}
                className="guide-sign group flex h-full w-full flex-col p-7 text-left transition-transform duration-300 ease-[var(--ease-brand)] hover:-translate-y-1 sm:p-9"
              >
                <span className="flex items-start justify-between gap-6">
                  <span className="text-[clamp(1.7rem,2.6vw,2.2rem)] font-black leading-tight tracking-[-0.02em]">{exit.title}</span>
                  <SignArrow
                    dir="up-right"
                    className="mt-1 h-10 w-9 shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </span>
                <span className="legend mt-2 text-white/70">{exit.plate}</span>
                <span className="mt-5 text-[1.05rem] leading-relaxed text-white/88">{exit.body}</span>
                <span className="mt-auto pt-7">
                  <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-extrabold text-sign transition-colors group-hover:bg-cone group-hover:text-[#0f1512]">
                    Quote this lane <SignArrow dir="right" className="h-4 w-3.5" />
                  </span>
                </span>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
