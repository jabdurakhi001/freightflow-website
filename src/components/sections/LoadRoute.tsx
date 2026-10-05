import { useId, useRef } from 'react';
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
 * Top-down tractor-trailer, nose pointing right: a white Cascadia and 53′ van
 * as seen from an overpass — shaded roofs, roof bows, tyres, mirrors and a
 * tinted windshield.
 */
function Rig({ className }: { className?: string }) {
  const id = useId();
  const roof = `rig-roof-${id}`;
  const cab = `rig-cab-${id}`;
  return (
    <svg viewBox="0 0 120 40" className={className} aria-hidden="true">
      <defs>
        {/* Curved roofs catch light along the middle and fall off to the edges */}
        <linearGradient id={roof} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9beba" />
          <stop offset="0.18" stopColor="#eceeea" />
          <stop offset="0.5" stopColor="#fbfbf8" />
          <stop offset="0.82" stopColor="#e3e6e2" />
          <stop offset="1" stopColor="#a9aea9" />
        </linearGradient>
        <linearGradient id={cab} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#dfe2de" />
          <stop offset="0.55" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfd3cf" />
        </linearGradient>
      </defs>
      {/* Tyres peeking out under the bodywork: trailer tandem, drive tandem, steer */}
      <g fill="#111513">
        {[8, 16, 87, 94, 109].map((x) => (
          <g key={x}>
            <rect x={x} y="3.2" width="5.5" height="3" rx="1" />
            <rect x={x} y="33.8" width="5.5" height="3" rx="1" />
          </g>
        ))}
      </g>
      {/* 53′ van: roof, bows, rear door seam */}
      <rect x="2" y="5" width="79" height="30" rx="1.6" fill={`url(#${roof})`} />
      <g stroke="#9ca29e" strokeWidth="0.45" opacity="0.7">
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={8 + i * 6} y1="5.6" x2={8 + i * 6} y2="34.4" />
        ))}
      </g>
      <rect x="2" y="5" width="2.2" height="30" fill="#8d938f" />
      <rect x="2" y="5" width="79" height="30" rx="1.6" fill="none" stroke="#5f6662" strokeWidth="0.8" />
      {/* Fifth wheel gap */}
      <rect x="81" y="11" width="4" height="18" fill="#1b201d" />
      {/* Sleeper + cab roof with aero fairing */}
      <path d="M85 8.5 Q85 7 87 7 H104 Q106 7 106.5 9 V31 Q106 33 104 33 H87 Q85 33 85 31.5 Z" fill={`url(#${roof})`} />
      <path d="M88 10 H103 V30 H88 Z" fill="none" stroke="#b3b8b4" strokeWidth="0.5" />
      {/* Windshield */}
      <path d="M106.5 9 L110 10.5 V29.5 L106.5 31 Z" fill="#1c2a30" />
      <path d="M107 10.5 L109 11.3 V15 L107 14.4 Z" fill="#8fb3c4" opacity="0.5" />
      {/* Hood, tapering to the bumper */}
      <path d="M110 10.5 Q116 11 117.6 14 Q118.4 20 117.6 26 Q116 29 110 29.5 Z" fill={`url(#${cab})`} stroke="#5f6662" strokeWidth="0.5" />
      <rect x="117.4" y="13" width="1.4" height="14" rx="0.6" fill="#9aa09c" />
      {/* Mirrors on their arms */}
      <g fill="#262c29">
        <rect x="107" y="4.6" width="1.4" height="4.6" />
        <rect x="107" y="30.8" width="1.4" height="4.6" />
        <rect x="106.2" y="3.4" width="3" height="1.6" rx="0.5" />
        <rect x="106.2" y="35" width="3" height="1.6" rx="0.5" />
      </g>
      <rect x="85" y="7" width="33.8" height="26" rx="2" fill="none" stroke="#5f6662" strokeWidth="0.5" opacity="0.6" />
    </svg>
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
              <div aria-hidden="true" className="absolute inset-y-0 left-2 right-[9.5rem]">
                <motion.div style={{ x: travel }} className="absolute inset-0">
                  <Rig className="absolute left-0 top-1/2 h-12 w-36 -translate-y-1/2 drop-shadow-[0_8px_14px_rgba(0,0,0,0.6)]" />
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
              <div aria-hidden="true" className="absolute inset-x-0 bottom-[5rem] top-2">
                <motion.div style={{ y: travel }} className="absolute inset-0">
                  {/* rig rotated to drive downwards; its layout box is 72×24, centred on the lane */}
                  <div className="absolute left-1/2 top-[1.5rem] h-6 w-[4.5rem] -translate-x-1/2 rotate-90">
                    <Rig className="h-6 w-[4.5rem] drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]" />
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
