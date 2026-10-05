import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { COMPANY, openChat } from '../../content';
import { EASE_BRAND } from '../../lib/motion';
import Reveal from '../ui/Reveal';
import SectionTitle from '../ui/SectionTitle';

const FAQS = [
  {
    q: 'Where do you run?',
    a: 'All 48 contiguous states. Trucks are dispatched from our Chicago hub, covering high-frequency regional lanes and coast-to-coast long-haul.',
  },
  {
    q: 'What equipment do you operate?',
    a: "2025–2027 Freightliner Cascadia tractors pulling 53′ dry vans, maintained on a preventive, data-driven schedule.",
  },
  {
    q: 'Can I track my load?',
    a: 'Yes. Every load has live GPS tracking with automated milestone updates from pickup to delivery, and digital proof of delivery as soon as it is signed.',
  },
  {
    q: 'Are you licensed and insured?',
    a: `Yes. We hold active USDOT (${COMPANY.usdot}) and MC (${COMPANY.mc}) authority for interstate commerce, with cargo and liability coverage. You can verify our authority on FMCSA SAFER.`,
  },
  {
    q: 'How fast will I get a quote?',
    a: `Send your lane through the quote form and our dispatch desk will respond during business hours (${COMPANY.hours}). Our systems support active loads around the clock.`,
  },
  {
    q: 'Are you hiring drivers?',
    a: 'Yes — CDL-A drivers around Chicago. We offer competitive per-mile pay, planned home time, a dedicated dispatcher and new equipment.',
  },
];

const FAQ_SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" className="bg-surface-container py-24 sm:py-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_SCHEMA }} />
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionTitle marker="MM 06" kicker="FAQ" title="Straight answers." />
          <Reveal delay={0.15} className="mt-8">
            <p className="text-lg leading-relaxed text-on-surface-variant">
              Something we didn’t cover? Our team is on chat during business hours, or email{' '}
              <a href={`mailto:${COMPANY.email}`} className="font-bold text-on-surface underline decoration-cone decoration-2 underline-offset-4">
                {COMPANY.email}
              </a>
              .
            </p>
            <button type="button" onClick={openChat} className="btn-ghost mt-6 px-5 py-3 text-on-surface hover:bg-on-surface/5">
              Chat with dispatch
            </button>
          </Reveal>
        </div>

        <ul className="divide-y divide-outline-variant overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_0_0_1px_var(--color-outline-variant)]">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-panel-${i}`;
            const buttonId = `${baseId}-button-${i}`;
            return (
              <li key={f.q}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center gap-5 px-5 py-5 text-left sm:px-7 sm:py-6"
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-md text-sm font-black transition-colors ${
                        isOpen ? 'bg-sign text-white' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1 text-lg font-extrabold tracking-tight sm:text-xl">{f.q}</span>
                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.25, ease: EASE_BRAND }}>
                      <Plus className="h-5 w-5" />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: EASE_BRAND }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-6 pl-[4.25rem] pr-8 leading-relaxed text-on-surface-variant sm:px-7 sm:pl-[5.25rem]">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
