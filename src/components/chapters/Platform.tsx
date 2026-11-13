import { PLATFORM } from '../../content';
import Chapter from './Chapter';

export default function Platform() {
  return (
    <Chapter
      id="platform" shot="platform" n="04" kicker="Platform" side="right" wide
      title="One system, and we run it."
      lede="AI agents, live GPS, digital proof of delivery, routing and maintenance, all on the dispatch platform we run ourselves."
    >
      <ul className="grid2 feat">
        {PLATFORM.map((f) => (
          <li key={f.title}>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </li>
        ))}
      </ul>
      <p className="cap">Illustration: lanes out of the Chicago hub, not live loads.</p>
    </Chapter>
  );
}
