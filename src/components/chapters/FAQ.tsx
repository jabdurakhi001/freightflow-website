import { COMPANY, FAQS, openChat } from '../../content';
import Chapter from './Chapter';

/** The FAQPage JSON-LD is static in index.html (so crawlers see it without JS); a test keeps it in sync with FAQS. */
export default function FAQ() {
  return (
    <Chapter id="faq" shot="faq" n="08" kicker="FAQ" title="Questions, answered." wide className="ch-faq">
      <div className="faq-list">
        {FAQS.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>
              {f.a}
              {f.link && (
                <>
                  {' '}
                  <a href={f.link.href} {...(f.link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {f.link.label}
                    {f.link.external && <span className="sr-only"> (opens in a new tab)</span>}
                  </a>
                  .
                </>
              )}
            </p>
          </details>
        ))}
      </div>
      <div className="faq-more">
        <p>
          Something we didn’t cover? Our AI chat assistant answers 24/7 and hands you to a dispatcher when it can’t help.
          Or email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
        </p>
        <div className="btn-row">
          <button type="button" className="btn" onClick={openChat}>Chat with us</button>
        </div>
      </div>
    </Chapter>
  );
}
