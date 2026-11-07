import { useRef } from 'react';
import { COMPANY, PRACTICES } from '../../content';
import { useFlowSection } from '../flow/FlowContext';

export default function Compliance() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useFlowSection('compliance', sectionRef, stageRef);

  return (
    <section id="compliance" ref={sectionRef} className="sec" aria-labelledby="compliance-title">
      <div className="wrap">
        <h2 id="compliance-title">Check our authority yourself.</h2>
        <p className="lede">
          We hold active USDOT and MC authority for interstate commerce, with cargo and liability coverage. The FMCSA SAFER snapshot is public.
        </p>
        <div className="digits stage" ref={stageRef} aria-hidden="true">
          <span className="digits-fallback">{COMPANY.usdot}</span>
        </div>
        <div className="auth">
          <dl>
            <div><dt>USDOT number</dt><dd>{COMPANY.usdot}<span>Registered with FMCSA</span></dd></div>
            <div><dt>MC number</dt><dd>{COMPANY.mc}<span>Interstate operating authority</span></dd></div>
          </dl>
          <a className="btn" href={COMPANY.saferUrl} target="_blank" rel="noopener noreferrer">
            Verify on FMCSA SAFER<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <ul className="prac">
          {PRACTICES.map((p) => (
            <li key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
