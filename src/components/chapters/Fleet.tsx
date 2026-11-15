import { FLEET_SPECS } from '../../content';
import Chapter from './Chapter';

/** The rig and its spec sheet. */
export default function Fleet() {
  return (
    <Chapter
      id="fleet" shot="fleet" n="06" kicker="Fleet" side="right"
      title="One trailer length. New tractors only."
      lede="Every unit is a 2025–2027 Freightliner Cascadia pulling a 53′ dry van, with GPS and ELD on board."
    >
      <dl className="specs">
        {FLEET_SPECS.map((s) => (
          <div key={s.k}><dt>{s.k}</dt><dd>{s.v}</dd></div>
        ))}
      </dl>
    </Chapter>
  );
}
