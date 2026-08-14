import { motion, useReducedMotion } from 'motion/react';
import { Truck, Radio, ShieldCheck } from 'lucide-react';

interface Load {
  id: string;
  lane: string;
  status: 'In Transit' | 'Delivered' | 'Loading' | 'Dispatched';
  progress: number;
}

// Illustrative sample lanes for the product visualization
const LOADS: Load[] = [
  { id: 'FF-2481', lane: 'CHI → DAL', status: 'In Transit', progress: 68 },
  { id: 'FF-2479', lane: 'ATL → MIA', status: 'Delivered', progress: 100 },
  { id: 'FF-2483', lane: 'DEN → PHX', status: 'Loading', progress: 12 },
  { id: 'FF-2485', lane: 'KC → HOU', status: 'Dispatched', progress: 31 },
];

const STATUS_STYLES: Record<Load['status'], { chip: string; dot: string; pulse: boolean }> = {
  'In Transit': { chip: 'bg-secondary/15 text-secondary-fixed-dim', dot: 'bg-secondary', pulse: true },
  Delivered: { chip: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-400', pulse: false },
  Loading: { chip: 'bg-tertiary/15 text-tertiary', dot: 'bg-tertiary', pulse: true },
  Dispatched: { chip: 'bg-white/10 text-white/70', dot: 'bg-white/60', pulse: false },
};

// Static uptime sparkline path (visual flourish, not live data)
const SPARK_POINTS = '0,26 12,22 24,24 36,16 48,18 60,10 72,14 84,8 96,12 108,4 120,8';

/**
 * A stylized "live dispatch" dashboard mock — sample data shown for product
 * illustration. Replaces a generic stock photo with a bespoke visualization.
 */
export default function OpsConsole() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative">
      {/* Glow behind the console */}
      <div className="absolute -inset-6 bg-secondary/10 blur-3xl rounded-full pointer-events-none" aria-hidden="true" />

      <motion.div
        className="relative rounded-2xl border border-white/10 bg-primary/80 backdrop-blur-xl shadow-2xl overflow-hidden"
        animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">FreightFlow OS · Dispatch</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              {!reduceMotion && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-3 divide-x divide-white/8 border-b border-white/8">
          <div className="px-5 py-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Active Loads</p>
            <div className="flex items-end gap-2">
              <span className="text-xl font-black text-white tracking-tight">4</span>
              <svg viewBox="0 0 120 30" className="w-14 h-6 mb-0.5" aria-hidden="true">
                <motion.polyline
                  points={SPARK_POINTS}
                  fill="none"
                  stroke="var(--color-secondary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease: 'easeInOut' }}
                />
              </svg>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">On Schedule</p>
            <span className="text-xl font-black text-white tracking-tight">4/4</span>
          </div>
          <div className="px-5 py-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">HOS Alerts</p>
            <span className="text-xl font-black text-emerald-400 tracking-tight">0</span>
          </div>
        </div>

        {/* Load rows */}
        <motion.ul
          className="divide-y divide-white/5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.12, delayChildren: 0.2 }}
        >
          {LOADS.map((load) => {
            const style = STATUS_STYLES[load.status];
            return (
              <motion.li
                key={load.id}
                className="px-5 py-3.5"
                variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-white/30" aria-hidden="true" />
                    <span className="text-xs font-black text-white/80 tracking-wide">{load.id}</span>
                    <span className="text-xs font-bold text-white/40 tracking-widest">{load.lane}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${style.chip}`}>
                    <span className="relative flex h-1.5 w-1.5">
                      {style.pulse && !reduceMotion && (
                        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${style.dot}`} />
                      )}
                      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    </span>
                    {load.status}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${load.status === 'Delivered' ? 'bg-emerald-400/80' : 'bg-gradient-to-r from-secondary-fixed-dim to-secondary'}`}
                    initial={reduceMotion ? false : { width: 0 }}
                    whileInView={{ width: `${load.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.4 }}
                  />
                </div>
              </motion.li>
            );
          })}
        </motion.ul>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/8 bg-white/[0.02] text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
          <span className="inline-flex items-center gap-1.5"><Radio className="w-3 h-3 text-secondary" aria-hidden="true" /> GPS telemetry active</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-400" aria-hidden="true" /> Compliance clear</span>
        </div>
      </motion.div>

      <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">Illustrative dispatch view</p>
    </div>
  );
}
