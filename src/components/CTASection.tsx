import { motion } from 'motion/react';
import Reveal from './Reveal';

export default function CTASection() {
  return (
    <section className="py-20 bg-secondary-container text-on-secondary-container">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <Reveal direction="right">
            <h2 className="text-5xl font-black tracking-tighter mb-4">Need Reliable Freight Movement?</h2>
            <p className="text-xl font-bold opacity-80">Join the shippers who have moved from guesswork to systems.</p>
          </Reveal>
          <Reveal direction="left" delay={0.1} className="flex flex-col sm:flex-row gap-4">
            <motion.a
              href="mailto:info@freightflow.group?subject=Quote%20Request"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-10 py-5 rounded-md font-bold uppercase tracking-widest hover:brightness-125 transition-all shadow-lg text-center"
            >
              Request a Quote
            </motion.a>
            <motion.a
              href="mailto:info@freightflow.group?subject=Freight%20Inquiry"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 border border-white/20 text-on-secondary-container px-10 py-5 rounded-md font-bold uppercase tracking-widest hover:bg-white/30 transition-all text-center"
            >
              Speak With Our Team
            </motion.a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
