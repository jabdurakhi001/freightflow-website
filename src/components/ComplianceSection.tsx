import { ShieldCheck, Shield, Settings } from 'lucide-react';
import Reveal from './Reveal';

export default function ComplianceSection() {
  return (
    <section id="compliance" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <Reveal direction="right">
            <h2 className="text-4xl font-black text-primary dark:text-white tracking-tighter mb-8">
              Built for Compliance. <br/>Operated for Reliability.
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <ShieldCheck className="text-secondary w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-primary dark:text-white">Active USDOT & MC Registration</h4>
                  <p className="text-sm text-on-surface-variant">Fully authorized for interstate commerce with transparent filings.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Shield className="text-secondary w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-primary dark:text-white">Fully Insured Operations</h4>
                  <p className="text-sm text-on-surface-variant">Comprehensive cargo and liability coverage for high-value protection.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Settings className="text-secondary w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-primary dark:text-white">Safety-Focused Fleet Management</h4>
                  <p className="text-sm text-on-surface-variant">Rigorous maintenance schedules using predictive analytics.</p>
                </div>
              </div>
            </div>
            <p className="mt-10 italic text-primary-container dark:text-white/80 font-semibold border-l-4 border-secondary-fixed-dim pl-6">
              "We don't cut corners. We build systems that hold up under scrutiny."
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4">
            <Reveal direction="left" delay={0.1} className="bg-surface-container-low p-8 kinetic-strip">
              <h4 className="text-xs uppercase tracking-[0.2em] font-black text-on-surface-variant mb-4">Structured Recruitment</h4>
              <p className="font-bold text-primary dark:text-white">Driver Qualification Process</p>
              <p className="text-sm text-on-surface-variant mt-2">Only top 5% of applicants clear our technical and safety vetting protocols.</p>
            </Reveal>
            <Reveal direction="left" delay={0.2} className="bg-surface-container-highest p-8 kinetic-strip">
              <h4 className="text-xs uppercase tracking-[0.2em] font-black text-on-surface-variant mb-4">Centralized Command</h4>
              <p className="font-bold text-primary dark:text-white">Compliance-Driven Dispatch</p>
              <p className="text-sm text-on-surface-variant mt-2">Automated HOS monitoring prevents violations before they occur.</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
