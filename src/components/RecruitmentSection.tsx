import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import Reveal from './Reveal';
import Aurora from './Aurora';
import SectionHeading from './SectionHeading';

const APPLY_URL = 'https://app.freightflow.group/apply';

const PERKS = [
  {
    code: 'P-01',
    label: 'Premium Pay',
    desc: 'Competitive per-mile rates that respect professional experience.',
  },
  {
    code: 'P-02',
    label: 'Home Time',
    desc: 'Structured scheduling out of Chicago and Dallas — planned, not promised.',
  },
  {
    code: 'P-03',
    label: 'Elite Dispatch',
    desc: 'One dedicated dispatcher who answers, plans ahead, and has your back.',
  },
  {
    code: 'P-04',
    label: 'New Equipment',
    desc: 'Exclusively 2025–2026 Freightliner Cascadias. No worn-out trucks.',
  },
];

export default function RecruitmentSection() {
  return (
    <section id="recruitment" className="relative overflow-hidden bg-primary py-28 text-white grain">
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary-container to-primary opacity-50"></div>
      <Aurora className="opacity-70" />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-14 px-8 lg:grid-cols-2 lg:gap-20">
        <Reveal direction="right">
          <SectionHeading
            index="07"
            eyebrow="Now Hiring"
            meta="CHICAGO & DALLAS"
            title="Drive With a Carrier That Runs Like a Business"
            subtitle="Consistent loads. Structured operations. Professional support. We respect your time and your expertise."
            light
          />
          <motion.a
            href={APPLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-premium group mt-10 inline-flex cursor-pointer items-center gap-2 rounded-full px-10 py-4 text-sm font-bold uppercase tracking-widest text-white"
          >
            Apply Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </motion.a>
          <p className="mono-label mt-5 text-white/40">CDL-A · OTR & REGIONAL</p>
        </Reveal>

        <motion.div
          className="self-center border-b border-white/10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.12 }}
        >
          {PERKS.map((perk) => (
            <motion.div
              key={perk.code}
              className="group grid grid-cols-[4rem_1fr] items-baseline gap-x-4 border-t border-white/10 py-6 transition-colors hover:bg-white/[0.03] sm:grid-cols-[5rem_11rem_1fr]"
              variants={{ hidden: { opacity: 0, x: 24 }, visible: { opacity: 1, x: 0 } }}
              transition={{ duration: 0.45 }}
            >
              <span className="section-index text-white/35 transition-colors group-hover:text-secondary">{perk.code}</span>
              <span className="font-headline text-xl font-black tracking-tight">
                {perk.label}
              </span>
              <span className="col-span-2 col-start-2 mt-1 text-sm leading-relaxed text-white/55 sm:col-span-1 sm:col-start-3 sm:mt-0">
                {perk.desc}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
