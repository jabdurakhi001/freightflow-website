import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import SectionTitle from '../ui/SectionTitle';

const STEPS = [
  { title: 'Request a quote', body: 'Send the lane, dates and equipment. The dispatch desk answers during business hours.' },
  { title: 'Capacity confirmed', body: 'A specific truck and driver are assigned to your load before it moves.' },
  { title: 'Dispatched & tracked', body: 'GPS tracking and milestone updates from the moment the truck checks in at pickup.' },
  { title: 'Delivered, POD in hand', body: 'Digital proof of delivery as soon as the consignee signs — no chasing paperwork.' },
];

// Marker positions along the road (fraction of its length).
const POS = STEPS.map((_, i) => (i + 0.5) / STEPS.length);

/**
 * Top-down photo of a Cascadia and 53′ van, nose pointing right (cut out,
 * transparent; source in video/public/route/). Natural size 640×106.
 */
function Rig({ className }: { className?: string }) {
  return (
    <img
      src="/route/rig.webp"
      alt=""
      aria-hidden="true"
      width={640}
      height={106}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={className}
    />
  );
}

function Marker({ progress, at, index, vertical }: { progress: MotionValue<number>; at: number; index: number; vertical?: boolean }) {
  // The marker lights up as the truck reaches it.
  const lit = useTransform(progress, [at - 0.04, at], [0, 1]);
  const scale = useTransform(lit, [0, 1], [0.92, 1]);
  const numberOpacity = useTransform(lit, [0, 1], [0.45, 1]);
  return (
    <motion.span
      style={{ scale }}
      className={`relative grid h-14 w-11 shrink-0 place-items-center rounded-md bg-asphalt-2 text-lg font-black text-white/50 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.25)] ${vertical ? 'mt-0.5' : ''}`}
    >
      <motion.span
        style={{ opacity: lit }}
        className="absolute inset-0 rounded-md bg-sign shadow-[inset_0_0_0_3px_var(--color-sign),inset_0_0_0_5px_#fff,0_0_30px_rgba(31,138,92,0.6)]"
      />
      <span className="relative">
        <span className="legend block text-center text-[0.5rem] leading-none text-white/80">Mile</span>
        <motion.span className="block text-center text-white" style={{ opacity: numberOpacity }}>
          {index + 1}
        </motion.span>
      </span>
    </motion.span>
  );
}

export default function LoadRoute() {
  const roadRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: roadRef, offset: ['start 75%', 'end 45%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
  // Transforms only: the truck rides a track the length of the road (minus its own
  // length, so it never leaves the tarmac) and the travelled stretch scales in.
  const travel = useTransform(progress, [0, 1], ['0%', '100%']);

  return (
    <section id="how-it-works" className="asphalt relative overflow-hidden py-24 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle
          marker="MM 02"
          kicker="How a load moves"
          title={<>Four miles from quote<br className="hidden sm:block" /> to proof of delivery.</>}
          lede="No phone tag, no guessing where the truck is. Every load follows the same route through our dispatch system."
          onDark
        />

        <div ref={roadRef} className="mt-16">
          {/* Desktop: horizontal road */}
          <div className="hidden lg:block">
            <div className="relative h-24 rounded-md bg-asphalt-2 shadow-[inset_0_3px_0_#fff,inset_0_-3px_0_#fff]">
              <div aria-hidden="true" className="lane lane-flow absolute inset-x-4 top-1/2 -translate-y-1/2 text-lane" />
              {/* Travelled stretch */}
              <motion.div aria-hidden="true" style={{ scaleX: progress }} className="absolute inset-0 origin-left rounded-md bg-sign/25" />
              <div aria-hidden="true" className="absolute inset-y-0 left-2 right-[13.5rem]">
                <motion.div style={{ x: travel }} className="absolute inset-0">
                  {/* eastbound, so it keeps to the right-hand (lower) lane */}
                  <Rig className="absolute left-0 top-[73%] h-auto w-[13rem] max-w-none -translate-y-1/2 select-none drop-shadow-[0_10px_12px_rgba(0,0,0,0.55)]" />
                </motion.div>
              </div>
            </div>
            <ol className="mt-8 grid grid-cols-4 gap-8">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex flex-col items-center text-center">
                  <Marker progress={progress} at={POS[i]} index={i} />
                  <h3 className="mt-5 text-xl font-black tracking-tight">{s.title}</h3>
                  <p className="mt-2 max-w-[16rem] text-[0.98rem] leading-relaxed text-white/70">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Mobile / tablet: vertical road down the left */}
          <div className="relative grid grid-cols-[4.5rem_1fr] gap-x-5 lg:hidden">
            <div className="relative row-span-4 rounded-md bg-asphalt-2 shadow-[inset_3px_0_0_#fff,inset_-3px_0_0_#fff]">
              <div aria-hidden="true" className="lane-v lane-flow absolute inset-y-3 left-1/2 -translate-x-1/2 text-lane" />
              <motion.div aria-hidden="true" style={{ scaleY: progress }} className="absolute inset-0 origin-top rounded-md bg-sign/25" />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-[7.75rem] top-2">
                <motion.div style={{ y: travel }} className="absolute inset-0">
                  {/* rig rotated to drive downwards, in the right-hand (left on screen) lane: a
                      120×20 box turned on its centre, so it spans the top 120px of this track
                      (the bottom inset keeps it on the road) */}
                  <div className="absolute left-[27%] top-[3.125rem] h-5 w-[7.5rem] -translate-x-1/2 rotate-90">
                    <Rig className="h-5 w-[7.5rem] max-w-none select-none drop-shadow-[0_0_8px_rgba(0,0,0,0.6)]" />
                  </div>
                </motion.div>
              </div>
            </div>
            <ol className="col-start-2 row-span-4 grid gap-10 py-6">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <Marker progress={progress} at={POS[i]} index={i} vertical />
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{s.title}</h3>
                    <p className="mt-1.5 text-[0.98rem] leading-relaxed text-white/70">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
