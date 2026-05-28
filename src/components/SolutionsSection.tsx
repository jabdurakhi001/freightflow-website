import { Truck, Calendar, Map as MapIcon, Network } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Reveal from './Reveal';

interface Solution {
  icon: LucideIcon;
  title: string;
  description: string;
}

const SOLUTIONS: Solution[] = [
  {
    icon: Truck,
    title: 'Full Truckload (FTL)',
    description: 'High-capacity equipment for massive volumes across the continental US.',
  },
  {
    icon: Calendar,
    title: 'Dedicated Freight',
    description: 'Predictable capacity for recurring lanes and complex supply chains.',
  },
  {
    icon: MapIcon,
    title: 'Regional & Long-Haul',
    description: 'Optimized routing for both high-frequency regional and coast-to-coast hauls.',
  },
  {
    icon: Network,
    title: 'Logistics Coordination',
    description: 'Comprehensive oversight of multimodal touchpoints and cargo transitions.',
  },
];

export default function SolutionsSection() {
  return (
    <section id="solutions" className="py-20 bg-surface-container">
      <div className="max-w-7xl mx-auto px-8">
        <Reveal className="text-center mb-16">
          <h2 className="text-4xl font-black text-primary dark:text-white tracking-tighter">Freight Solutions Designed for Execution</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SOLUTIONS.map((solution, i) => {
            const Icon = solution.icon;
            return (
              <Reveal key={solution.title} direction="up" delay={i * 0.1}>
                <div className="h-full bg-surface-container-lowest p-8 rounded-xl border border-transparent hover:border-outline-variant/30 hover:-translate-y-2 hover:opacity-90 hover:shadow-2xl transition-all duration-300 group cursor-pointer flex flex-col">
                  <Icon className="text-secondary mb-6 w-10 h-10 group-hover:scale-125 group-hover:-rotate-6 group-hover:text-primary dark:group-hover:text-white transition-all duration-300" />
                  <h3 className="font-black text-xl mb-4 tracking-tight text-primary dark:text-white">{solution.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-6">{solution.description}</p>
                  <a className="mt-auto inline-block text-xs font-black uppercase tracking-widest text-primary dark:text-white group-hover:text-secondary transition-colors" href="mailto:info@freightflow.group?subject=Service%20Inquiry">Learn More →</a>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
