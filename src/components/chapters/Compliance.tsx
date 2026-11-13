import { COMPANY, PRACTICES } from '../../content';
import Chapter from './Chapter';

export default function Compliance() {
  return (
    <Chapter
      id="compliance" shot="compliance" n="05" kicker="Compliance" wide
      title="Check our authority yourself."
      lede="We hold active USDOT and MC authority for interstate commerce, with cargo and liability coverage. The FMCSA SAFER snapshot is public."
    >
      <div className="auth">
        <dl>
          <div><dt>USDOT number</dt><dd>{COMPANY.usdot}<span>Registered with FMCSA</span></dd></div>
          <div><dt>MC number</dt><dd>{COMPANY.mc}<span>Interstate operating authority</span></dd></div>
        </dl>
        <a className="btn" href={COMPANY.saferUrl} target="_blank" rel="noopener noreferrer">
          Verify on FMCSA SAFER<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
      <ul className="grid2 feat">
        {PRACTICES.map((p) => (
          <li key={p.title}>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </li>
        ))}
      </ul>
    </Chapter>
  );
}
