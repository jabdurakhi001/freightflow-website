import { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';

/*
 * Hero reveal: the existing 64-frame sketch→photo footage, slowed and
 * frame-blended, with a blueprint layer (grid, perspective construction lines,
 * title block) over the sketch and spec callouts on the finished truck.
 * Every overlay fades out before the last frame, so the clip ends on the
 * clean photo and hands over to the site's HTML headline.
 *
 * All motion is derived from useCurrentFrame() — no CSS transitions — so each
 * rendered frame is deterministic.
 */

export const HERO_FPS = 30;
// 5s: autoplaying motion that stops within 5 seconds needs no pause control (WCAG 2.2.2).
export const HERO_DURATION = 150;

const SOURCE_FRAMES = 64;
const ORANGE = '#FF5A1F';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';

const frameSrc = (i: number) => staticFile(`hero-frames/w1280/frame-${String(i + 1).padStart(3, '0')}.webp`);

/**
 * Footage playhead: lingers on the sketch (~1.5s, while the blueprint draws),
 * resolves to the photo by ~2.4s, then decelerates and holds from ~3.7s.
 */
const useSourceIndex = (frame: number) =>
  interpolate(frame, [0, 112], [0, SOURCE_FRAMES - 1], {
    easing: Easing.bezier(0.6, 0, 0.3, 1),
    extrapolateRight: 'clamp',
  });

/** Two adjacent source frames cross-blended, so the slowed footage doesn't step. */
function Footage({ index }: { index: number }) {
  const a = Math.floor(index);
  const b = Math.min(a + 1, SOURCE_FRAMES - 1);
  const t = index - a;
  const style = { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover' as const };
  return (
    <AbsoluteFill>
      <Img src={frameSrc(a)} style={style} />
      {t > 0.01 && <Img src={frameSrc(b)} style={{ ...style, opacity: t }} />}
    </AbsoluteFill>
  );
}

/** Drafting grid over the sketch phase. */
function BlueprintGrid({ opacity }: { opacity: number }) {
  const line = 'rgba(255,255,255,0.09)';
  const major = 'rgba(255,90,31,0.16)';
  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundImage: [
          `linear-gradient(${major} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${major} 1px, transparent 1px)`,
          `linear-gradient(${line} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${line} 1px, transparent 1px)`,
        ].join(','),
        backgroundSize: '160px 160px, 160px 160px, 32px 32px, 32px 32px',
        mixBlendMode: 'multiply',
      }}
    />
  );
}

// Vanishing point of the sketch's road, and the construction lines fanning out of it.
const VP = { x: 252, y: 404 };
const RAYS = [
  { x: 1280, y: 404 },
  { x: 1280, y: 720 },
  { x: 940, y: 720 },
  { x: 0, y: 720 },
  { x: 1280, y: 560 },
  { x: 1280, y: 250 },
];

