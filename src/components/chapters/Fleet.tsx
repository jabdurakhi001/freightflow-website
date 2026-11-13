import { useRef } from 'react';
import { FLEET_SPECS } from '../../content';
import { useDrive, useDriveMode } from '../drive/DriveContext';
import Chapter from './Chapter';

/** The rig as a blueprint. The open half of the screen is a drag pad that turns the camera around it. */
export default function Fleet() {
  const drive = useDrive();
  const mode = useDriveMode();
  const drag = useRef<{ x: number; id: number } | null>(null);
  const interactive = mode !== 'static' && mode !== 'pending';
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
      {interactive && (
        <>
          <p className="cap drag-hint">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4" /></svg>
            Drag the drawing to turn the rig.
          </p>
          <div
            className="orbit-pad" aria-hidden="true"
            onPointerDown={(e) => { drag.current = { x: e.clientX, id: e.pointerId }; e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.classList.add('is-drag'); }}
            onPointerMove={(e) => { const d = drag.current; if (!d || d.id !== e.pointerId) return; drive.orbit((d.x - e.clientX) * 0.0045); d.x = e.clientX; }}
            onPointerUp={(e) => { drag.current = null; e.currentTarget.classList.remove('is-drag'); }}
            onPointerCancel={(e) => { drag.current = null; e.currentTarget.classList.remove('is-drag'); }}
          />
        </>
      )}
    </Chapter>
  );
}
