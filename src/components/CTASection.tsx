import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import Aurora from './Aurora';
import { useQuoteModal } from '../QuoteContext';

export default function CTASection() {
  const { openQuote } = useQuoteModal();
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-container to-primary p-10 md:p-16 grain shadow-2xl">
            <Aurora className="opacity-60" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
              <div className="max-w-xl">
                <span className="eyebrow mb-4">Let's Move</span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] text-white mb-4">
                  Need Reliable Freight Movement?
                </h2>
                <p className="text-lg font-medium text-white/70">Join the shippers who have moved from guesswork to systems.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <motion.button
                  type="button"
                  onClick={openQuote}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn-premium group inline-flex items-center justify-center gap-2 text-white px-9 py-4 rounded-full font-bold uppercase tracking-widest cursor-pointer"
                >
                  Request a Quote
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.a
                  href="mailto:info@freightflow.group?subject=Freight%20Inquiry"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="border border-white/20 bg-white/5 backdrop-blur-sm text-white px-9 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-center"
                >
                  Speak With Our Team
                </motion.a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
