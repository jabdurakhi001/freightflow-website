import { AbsoluteFill } from 'remotion';
import { C } from './palette';
import { MONO, SANS, useSignFonts } from './fonts';
import { Arrow, Legend, Panel } from './GuideSign';

/** 1200×630 social card: one big guide sign over asphalt. */
export function OgCard() {
  useSignFonts();
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #0a2d20 0%, #06180f 100%)`,
        fontFamily: SANS,
        padding: 60,
        justifyContent: 'center',
      }}
    >
      {/* Lane line along the bottom */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 34,
          height: 8,
          backgroundImage: `repeating-linear-gradient(90deg, ${C.lane} 0 56px, transparent 56px 104px)`,
          opacity: 0.85,
        }}
      />
      <Panel style={{ padding: '52px 60px 48px', borderRadius: 24, boxShadow: `inset 0 0 0 9px ${C.sign}, inset 0 0 0 14px ${C.white}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <svg width={74} height={83} viewBox="0 0 100 112">
            <path d="M6 16 Q50 0 94 16 L94 54 Q94 92 50 110 Q6 92 6 54 Z" fill={C.white} />
            <path d="M12 20 Q50 7 88 20 L88 54 Q88 87 50 103 Q12 87 12 54 Z" fill={C.signDeep} />
            <text x="50" y="74" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="38" fill={C.white}>
              48
            </text>
          </svg>
          <Legend style={{ fontSize: 22, opacity: 0.9 }}>Full truckload · Lower 48</Legend>
        </div>
        <div style={{ marginTop: 22, fontWeight: 900, fontSize: 104, lineHeight: 0.95, letterSpacing: '-0.035em' }}>
          FreightFlow
        </div>
        <div style={{ marginTop: 14, fontWeight: 700, fontSize: 34, opacity: 0.9 }}>Capacity you can plan around.</div>
        <div
          style={{
            marginTop: 30,
            paddingTop: 22,
            borderTop: `4px solid ${C.white}`,
            display: 'flex',
            gap: 56,
            alignItems: 'center',
          }}
        >
          {[
            ['Chicago', 0],
            ['Dallas', 45],
          ].map(([name, rot]) => (
            <div key={name as string} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Arrow rotate={rot as number} size={44} />
              <span style={{ fontWeight: 900, fontSize: 40 }}>{name}</span>
            </div>
          ))}
          <span style={{ marginLeft: 'auto', fontFamily: MONO, fontWeight: 600, fontSize: 20, letterSpacing: '0.12em', opacity: 0.8 }}>
            USDOT 4357973 · MC 1704871
          </span>
        </div>
      </Panel>
    </AbsoluteFill>
  );
}
