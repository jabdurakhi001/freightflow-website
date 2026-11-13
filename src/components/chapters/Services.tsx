import { SERVICES } from '../../content';
import Chapter from './Chapter';

export default function Services() {
  return (
    <Chapter id="services" shot="services" n="01" kicker="Services" title="Four ways we run your freight." wide>
      <ul className="grid2 svc">
        {SERVICES.map((s) => (
          <li key={s.title}>
            <p className="tag">{s.tag}</p>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ul>
      <p className="cap">Illustration: one shipper’s freight in a 53′ dry van.</p>
    </Chapter>
  );
}
