import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="relative min-h-screen md:min-h-[90vh] flex items-center overflow-hidden bg-primary">
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          alt="Semi truck on highway at sunset"
          src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1920&q=80&auto=format"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/80 to-transparent"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
        <div className="max-w-3xl">
          <span className="inline-block px-3 py-1 bg-secondary text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            Precision Kineticism
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter mb-6"
          >
            Reliable Freight Capacity Backed by Systems, <span className="text-secondary">Not Guesswork</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl text-white/70 mb-4 font-light leading-relaxed"
          >
            FreightFlow delivers consistent, compliant, and scalable transportation across all 48 states — powered by structured operations and real-time visibility.
          </motion.p>
          <p className="text-secondary font-bold tracking-tight mb-10 border-l-2 border-secondary pl-4">
            We don't just move freight. We execute with precision.
          </p>
          <div className="flex flex-wrap gap-4">
            <motion.a
              href="mailto:info@freightflow.group?subject=Quote%20Request"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-secondary-container text-on-secondary-container px-10 py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Request a Quote
            </motion.a>
            <motion.a
              href="#recruitment"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-white/20 bg-white/5 backdrop-blur-sm text-white px-10 py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Work With Us
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}
