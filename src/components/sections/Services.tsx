import { SERVICES } from '../../content';

export default function Services() {
  return (
    <section id="services" className="sec" aria-labelledby="services-title">
      <div className="wrap">
        <h2 id="services-title">Four ways we run your freight.</h2>
        <ul className="svc-list">
          {SERVICES.map((s) => (
            <li key={s.title} className="svc">
              <h3>{s.title}</h3>
              <p className="d">{s.tag}</p>
              <p>{s.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
