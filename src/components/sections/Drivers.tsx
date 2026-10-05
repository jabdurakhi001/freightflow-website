import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { COMPANY } from '../../content';
import { rise, SIGN_SPRING, stagger } from '../../lib/motion';

const PERKS = [
  { title: 'Premium pay', body: 'Competitive per-mile rates that respect professional experience.' },
  { title: 'Planned home time', body: 'Structured scheduling out of Chicago and Dallas — planned, not promised.' },
  { title: 'One dispatcher', body: 'A dedicated dispatcher who answers, plans ahead and has your back.' },
  { title: 'New equipment', body: '2025–2026 Freightliner Cascadias only. No worn-out trucks.' },
];

/** Barricade stripe band (orange/black chevrons). */
function Barricade() {
  return (
    <div
      aria-hidden="true"
      className="h-4 bg-[repeating-linear-gradient(-45deg,var(--color-cone)_0_18px,#0f1512_18px_36px)] sm:h-5"
    />
  );
}

export default function Drivers() {
  return (
    <section id="drivers" className="bg-asphalt text-white">
      <Barricade />
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <motion.div
          className="zone-sign px-6 py-10 sm:px-12 sm:py-14"
          style={{ transformPerspective: 1100, transformOrigin: 'top center' }}
          initial={{ opacity: 0, rotateX: -18, y: -20 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={SIGN_SPRING}
        >
          <motion.div
            className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16"
            variants={stagger(0.08, 0.2)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div>
              <motion.p variants={rise} className="legend">Drivers · CDL-A · OTR & regional</motion.p>
              <motion.h2
                variants={rise}
                className="mt-4 text-[clamp(2.6rem,6vw,4.6rem)] font-black uppercase leading-[0.92] tracking-[-0.03em]"
              >
                Now hiring
                <br />
                drivers
              </motion.h2>
              <motion.p variants={rise} className="mt-5 max-w-md text-lg font-semibold leading-relaxed">
                Drive for a carrier that runs like a business: consistent loads, structured operations, and people who
                respect your time.
              </motion.p>
              <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={COMPANY.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-[10px] bg-[#0f1512] px-7 py-4 text-lg font-extrabold text-white transition-colors hover:bg-black"
                >
                  Apply now
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                <span className="text-sm font-bold">Hiring around Chicago & Dallas</span>
              </motion.div>
            </div>

            <ul className="grid gap-px overflow-hidden rounded-lg bg-[#0f1512]/80 sm:grid-cols-2">
              {PERKS.map((p, i) => (
                <motion.li key={p.title} variants={rise} className="bg-cone p-6">
                  <span className="legend text-[#0f1512]/70">P-{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-2 text-xl font-black tracking-tight">{p.title}</h3>
                  <p className="mt-1.5 font-semibold leading-relaxed text-[#0f1512]/85">{p.body}</p>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
      <Barricade />
    </section>
  );
}
