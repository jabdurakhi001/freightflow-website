import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C } from './palette';
import { MONO, useSignFonts } from './fonts';
import { Arrow, Legend, Panel } from './GuideSign';

// The truck window on the right: the full 16:9 frame, feathered on its left,
// top and bottom edges so it melts into the blurred backdrop.
const WINDOW = { left: 340, width: 860, height: 484 };
const WINDOW_MASK = 'linear-gradient(90deg, transparent 0%, #000 22%), linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%)';

/**
 * 1200×630 social card: a physical guide sign beside the grey Cascadia from
 * the hero clip. Like the desktop hero, the whole frame sits in a feathered
 * window on the right, over a blurred backdrop of the same scene, so the sign
 * never covers the truck.
 */
export function OgCard() {
  useSignFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: '#0c110f' }}>
      <Img
        src={staticFile('og/backdrop.jpg')}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.1)' }}
      />
      <AbsoluteFill style={{ backgroundColor: 'rgba(0,0,0,0.38)' }} />
      <Img
        src={staticFile('og/frame.jpg')}
        style={{
          position: 'absolute',
          left: WINDOW.left,
          top: (630 - WINDOW.height) / 2 + 8,
          width: WINDOW.width,
          height: WINDOW.height,
          objectFit: 'cover',
          WebkitMaskImage: WINDOW_MASK,
          WebkitMaskComposite: 'source-in',
          maskImage: WINDOW_MASK,
          maskComposite: 'intersect',
        }}
      />
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(6,42,28,0.9) 0%, rgba(6,42,28,0.5) 40%, rgba(6,42,28,0) 58%)' }} />
      <AbsoluteFill style={{ padding: 48, justifyContent: 'center' }}>
        <Panel style={{ width: 590, padding: '46px 50px 40px', borderRadius: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <svg width={60} height={67} viewBox="0 0 100 112">
              <path d="M6 16 Q50 0 94 16 L94 54 Q94 92 50 110 Q6 92 6 54 Z" fill={C.white} />
              <path d="M12 20 Q50 7 88 20 L88 54 Q88 87 50 103 Q12 87 12 54 Z" fill={C.signDeep} />
              <text x="50" y="74" textAnchor="middle" fontFamily="Overpass" fontWeight={900} fontSize="38" fill={C.white}>
                48
              </text>
            </svg>
            <Legend style={{ fontSize: 19, opacity: 0.9 }}>Full truckload · Lower 48</Legend>
          </div>
          <div style={{ marginTop: 18, fontWeight: 900, fontSize: 80, lineHeight: 0.95, letterSpacing: '-0.035em' }}>FreightFlow</div>
          <div style={{ marginTop: 12, fontWeight: 700, fontSize: 27, opacity: 0.92 }}>Capacity you can plan around.</div>
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: `4px solid ${C.white}`, display: 'flex', gap: 40, alignItems: 'center' }}>
            {(
              [
                ['Chicago', 0],
                ['All 48 states', 45],
              ] as const
            ).map(([name, rot]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Arrow rotate={rot} size={38} />
                <span style={{ fontWeight: 900, fontSize: 34 }}>{name}</span>
              </div>
            ))}
          </div>
        </Panel>
        <div style={{ marginTop: 18, fontFamily: MONO, fontWeight: 600, fontSize: 18, letterSpacing: '0.14em', color: C.white, opacity: 0.85 }}>
          USDOT 4357973 · MC 1704871
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
