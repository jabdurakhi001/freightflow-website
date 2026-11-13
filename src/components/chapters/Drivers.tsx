import { COMPANY, DRIVER_BENEFITS } from '../../content';
import Chapter from './Chapter';

export default function Drivers() {
  return (
    <Chapter
      id="drivers" shot="drivers" n="07" kicker="Drivers" wide
      title="Hiring CDL-A drivers around Chicago."
      lede="Structured scheduling out of Chicago, a dedicated dispatcher, and 2025–2027 Freightliner Cascadias."
    >
      <ul className="grid2 feat">
        {DRIVER_BENEFITS.map((b) => (
          <li key={b.title}>
            <h3>{b.title}</h3>
            <p>{b.body}</p>
          </li>
        ))}
      </ul>
      <div className="btn-row"><a className="btn solid" href={COMPANY.applyUrl}>Apply to drive</a></div>
    </Chapter>
  );
}
