import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import SectionTitle from '../ui/SectionTitle';
import { rise, stagger } from '../../lib/motion';

const MESSAGES: [string, string][] = [
  ['GPS TRACKING', 'ON EVERY LOAD'],
  ['DIGITAL POD', 'AT DELIVERY'],
  ['LIVE ROUTING', 'TRAFFIC+WEATHER'],
  ['HOS MONITORED', 'BY DISPATCH'],
  ['MAINTENANCE', 'ON SCHEDULE'],
];

const FEATURES = [
  { title: 'Automated dispatch', body: 'Loads are assigned and confirmed in the system — no phone tag, no waiting on callbacks.' },
  { title: 'Real-time tracking', body: 'Live GPS and milestone updates for everyone who needs to know where the freight is.' },
  { title: 'Routing for conditions', body: 'Routes planned around live traffic and weather, not last year’s map.' },
  { title: 'Scheduled maintenance', body: 'Data-driven service intervals that protect uptime on every truck.' },
  { title: 'Paperless documents', body: 'Load documents and proof of delivery stored digitally and available the moment you need them.' },
];

const GLYPHS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789+#';
const WIDTH = 15;

/** Resolves `target` left to right through random glyphs, like a VMS repainting. */
function useScramble(target: string, enabled: boolean) {
  const [text, setText] = useState(target);
  useEffect(() => {
    if (!enabled) {
      setText(target);
      return;
    }
    let frame = 0;
    const total = 16;
    const id = window.setInterval(() => {
      frame += 1;
      const settled = Math.floor((frame / total) * target.length);
      setText(
        target
          .split('')
          .map((ch, i) => (ch === ' ' || i < settled ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      );
      if (frame >= total) {
        window.clearInterval(id);
        setText(target);
      }
    }, 38);
    return () => window.clearInterval(id);
  }, [target, enabled]);
  return text;
}

const centre = (s: string) => {
  const pad = Math.max(0, WIDTH - s.length);
  return ' '.repeat(Math.floor(pad / 2)) + s + ' '.repeat(Math.ceil(pad / 2));
};

function Board() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);

  // Cycle while on screen; hover holds the current message.
  useEffect(() => {
    if (!inView || hover) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 3400);
    return () => window.clearInterval(id);
  }, [inView, hover]);

  const animate = inView && !reduceMotion;
  const line1 = useScramble(centre(MESSAGES[index][0]), animate);
  const line2 = useScramble(centre(MESSAGES[index][1]), animate);

  return (
    <div ref={ref} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {/* Gantry: truss over two posts, board hung in the middle */}
      <div aria-hidden="true" className="relative mx-auto max-w-xl">
        <div className="h-3 rounded-sm bg-[repeating-linear-gradient(135deg,#7c837f_0_6px,#5d6460_6px_12px)] shadow-[0_2px_0_#3d4440]" />
        <div className="mx-auto mt-0 flex w-[88%] justify-between">
          <span className="h-3 w-1.5 bg-[#5d6460]" />
          <span className="h-3 w-1.5 bg-[#5d6460]" />
        </div>
        <div className="rounded-lg bg-[#050706] p-3 shadow-[inset_0_0_0_3px_#2a302d,0_30px_60px_-30px_rgba(0,0,0,0.9)] sm:p-4">
          <div className="rounded bg-[radial-gradient(rgba(255,178,26,0.07)_1px,transparent_1.4px)] bg-[length:7px_7px] px-3 py-5 sm:px-6 sm:py-7">
            <p className="led whitespace-pre text-center text-[clamp(1.35rem,4.4vw,2.45rem)] leading-[1.25]">{line1}</p>
            <p className="led whitespace-pre text-center text-[clamp(1.35rem,4.4vw,2.45rem)] leading-[1.25]">{line2}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-center gap-2" aria-label="Sign messages" role="group">
        {MESSAGES.map((m, i) => (
          <button
            key={m[0]}
            type="button"
            aria-pressed={i === index}
            aria-label={`${m[0]} ${m[1]}`.toLowerCase()}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all ${i === index ? 'w-8 bg-led' : 'w-2.5 bg-white/25 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function SystemsBoard() {
  return (
    <section id="systems" className="relative overflow-hidden bg-sign-ink py-24 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <SectionTitle
            marker="MM 04"
            kicker="Systems"
            title="Run on systems, not spreadsheets."
            lede="Structured workflows, automation and real-time data sit behind every load. The result: more control, fewer delays, and execution you can predict."
            onDark
          />
          <Board />
        </div>

        <motion.ul
          className="mt-20 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2 lg:grid-cols-5"
          variants={stagger(0.07)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {FEATURES.map((f, i) => (
            <motion.li key={f.title} variants={rise} className="bg-sign-ink p-6">
              <span className="legend text-led">S-{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-lg font-black tracking-tight">{f.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-white/68">{f.body}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
