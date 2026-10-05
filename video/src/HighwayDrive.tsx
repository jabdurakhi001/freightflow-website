import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from './palette';
import { useSignFonts } from './fonts';
import { Arrow, Legend, Panel } from './GuideSign';

/*
 * An illustrated dusk drive down a two-lane interstate, seen from the cab.
 * Overhead gantries carrying FreightFlow guide signs pass every 4 seconds.
 *
 * Everything is a pure function of the frame: a pinhole projection of a
 * world where the road moves toward the camera. All periodic things (lane
 * dashes, reflector posts, gantries, camera bob) repeat on periods that divide
 * the 240-frame duration, so the clip loops seamlessly.
 */

export const DRIVE_FPS = 30;
export const DRIVE_FRAMES = 240; // 8s

// World units are metres. Loop length: 240 frames × 0.9 m = 216 m, which every
// period below divides.
const SPEED = 0.9; // m per frame (≈ 60 mph at 30 fps)
const DASH_PERIOD = 12; // 3 m dash, 9 m gap
const DASH_LEN = 3;
const POST_PERIOD = 24;
const POLE_PERIOD = 36;
const GANTRY_GAP = 108; // one gantry per 120 frames; two designs alternate → 240-frame cycle
const FAR = 600;
const FOG_START = 105;
const FOG_END = 150;
const CAM_H = 2.5; // truck cab eye height

// Road cross-section (camera sits in the right lane at X = 0).
const ROAD_L = -6.2;
const ROAD_R = 4.2;
const YELLOW_EDGE = -5.4;
const LANE_DIVIDER = -1.8;
const WHITE_EDGE = 1.8;
const LINE_W = 0.15;

// Gantry geometry
const POST_L = -7.6;
const POST_R = 5.4;
const BEAM_TOP = 7.5;
const BEAM_BOTTOM = 6.7;
const SIGN_W = 4.6;
const SIGN_H = 2.3;
const SIGN_TOP = 8.3;
const SIGN_PX = 520 / SIGN_W; // DOM px per metre at scale 1 → 520×260 sign
const SIGN_CENTRES = [-3.1, 1.9]; // left / right lane, 0.4 m apart

export type DriveProps = {
  /** Vanishing point as a fraction of width / height. */
  vpX: number;
  horizon: number;
  /** Focal length as a fraction of the frame's shorter side. */
  focal: number;
};

