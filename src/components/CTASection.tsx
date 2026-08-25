import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import Aurora from './Aurora';
import { useQuoteModal } from '../QuoteContext';

/** Real hub coordinates — decorative "route log" detail. */
const ROUTE_LOG = [
  { code: 'ORIG', city: 'CHICAGO, IL', coord: '41.8781° N / 87.6298° W' },
  { code: 'DEST', city: 'DALLAS, TX', coord: '32.7767° N / 96.7970° W' },
];

export default function CTASection() {
  const { openQuote } = useQuoteModal();
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <Reveal>
          <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-container to-primary p-10 lg:p-16 grain shadow-2xl">
            <Aurora className="opacity-60" />
            <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <span className="eyebrow mb-4">Let's Move</span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.02] text-white mb-4">
                  Need Reliable Freight Movement?
                </h2>
                <p className="text-lg font-medium text-white/70 mb-10">Move your freight from guesswork to systems.</p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                  <motion.button
                    type="button"
                    onClick={() => openQuote()}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="btn-premium group inline-flex items-center justify-center gap-2 text-white px-9 py-4 rounded-full font-bold uppercase tracking-widest cursor-pointer"
                  >
                    Request a Quote
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => window.dispatchEvent(new Event('ff:open-chat'))}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="border border-white/20 bg-white/5 backdrop-blur-sm text-white px-9 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-center cursor-pointer"
                  >
                    Speak With Our Team
                  </motion.button>
                </div>
              </div>

              {/* Route log — manifest detail filling the right column */}
              <div className="hidden lg:block border-l border-white/10 pl-12" aria-hidden="true">
                {ROUTE_LOG.map((stop, i) => (
                  <div key={stop.code}>
                    <div className="flex items-baseline gap-5 py-2">
                      <span className="mono-label w-10 text-secondary">{stop.code}</span>
                      <div>
                        <p className="font-headline text-2xl font-black tracking-tight text-white" style={{ fontStretch: '115%' }}>
                          {stop.city}
                        </p>
                        <p className="mono-label mt-1 text-white/35">{stop.coord}</p>
                      </div>
                    </div>
                    {i === 0 && (
                      <div className="my-3 ml-[4.75rem] flex items-center gap-3">
                        <span className="lane-dash w-28 text-secondary !opacity-60" />
                        <span className="mono-label text-white/30">≈ 950 MI</span>
                      </div>
                    )}
                  </div>
                ))}
                <p className="mono-label mt-6 text-white/25">+ 46 MORE STATES ON THE NETWORK</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
