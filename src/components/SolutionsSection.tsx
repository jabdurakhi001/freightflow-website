import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { useQuoteModal } from '../QuoteContext';

interface Solution {
  code: string;
  title: string;
  description: string;
  tag: string;
}

const SOLUTIONS: Solution[] = [
  {
    code: '01',
    title: 'Full Truckload',
    description: 'High-capacity equipment for massive volumes across the continental US.',
    tag: 'FTL · 53FT DRY VAN',
  },
  {
    code: '02',
    title: 'Dedicated Freight',
    description: 'Predictable capacity for recurring lanes and complex supply chains.',
    tag: 'COMMITTED CAPACITY',
  },
  {
    code: '03',
    title: 'Regional & Long-Haul',
    description: 'Optimized routing for both high-frequency regional and coast-to-coast hauls.',
    tag: 'COAST TO COAST',
  },
  {
    code: '04',
    title: 'Logistics Coordination',
    description: 'Comprehensive oversight of multimodal touchpoints and cargo transitions.',
    tag: 'MULTIMODAL',
  },
];

/**
 * Service ledger — numbered editorial rows instead of a card grid. Each row is
 * a full-width button that opens the quote modal.
 */
export default function SolutionsSection() {
  const { openQuote } = useQuoteModal();
  return (
    <section id="solutions" className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <SectionHeading
          index="03"
          eyebrow="What We Move"
          meta="4 SERVICE LINES · 1 STANDARD"
          title="Freight Solutions Designed for Execution"
          subtitle="Four service lines, one operating standard — engineered capacity that scales with your supply chain."
          className="mb-14"
        />
        <div className="border-b border-outline-variant/40">
          {SOLUTIONS.map((solution, i) => (
            <Reveal key={solution.code} delay={i * 0.07}>
              <button
                type="button"
                onClick={() => openQuote()}
                className="ledger-row group grid w-full cursor-pointer grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2 py-7 text-left md:grid-cols-[4rem_minmax(0,1.15fr)_minmax(0,1fr)_auto] md:items-center md:gap-x-10 md:py-8"
              >
                <span className="section-index text-on-surface-variant/50 transition-colors group-hover:text-secondary">
                  {solution.code}
                </span>
                <span className="min-w-0">
                  <span className="block font-headline text-2xl font-black tracking-tight text-primary transition-colors group-hover:text-secondary dark:text-white md:text-3xl">
                    {solution.title}
                  </span>
                  <span className="mono-label mt-1.5 block text-on-surface-variant/50">{solution.tag}</span>
                </span>
                <span className="col-start-2 text-sm leading-relaxed text-on-surface-variant md:col-start-3 md:max-w-md">
                  {solution.description}
                </span>
                <span className="col-start-2 mt-1 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary transition-colors group-hover:text-secondary dark:text-white md:col-start-4 md:mt-0">
                  Get a Quote
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