export function HighwayDrive({ vpX, horizon, focal }: DriveProps) {
  useSignFonts();
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();

  const f = focal * Math.min(W, H);
  const vx = vpX * W;
  const hy = horizon * H;
  const camH = CAM_H + 0.02 * Math.sin((2 * Math.PI * frame) / 80);
  const travel = frame * SPEED;

  const sx = (X: number, Z: number) => vx + (f * X) / Z;
  const sy = (Y: number, Z: number) => hy - (f * (Y - camH)) / Z;
  const fog = (Z: number) => interpolate(Z, [FOG_START, FOG_END], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  /** Flat quad on the road surface between lateral x0..x1 and depth z0..z1. */
  const groundQuad = (x0: number, x1: number, z0: number, z1: number) =>
    [
      [sx(x0, z0), sy(0, z0)],
      [sx(x1, z0), sy(0, z0)],
      [sx(x1, z1), sy(0, z1)],
      [sx(x0, z1), sy(0, z1)],
    ]
      .map((p) => p.join(','))
      .join(' ');

  const NEAR = 1;

  // Lane dashes
  const dashes: ReactNode[] = [];
  for (let k = 0; k < FAR / DASH_PERIOD + 2; k++) {
    const z0 = k * DASH_PERIOD - (travel % DASH_PERIOD);
    const z1 = z0 + DASH_LEN;
    if (z1 <= NEAR || z0 > FAR) continue;
    dashes.push(
      <polygon
        key={k}
        points={groundQuad(LANE_DIVIDER - LINE_W / 2, LANE_DIVIDER + LINE_W / 2, Math.max(z0, NEAR), z1)}
        fill={C.white}
        opacity={fog(z0)}
      />,
    );
  }

  // Delineator posts on both shoulders
  const posts: ReactNode[] = [];
  for (let k = 0; k < FAR / POST_PERIOD + 2; k++) {
    for (const [side, X, offset] of [
      ['r', ROAD_R + 0.6, 0],
      ['l', ROAD_L - 0.6, POST_PERIOD / 2],
    ] as const) {
      const z = k * POST_PERIOD + offset - (travel % POST_PERIOD);
      if (z <= 1 || z > FOG_END) continue;
      const x = sx(X, z);
      const w = Math.max(1.5, (f * 0.12) / z);
      const top = sy(1.1, z);
      const bottom = sy(0, z);
      posts.push(
        <g key={`${side}${k}`} opacity={fog(z)}>
          <rect x={x - w / 2} y={top} width={w} height={bottom - top} fill="#d9ddd9" />
          <rect x={x - w / 2} y={top} width={w} height={(bottom - top) * 0.22} fill={side === 'r' ? C.cone : C.lane} />
        </g>,
      );
    }
  }

  // Median light poles with an arm over the left lane and a lamp glow
  const poles: ReactNode[] = [];
  for (let k = 0; k < FOG_END / POLE_PERIOD + 2; k++) {
    const z = k * POLE_PERIOD + 6 - (travel % POLE_PERIOD);
    if (z <= 1.2 || z > FOG_END) continue;
    const X = ROAD_L - 1.2;
    const w = Math.max(1.2, (f * 0.22) / z);
    const top = sy(10, z);
    const lampX = sx(X + 2.6, z);
    const lampY = sy(9.6, z);
    const glow = (f * 1.6) / z;
    poles.push(
      <g key={k} opacity={fog(z)}>
        <rect x={sx(X, z) - w / 2} y={top} width={w} height={sy(0, z) - top} fill="#59605c" />
        <line x1={sx(X, z)} y1={top} x2={lampX} y2={lampY} stroke="#59605c" strokeWidth={w * 0.7} strokeLinecap="round" />
        <circle cx={lampX} cy={lampY} r={glow} fill="url(#lamp)" />
        <circle cx={lampX} cy={lampY} r={Math.max(1, glow * 0.14)} fill="#fff6e0" />
      </g>,
    );
  }

  // Gantries, far to near
  const firstN = Math.floor(travel / GANTRY_GAP);
  const gantries: { n: number; z: number }[] = [];
  for (let n = firstN; n < firstN + 3; n++) {
    // Phase puts a gantry at ~27 m on frame 0, so the poster (frame 0) shows a readable sign.
    const z = n * GANTRY_GAP + GANTRY_GAP * 0.25 - travel;
    if (z > 1.5 && z < FOG_END) gantries.push({ n, z });
  }
  gantries.sort((a, b) => b.z - a.z);

  const signsFor = (design: number) =>
    design === 0
      ? [
          <SignBody key="chi" title="Chicago" legend="Dispatch hub" arrow={180} />,
          <SignBody key="dal" title="Dallas" legend="Dispatch hub" arrow={180} />,
        ]
      : [
          <SignBody key="48" title="All 48 States" legend="Full truckload" arrow={0} />,
          <SignBody key="ff" title="FreightFlow" legend="Next exit · ½ mile" arrow={45} exitTab />,
        ];

  return (
    <AbsoluteFill style={{ background: '#04140e', overflow: 'hidden' }}>
      {/* Sky: deep sign-green night overhead, work-zone orange glow on the horizon */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${W * 0.75}px ${H * 0.32}px at ${vx}px ${hy}px, rgba(242,106,27,0.55), rgba(242,106,27,0.12) 55%, transparent 75%), linear-gradient(180deg, #03100b 0%, #0a2d20 ${horizon * 55}%, #174a35 ${horizon * 92}%, #2c5a40 ${horizon * 100}%)`,
        }}
      />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="road" x1="0" y1={hy} x2="0" y2={H} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={C.asphaltFar} />
            <stop offset="1" stopColor={C.asphalt} />
          </linearGradient>
          <radialGradient id="lamp">
            <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="grass" x1="0" y1={hy} x2="0" y2={H} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#123a29" />
            <stop offset="1" stopColor="#06180f" />
          </linearGradient>
        </defs>

        {/* Low sun behind the far hills */}
        <circle cx={vx + W * 0.09} cy={hy - H * 0.012} r={Math.min(W, H) * 0.06} fill="#ff9a52" opacity={0.85} />

        {/* Distant skyline at the vanishing point, a few windows lit */}
        <Skyline cx={vx} baseY={hy - H * 0.004} unit={Math.min(W, H) * 0.011} />

        {/* Hills: two silhouettes for depth */}
        <path
          d={`M0 ${hy} L0 ${hy - H * 0.05} C ${W * 0.18} ${hy - H * 0.11}, ${W * 0.3} ${hy - H * 0.02}, ${W * 0.46} ${hy - H * 0.06} S ${W * 0.78} ${hy - H * 0.015}, ${W} ${hy - H * 0.07} L ${W} ${hy} Z`}
          fill="#0f3a29"
        />
        <path
          d={`M0 ${hy} L0 ${hy - H * 0.022} C ${W * 0.22} ${hy - H * 0.05}, ${W * 0.4} ${hy}, ${W * 0.6} ${hy - H * 0.03} S ${W * 0.9} ${hy - H * 0.01}, ${W} ${hy - H * 0.035} L ${W} ${hy} Z`}
          fill="#0a2a1d"
        />

        {/* Ground and road */}
        <rect x={0} y={hy} width={W} height={H - hy} fill="url(#grass)" />
        <polygon points={groundQuad(ROAD_L, ROAD_R, NEAR, FAR * 4)} fill="url(#road)" />
        <polygon points={groundQuad(YELLOW_EDGE - LINE_W / 2, YELLOW_EDGE + LINE_W / 2, NEAR, FAR * 4)} fill={C.lane} />
        <polygon points={groundQuad(WHITE_EDGE - LINE_W / 2, WHITE_EDGE + LINE_W / 2, NEAR, FAR * 4)} fill="#e9ece9" />
        {dashes}
        {posts}
        {poles}
      </svg>

      {gantries.map(({ n, z }) => {
        const o = fog(z);
        const pxPerUnit = f / z;
        const beamTop = sy(BEAM_TOP, z);
        const beamBottom = sy(BEAM_BOTTOM, z);
        const postW = Math.max(2, pxPerUnit * 0.4);
        const signs = signsFor(n % 2);
        return (
          <AbsoluteFill key={n} style={{ opacity: o }}>
            <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
              {/* Posts */}
              {[POST_L, POST_R].map((X) => (
                <rect key={X} x={sx(X, z) - postW / 2} y={sy(SIGN_TOP + 0.2, z)} width={postW} height={sy(0, z) - sy(SIGN_TOP + 0.2, z)} fill="#8b928d" />
              ))}
              {/* Truss beam */}
              <rect x={sx(POST_L, z)} y={beamTop} width={sx(POST_R, z) - sx(POST_L, z)} height={beamBottom - beamTop} fill="#9aa19c" />
              <rect
                x={sx(POST_L, z)}
                y={beamTop + (beamBottom - beamTop) * 0.42}
                width={sx(POST_R, z) - sx(POST_L, z)}
                height={(beamBottom - beamTop) * 0.16}
                fill="#5f6662"
              />
            </svg>
            {SIGN_CENTRES.map((X, i) => {
              const scale = pxPerUnit / SIGN_PX;
              const left = sx(X - SIGN_W / 2, z);
              const top = sy(SIGN_TOP, z);
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: SIGN_W * SIGN_PX,
                    height: SIGN_H * SIGN_PX,
                    transformOrigin: '0 0',
                    transform: `translate(${left}px, ${top}px) scale(${scale})`,
                    // Signs light up (headlights) as they get close
                    filter: `brightness(${interpolate(z, [12, 70], [1.1, 0.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                  }}
                >
                  {signs[i]}
                </div>
              );
            })}
          </AbsoluteFill>
        );
      })}

      {/* Vignette */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.45) 100%)' }} />
    </AbsoluteFill>
  );
}

/** Small static city skyline sitting on the horizon. Deterministic (no random). */
function Skyline({ cx, baseY, unit }: { cx: number; baseY: number; unit: number }) {
  const blocks = [3, 5, 4, 8, 6, 11, 7, 9, 5, 13, 6, 4, 8, 5, 3];
  const widths = [2, 1.6, 2.2, 1.4, 2, 1.5, 2.4, 1.6, 2, 1.3, 2.2, 1.8, 1.5, 2, 2.4];
  const total = widths.reduce((a, b) => a + b, 0) * unit;
  let x = cx - total / 2;
  return (
    <g>
      {blocks.map((h, i) => {
        const w = widths[i] * unit;
        const y = baseY - h * unit;
        const rect = (
          <g key={i}>
            <rect x={x} y={y} width={w - unit * 0.15} height={h * unit} fill="#0b2a1e" />
            {Array.from({ length: Math.floor(h / 2) }).map((_, r) =>
              (i * 7 + r * 3) % 4 === 0 ? (
                <rect key={r} x={x + w * 0.35} y={y + unit * (1 + r * 2)} width={unit * 0.35} height={unit * 0.45} fill="#ffcf7a" opacity={0.75} />
              ) : null,
            )}
          </g>
        );
        x += w;
        return rect;
      })}
    </g>
  );
}

function SignBody({ title, legend, arrow, exitTab }: { title: string; legend: string; arrow: number; exitTab?: boolean }) {
  return (
    <div style={{ position: 'relative', width: SIGN_W * SIGN_PX, height: SIGN_H * SIGN_PX }}>
      {exitTab && (
        <Panel
          style={{
            position: 'absolute',
            right: 26,
            top: -46,
            height: 60,
            padding: '8px 18px 0',
            borderRadius: '12px 12px 0 0',
            boxShadow: `inset 0 0 0 4px ${C.white}`,
            background: C.sign,
          }}
        >
          <Legend style={{ fontSize: 22 }}>Exit</Legend>
        </Panel>
      )}
      <Panel
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          textAlign: 'center',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 64, lineHeight: 1, letterSpacing: '-0.01em' }}>{title}</div>
        <Legend style={{ fontSize: 20, opacity: 0.85 }}>{legend}</Legend>
        <Arrow rotate={arrow} size={58} />
      </Panel>
    </div>
  );
}
