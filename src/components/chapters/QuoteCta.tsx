import { useQuoteModal } from '../../QuoteContext';
import { COMPANY } from '../../content';
import { useReveal } from './Chapter';

/** The last shot: the truck pulls away into the sunrise. */
export default function QuoteCta() {
  const { openQuote } = useQuoteModal();
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="quote" data-shot="cta" className="ch ch-cta" aria-labelledby="quote-title">
      <div className="ch-in">
        <div ref={ref} className="cta-copy reveal">
          <p className="kicker"><span>09</span>Get rolling</p>
          <h2 id="quote-title">Send us a lane.</h2>
          <p className="lede">Send the pickup, delivery, dates and equipment. The dispatch desk answers {COMPANY.hours}.</p>
          <div className="btn-row">
            <button type="button" className="btn solid big" onClick={() => openQuote()}>Get a quote</button>
          </div>
          <p className="cta-alt">
            Prefer email? <a href={`mailto:${COMPANY.email}?subject=Quote%20request`}>{COMPANY.email}</a>
          </p>
        </div>
      </div>
    </section>
  );
}
