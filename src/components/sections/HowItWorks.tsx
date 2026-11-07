import { useRef } from 'react';
import { HOW } from '../../content';
import { useFlowSection } from '../flow/FlowContext';

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useFlowSection('how', sectionRef, stageRef);

  return (
    <section id="how-it-works" ref={sectionRef} className="sec" aria-labelledby="how-title">
      <div className="wrap">
        <h2 id="how-title">{HOW.title}</h2>
        <p className="lede">{HOW.lede}</p>
        <div className="how-flow stage" ref={stageRef} aria-hidden="true">
          <span className="fl" style={{ left: 0, top: 0 }}><b>Loads</b><span className="hide-s">your quote requests</span></span>
          <span className="fl" style={{ left: 0, bottom: 0 }}><b>Trucks and drivers</b><span className="hide-s">available capacity</span></span>
          <span className="fl" style={{ left: '34%', top: 0, transform: 'translateX(-50%)' }}><b>AI agents</b>match and propose</span>
          <span className="fl gate" style={{ left: '60%', bottom: 0, transform: 'translateX(-50%)' }}><b>Dispatcher</b>approves every one</span>
          <span className="fl" style={{ right: 0, top: 0, textAlign: 'right' }}><b>On the road</b>tracked to delivery</span>
        </div>
        <p className="cap">Illustration: proposals queue at the dispatcher and move only once approved.</p>
        <ol className="steps">
          {HOW.steps.map((s) => (
            <li key={s.title} className={s.human ? 'hum' : undefined}>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
