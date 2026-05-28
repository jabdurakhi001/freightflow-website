import { Banknote, Home, Headset, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import Reveal from './Reveal';
import Aurora from './Aurora';

const PERKS: { icon: LucideIcon; label: string }[] = [
  { icon: Banknote, label: 'Premium Pay' },
  { icon: Home, label: 'Home Time' },
  { icon: Headset, label: 'Elite Dispatch' },
];

export default function RecruitmentSection() {
  return (
    <section id="recruitment" className="py-28 bg-primary text-white text-center relative overflow-hidden grain">
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary-container to-primary opacity-50"></div>
      <Aurora className="opacity-70" />
      <div className="relative z-10 max-w-4xl mx-auto px-8">
        <Reveal>
          <span className="eyebrow justify-center mb-4">Now Hiring · Chicago & Dallas</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] mb-4">Drive With a Carrier That Runs Like a Business</h2>
          <p className="text-xl text-on-primary-container mb-12">Consistent loads. Structured operations. Professional support. We respect your time and your expertise.</p>
        </Reveal>
        <motion.div
          className="flex justify-center gap-8 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ staggerChildren: 0.15 }}
        >
          {PERKS.map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              className="flex flex-col items-center"
              variants={{
                hidden: { opacity: 0, scale: 0.5, y: 20 },
                visible: { opacity: 1, scale: 1, y: 0 },
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            >
              <Icon className="text-secondary w-10 h-10 mb-2" />
              <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
            </motion.div>
          ))}
        </motion.div>
        <motion.a
          href="mailto:info@freightflow.group?subject=Driver%20Application"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="btn-premium group inline-flex items-center gap-2 text-white px-12 py-5 rounded-full font-bold text-lg uppercase tracking-widest"
        >
          Apply Now
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.a>
      </div>
    </section>
  );
}
