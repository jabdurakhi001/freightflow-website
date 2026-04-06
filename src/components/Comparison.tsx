import { X, CheckCircle2 } from 'lucide-react';

export default function Comparison() {
  return (
    <section className="py-20 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <div className="bg-surface-container-lowest overflow-hidden shadow-xl rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-12 border-b md:border-b-0 md:border-r border-surface-container">
              <h3 className="text-xs uppercase font-black tracking-widest text-on-surface-variant mb-8">Other Carriers</h3>
              <ul className="space-y-6">
                <li className="flex items-center gap-4 text-on-surface-variant opacity-50">
                  <X className="text-error w-6 h-6 shrink-0" aria-hidden="true" />
                  <del>Inconsistent capacity availability</del>
                </li>
                <li className="flex items-center gap-4 text-on-surface-variant opacity-50">
                  <X className="text-error w-6 h-6 shrink-0" aria-hidden="true" />
                  <del>Limited load visibility</del>
                </li>
                <li className="flex items-center gap-4 text-on-surface-variant opacity-50">
                  <X className="text-error w-6 h-6 shrink-0" aria-hidden="true" />
                  <del>Manual communication lag</del>
                </li>
                <li className="flex items-center gap-4 text-on-surface-variant opacity-50">
                  <X className="text-error w-6 h-6 shrink-0" aria-hidden="true" />
                  <del>Aging, unreliable equipment</del>
                </li>
              </ul>
            </div>
            <div className="p-12 bg-primary text-white kinetic-strip">
              <h3 className="text-xs uppercase font-black tracking-widest text-secondary mb-8">FreightFlow</h3>
              <ul className="space-y-6">
                <li className="flex items-center gap-4">
                  <CheckCircle2 className="text-secondary w-6 h-6 shrink-0" />
                  Structured, guaranteed capacity
                </li>
                <li className="flex items-center gap-4">
                  <CheckCircle2 className="text-secondary w-6 h-6 shrink-0" />
                  Real-time GPS communication
                </li>
                <li className="flex items-center gap-4">
                  <CheckCircle2 className="text-secondary w-6 h-6 shrink-0" />
                  Automated milestone reporting
                </li>
                <li className="flex items-center gap-4">
                  <CheckCircle2 className="text-secondary w-6 h-6 shrink-0" />
                  2024–2026 Freightliner & Volvo Fleet
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-center mt-12">
          <p className="text-2xl font-black text-primary dark:text-white tracking-tight">"Reliability is not luck. It's engineered."</p>
        </div>
      </div>
    </section>
  );
}
