import { motion } from 'motion/react';
import { ArrowUpRight, ClipboardCheck, Clock3, ShieldCheck, Wrench } from 'lucide-react';
import { COMPANY } from '../../content';
import { stagger, swingIn } from '../../lib/motion';
import Reveal from '../ui/Reveal';
import SectionTitle from '../ui/SectionTitle';

const AUTHORITY = [
  { label: 'USDOT number', value: COMPANY.usdot, note: 'Registered with FMCSA' },
  { label: 'MC number', value: COMPANY.mc, note: 'Interstate operating authority' },
];

const PRACTICES = [
  { icon: ShieldCheck, title: 'Fully insured', body: 'Cargo and liability coverage on every load we haul.' },
  { icon: ClipboardCheck, title: 'Qualified drivers', body: 'Every driver clears safety and qualification vetting before a first dispatch.' },
  { icon: Clock3, title: 'Hours-of-service watched', body: 'Dispatch monitors HOS on every run to head off violations before they happen.' },
  { icon: Wrench, title: 'Maintained on schedule', body: 'Preventive, data-driven maintenance keeps trucks on the road and off the shoulder.' },
];

export default function Compliance() {
  return (
    <section id="compliance" className="bg-surface-container py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <div>
          <SectionTitle
            marker="MM 03"
            kicker="Compliance"
            title="Regulated, insured, and on the record."
            lede="Our authority isn't a badge on a slide. It's public — look us up before you tender a single load."
          />

          <motion.div
            className="mt-12 grid gap-6 sm:grid-cols-2"
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {AUTHORITY.map((a) => (
              <motion.div
                key={a.label}
                variants={swingIn}
                style={{ transformPerspective: 900, transformOrigin: 'top center' }}
                className="reg-sign px-7 pb-7 pt-8 text-center"
              >
                <p className="text-sm font-black uppercase tracking-[0.18em]">{a.label}</p>
                <p className="mt-2 text-[clamp(2.6rem,5vw,3.4rem)] font-black leading-none tracking-[-0.03em] tabular-nums">{a.value}</p>
                <p className="mt-3 text-[0.8rem] font-bold text-[#4a5550]">{a.note}</p>
              </motion.div>
            ))}
          </motion.div>

          <Reveal delay={0.2} className="mt-6">
            <a
              href={COMPANY.saferUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-base font-extrabold text-primary underline decoration-2 underline-offset-4 hover:text-cone-deep dark:text-sign-bright"
            >
              Verify on FMCSA SAFER
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Reveal>
        </div>

        <motion.ul
          className="grid content-start gap-4 lg:pt-28"
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {PRACTICES.map(({ icon: Icon, title, body }) => (
            <motion.li
              key={title}
              variants={{ hidden: { opacity: 0, x: 24 }, visible: { opacity: 1, x: 0, transition: { duration: 0.55 } } }}
              className="flex gap-5 rounded-xl bg-surface-container-lowest p-5 shadow-[0_1px_0_var(--color-outline-variant)] sm:p-6"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-sign text-white shadow-[inset_0_0_0_2px_var(--color-sign),inset_0_0_0_3.5px_#fff]">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-lg font-black tracking-tight">{title}</span>
                <span className="mt-1 block leading-relaxed text-on-surface-variant">{body}</span>
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
