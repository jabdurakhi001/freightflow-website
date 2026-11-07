import { useRef } from 'react';
import { useQuoteModal } from '../../QuoteContext';
import { COMPANY } from '../../content';
import { useFlowSection } from '../flow/FlowContext';

export default function QuoteCta() {
  const { openQuote } = useQuoteModal();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useFlowSection('cta', sectionRef, stageRef);

  return (
    <section id="quote" ref={sectionRef} className="sec cta" aria-labelledby="quote-title">
      <div className="wrap">
        <h2 id="quote-title">Send us a lane.</h2>
        <p className="lede">
          Send the pickup, delivery, dates and equipment. The dispatch desk answers {COMPANY.hours}.
        </p>
        <div className="cta-row">
          <div className="cta-flow stage" ref={stageRef} aria-hidden="true" />
          <button type="button" className="btn solid" onClick={() => openQuote()}>Get a quote</button>
        </div>
        <p className="cta-alt">
          Prefer email? <a href={`mailto:${COMPANY.email}?subject=Quote%20request`}>{COMPANY.email}</a>
        </p>
      </div>
    </section>
  );
}
