import { useRef } from 'react';
import { COMPANY, DRIVER_BENEFITS } from '../../content';
import { useFlowSection } from '../flow/FlowContext';

export default function Drivers() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useFlowSection('drivers', sectionRef, stageRef);

  return (
    <section id="drivers" ref={sectionRef} className="sec" aria-labelledby="drivers-title">
      <div className="wrap drv">
        <div>
          <h2 id="drivers-title">Hiring CDL-A drivers around Chicago.</h2>
          <p className="lede">Structured scheduling out of Chicago, a dedicated dispatcher, and 2025–2027 Freightliner Cascadias.</p>
          <ul className="ben">
            {DRIVER_BENEFITS.map((b) => (
              <li key={b.title}>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </li>
            ))}
          </ul>
          <a className="btn solid" href={COMPANY.applyUrl}>Apply to drive</a>
        </div>
        <div>
          <div className="loops stage" ref={stageRef} aria-hidden="true">
            <span className="hub-l">{COMPANY.hub}</span>
          </div>
          <p className="cap">Illustration: runs that leave the hub and come back to it.</p>
        </div>
      </div>
    </section>
  );
}
