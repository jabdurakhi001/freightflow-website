import { useRef } from 'react';
import { FLEET_SPECS } from '../../content';
import { useFlowSection } from '../flow/FlowContext';

const MARKS = [0, 10, 20, 30, 40, 50];

export default function Fleet() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useFlowSection('fleet', sectionRef, stageRef);

  return (
    <section id="fleet" ref={sectionRef} className="sec" aria-labelledby="fleet-title">
      <div className="wrap">
        <h2 id="fleet-title">One trailer length. New tractors only.</h2>
        <p className="lede">Every unit is a 2025–2027 Freightliner Cascadia pulling a 53′ dry van, with GPS and ELD on board.</p>
        <div className="bar stage" ref={stageRef} aria-hidden="true" />
        <div className="ruler" aria-hidden="true">
          {MARKS.map((ft) => (
            <span key={ft} className={ft === 50 ? 'hide-s' : undefined} style={{ left: `${(ft / 53) * 100}%` }}>
              {ft === 0 ? '0 ft' : ft}
            </span>
          ))}
          <span className="end">53 ft</span>
        </div>
        <p className="cap">The bar is the trailer’s 53-foot length, marked every 10 feet.</p>
        <dl className="specline">
          {FLEET_SPECS.map((s) => (
            <div key={s.k}><dt>{s.k}</dt><dd>{s.v}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  );
}
