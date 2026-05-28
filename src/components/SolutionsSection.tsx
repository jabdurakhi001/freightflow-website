import { Truck, Calendar, Map as MapIcon, Network, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

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
    <section id="solutions" className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <SectionHeading
          eyebrow="What We Move"
          title="Freight Solutions Designed for Execution"
          subtitle="Four service lines, one operating standard — engineered capacity that scales with your supply chain."
          className="mb-16"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SOLUTIONS.map((solution, i) => {
            const Icon = solution.icon;
            return (
              <Reveal key={solution.title} direction="up" delay={i * 0.1}>
                <a
                  href="mailto:info@freightflow.group?subject=Service%20Inquiry"
                  className="card-premium group flex h-full flex-col p-7"
                >
                  <div className="mb-6 inline-flex w-fit items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-secondary-fixed-dim p-3 glow-secondary">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-black text-xl mb-3 tracking-tight text-primary dark:text-white">{solution.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-6">{solution.description}</p>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-primary dark:text-white group-hover:text-secondary transition-colors">
                    Learn More
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
