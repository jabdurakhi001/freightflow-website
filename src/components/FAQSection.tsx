import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import { useQuoteModal } from '../QuoteContext';

const FAQS = [
  {
    q: 'What areas do you cover?',
    a: 'We cover all 48 contiguous states from our Chicago and Dallas hubs, spanning both high-frequency regional lanes and coast-to-coast long-haul.',
  },
  {
    q: 'What equipment do you operate?',
    a: 'Our fleet consists exclusively of 2025–2026 Freightliner Cascadia units, maintained on rigorous predictive schedules.',
  },
  {
    q: 'Do you provide real-time tracking?',
    a: 'Yes. Every load gets live GPS tracking with automated milestone notifications, so every stakeholder has visibility from dispatch to delivery — plus instant digital POD on arrival.',
  },
  {
    q: 'Are you fully licensed and insured?',
    a: 'Yes. We hold active USDOT (4357973) and MC (1704871) authority for interstate commerce, with comprehensive cargo and liability coverage for high-value protection.',
  },
  {
    q: 'How fast can I get a quote?',
    a: 'Submit your lane details through our quote form and our dispatch team will respond during business hours (Mon–Fri, 8AM–5PM CST). Our dispatch systems are built to support active loads around the clock.',
  },
  {
    q: 'Are you hiring drivers?',
    a: 'Yes — we are actively hiring professional drivers in the Chicago and Dallas areas. We offer premium pay, structured home time, and elite dispatch support.',
  },
];

const FAQ_SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { openQuote } = useQuoteModal();

  return (
    <section id="faq" className="py-24 bg-surface-container-low">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_SCHEMA }} />
      <div className="max-w-3xl mx-auto px-8">
        <SectionHeading
          eyebrow="Straight Answers"
          title="Frequently Asked Questions"
          className="mb-14"
        />
        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={faq.q} delay={i * 0.06}>
                <div className="card-premium overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-bold text-primary dark:text-white tracking-tight">{faq.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={`shrink-0 rounded-full p-1.5 transition-colors ${isOpen ? 'bg-secondary text-white' : 'bg-surface-container text-on-surface-variant'}`}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                      >
                        <p className="px-6 pb-6 text-sm text-on-surface-variant leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={0.2} className="text-center mt-10">
          <p className="text-sm text-on-surface-variant">
            Still have questions?{' '}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('ff:open-chat'))}
              className="font-black text-secondary hover:underline"
            >
              Talk to our team →
            </button>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
