import { useRef } from 'react';
import { PLATFORM } from '../../content';
import { useFlowSection } from '../flow/FlowContext';

/** Two columns: the list beside the "one system" orbit drawn by the particles. */
export default function Platform() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useFlowSection('platform', sectionRef, stageRef);

  return (
    <section id="platform" ref={sectionRef} className="sec" aria-labelledby="platform-title">
      <div className="wrap plat">
        <div>
          <h2 id="platform-title">One system, and we run it.</h2>
          <p className="lede">AI agents, live GPS, digital proof of delivery, routing and maintenance, all on the dispatch platform we run ourselves.</p>
          <ul className="feat">
            {PLATFORM.map((f) => (
              <li key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="plat-visual">
          <div className="orbit stage" ref={stageRef} aria-hidden="true">
            <span className="orbit-l">Dispatch platform</span>
          </div>
          <p className="cap">Illustration: loads, trucks, drivers and documents circling one system.</p>
        </div>
      </div>
    </section>
  );
}