function ConstructionLines({ frame, opacity }: { frame: number; opacity: number }) {
  return (
    <svg width={1280} height={720} style={{ position: 'absolute', inset: 0, opacity }}>
      {RAYS.map((r, i) => {
        const draw = interpolate(frame, [6 + i * 5, 40 + i * 5], [0, 1], {
          easing: Easing.out(Easing.cubic),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <line
            key={i}
            x1={VP.x}
            y1={VP.y}
            x2={r.x}
            y2={r.y}
            pathLength={1}
            stroke={i === 0 ? ORANGE : 'rgba(255,90,31,0.55)'}
            strokeWidth={i === 0 ? 1.5 : 1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - draw}
          />
        );
      })}
      {/* Vanishing-point target */}
      <circle cx={VP.x} cy={VP.y} r={interpolate(frame, [4, 18], [0, 7], { extrapolateRight: 'clamp' })} fill="none" stroke={ORANGE} strokeWidth={1.5} />
      <line x1={VP.x - 14} y1={VP.y} x2={VP.x + 14} y2={VP.y} stroke={ORANGE} strokeWidth={1} />
      <line x1={VP.x} y1={VP.y - 14} x2={VP.x} y2={VP.y + 14} stroke={ORANGE} strokeWidth={1} />
    </svg>
  );
}

/** Drawing-sheet crop marks in each corner. */
function CropMarks({ opacity }: { opacity: number }) {
  const m = 28;
  const l = 22;
  const corners: [number, number, number, number][] = [
    [m, m, 1, 1],
    [1280 - m, m, -1, 1],
    [m, 720 - m, 1, -1],
    [1280 - m, 720 - m, -1, -1],
  ];
  return (
    <svg width={1280} height={720} style={{ position: 'absolute', inset: 0, opacity }}>
      {corners.map(([x, y, dx, dy], i) => (
        <path key={i} d={`M ${x + dx * l} ${y} L ${x} ${y} L ${x} ${y + dy * l}`} fill="none" stroke="rgba(255,90,31,0.8)" strokeWidth={1.5} />
      ))}
    </svg>
  );
}

/** Drawing title block, bottom right — the sheet's "this was engineered" signature. */
function TitleBlock({ frame, opacity }: { frame: number; opacity: number }) {
  const rows = [
    ['DWG', 'FF-01 · LINEHAUL UNIT'],
    ['MODEL', 'FREIGHTLINER CASCADIA'],
    ['SCOPE', '48 STATES · CHI / DAL'],
  ];
  return (
    <div
      style={{
        position: 'absolute',
        right: 56,
        bottom: 56,
        opacity,
        border: `1px solid rgba(255,90,31,0.85)`,
        background: 'rgba(10,17,40,0.72)',
        fontFamily: MONO,
        color: 'white',
        fontSize: 12,
        letterSpacing: '0.14em',
        minWidth: 300,
      }}
    >
      {rows.map(([k, v], i) => {
        const appear = interpolate(frame, [14 + i * 6, 24 + i * 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <div
            key={k}
            style={{
              display: 'flex',
              gap: 16,
              padding: '8px 14px',
              borderTop: i ? '1px solid rgba(255,90,31,0.35)' : undefined,
              opacity: appear,
              transform: `translateX(${(1 - appear) * 8}px)`,
            }}
          >
            <span style={{ color: ORANGE, width: 52, fontWeight: 600 }}>{k}</span>
            <span>{v}</span>
          </div>
        );
      })}
    </div>
  );
}

// Callouts on the finished truck. The truck is still settling when they start, so
// each anchor is measured on source frame 52 (`from`) and on the final frame
// (`anchor`) and tracks between the two with the playhead. Each leader runs
// vertically from the anchor to the label's row, then across to the label, which
// sits on the `side` of that end point. Labels stay inside x ≤ 1236 so a 16:10
// cover-crop on the site doesn't clip them.
type Side = 'left' | 'right';
type Pt = { x: number; y: number };
const CALLOUTS: { from: Pt; anchor: Pt; label: { x: number; y: number }; side: Side; idx: string; text: string }[] = [
  { from: { x: 850, y: 185 }, anchor: { x: 880, y: 203 }, label: { x: 930, y: 112 }, side: 'right', idx: '01', text: 'FREIGHTLINER CASCADIA' },
  { from: { x: 1140, y: 363 }, anchor: { x: 1172, y: 376 }, label: { x: 1164, y: 186 }, side: 'left', idx: '02', text: 'MODEL YEAR 2025–26' },
  { from: { x: 750, y: 320 }, anchor: { x: 805, y: 338 }, label: { x: 850, y: 640 }, side: 'right', idx: '03', text: 'GPS + ELD' },
];

function Callout({
  from,
  anchor: final,
  label,
  side,
  idx,
  text,
  progress,
  opacity,
  src,
}: (typeof CALLOUTS)[number] & { progress: number; opacity: number; src: number }) {
  const track = interpolate(src, [52, 63], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const anchor = { x: from.x + (final.x - from.x) * track, y: from.y + (final.y - from.y) * track };
  // Elbow leader: rise vertically from the anchor, then run across to the label.
  const elbow = { x: anchor.x, y: label.y };
  const legA = Math.abs(elbow.y - anchor.y);
  const legB = Math.abs(label.x - elbow.x);
  const total = legA + legB || 1;
  const drawn = interpolate(progress, [0, 0.7], [0, total], { extrapolateRight: 'clamp' });
  const textIn = interpolate(progress, [0.55, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dot = interpolate(progress, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      <svg width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
        <path
          d={`M ${anchor.x} ${anchor.y} L ${elbow.x} ${elbow.y} L ${label.x} ${label.y}`}
          fill="none"
          stroke="white"
          strokeOpacity={0.85}
          strokeWidth={1.25}
          strokeDasharray={total}
          strokeDashoffset={total - drawn}
        />
        <circle cx={anchor.x} cy={anchor.y} r={5 * dot} fill={ORANGE} />
        <circle cx={anchor.x} cy={anchor.y} r={11 * dot} fill="none" stroke={ORANGE} strokeOpacity={0.6} strokeWidth={1.5} />
      </svg>
      <div
        style={{
          position: 'absolute',
          ...(side === 'right' ? { left: label.x + 8 } : { right: 1280 - label.x + 8 }),
          top: label.y - 13,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '5px 10px',
          background: 'rgba(10,17,40,0.78)',
          fontFamily: MONO,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.16em',
          color: 'white',
          whiteSpace: 'nowrap',
          opacity: textIn,
          transform: `translateX(${(1 - textIn) * (side === 'right' ? 10 : -10)}px)`,
        }}
      >
        <span style={{ color: ORANGE }}>{idx}</span>
        {text}
      </div>
    </div>
  );
}

export function HeroReveal() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Hold the render until the mono font is ready, so labels never flash a fallback face.
  const [fontHandle] = useState(() => delayRender('IBM Plex Mono'));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`500 12px "IBM Plex Mono"`),
      document.fonts.load(`600 12px "IBM Plex Mono"`),
    ]).finally(() => continueRender(fontHandle));
  }, [fontHandle]);

  const src = useSourceIndex(frame);

  // Blueprint layer lives while the footage is still a sketch, then dissolves as the photo resolves.
  const blueprint = interpolate(src, [0, 3, 18, 28], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

  // Everything clears in the last second so the clip ends on the clean photo.
  const outro = interpolate(frame, [134, 148], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Callouts start once the truck has settled into its final position.
  const calloutStart = 76;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0A1128' }}>
      <Footage index={src} />
      <BlueprintGrid opacity={blueprint * 0.9} />
      <ConstructionLines frame={frame} opacity={blueprint} />
      <CropMarks opacity={Math.min(blueprint, 1) * 0.9} />
      <TitleBlock frame={frame} opacity={blueprint} />
      {CALLOUTS.map((c, i) => {
        const progress = spring({
          frame: frame - calloutStart - i * 8,
          fps,
          config: { damping: 200 },
          durationInFrames: 24,
        });
        return <Callout key={c.idx} {...c} progress={progress} opacity={outro} src={src} />;
      })}
    </AbsoluteFill>
  );
}
