import { ShieldCheck, Shield, Settings } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const CREDENTIALS = [
  {
    icon: ShieldCheck,
    title: 'Active USDOT & MC Registration',
    desc: 'Fully authorized for interstate commerce with transparent filings.',
  },
  {
    icon: Shield,
    title: 'Fully Insured Operations',
    desc: 'Comprehensive cargo and liability coverage for high-value protection.',
  },
  {
    icon: Settings,
    title: 'Safety-Focused Fleet Management',
    desc: 'Rigorous maintenance schedules using predictive analytics.',
  },
];

export default function ComplianceSection() {
  return (
    <section id="compliance" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <Reveal direction="right">
            <SectionHeading
              index="01"
              eyebrow="Compliance First"
              title={<>Built for Compliance. <br />Operated for Reliability.</>}
            />
            <div className="mt-8 border-b border-outline-variant/50">
              {CREDENTIALS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 border-t border-outline-variant/50 py-5">
                  <Icon className="text-secondary w-5 h-5 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-headline font-black text-primary dark:text-white text-base tracking-tight">{title}</h3>
                    <p className="text-sm text-on-surface-variant mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mono-label mt-8 text-on-surface-variant/70 leading-loose">
              // WE DON'T CUT CORNERS. WE BUILD SYSTEMS<br />
              // THAT HOLD UP UNDER SCRUTINY.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-px bg-outline-variant/40 border border-outline-variant/40 md:mt-[3.75rem]">
            <Reveal direction="left" delay={0.1} className="bg-surface-container-low p-8">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="mono-label text-on-surface-variant">Structured Recruitment</h3>
                <span className="section-index text-on-surface-variant/40">A</span>
              </div>
              <p className="font-headline font-black text-lg text-primary dark:text-white tracking-tight">Driver Qualification Process</p>
              <p className="text-sm text-on-surface-variant mt-2">Every driver clears our technical and safety vetting protocols before their first dispatch.</p>
            </Reveal>
            <Reveal direction="left" delay={0.2} className="bg-surface-container-low p-8">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="mono-label text-on-surface-variant">Centralized Command</h3>
                <span className="section-index text-on-surface-variant/40">B</span>
              </div>
              <p className="font-headline font-black text-lg text-primary dark:text-white tracking-tight">Compliance-Driven Dispatch</p>
              <p className="text-sm text-on-surface-variant mt-2">Automated HOS monitoring prevents violations before they occur.</p>
            </Reveal>
            <Reveal direction="left" delay={0.3} className="bg-primary p-8 text-white">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="mono-label text-secondary">Authority on File</h3>
                <span className="section-index text-white/30">C</span>
              </div>
              <div className="flex flex-wrap gap-x-10 gap-y-2">
                <div>
                  <span className="mono-label block text-white/40 mb-1">USDOT</span>
                  <span className="font-headline font-black text-2xl tracking-tight">4357973</span>
                </div>
                <div>
                  <span className="mono-label block text-white/40 mb-1">MC</span>
                  <span className="font-headline font-black text-2xl tracking-tight">1704871</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
