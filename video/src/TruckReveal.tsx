import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

/*
 * Photo-real hero clip from FreightFlow's own truck footage: a slow camera
 * pull-back from the Cascadia rolling down the interstate.
 *
 * Source frames 34–64 are motion-interpolated to 30 fps by prepare-footage.mjs
 * (public/footage-smooth, 109 frames); the playhead eases through them and the
 * last frame holds. The whole clip is
 * 5 s and plays once (no loop), so it needs no pause control (WCAG 2.2.2).
 *
 * The road smear right of the bumper in the source is inpainted by
 * prepare-footage.mjs, so the frames here are already clean.
 */

export const REVEAL_FPS = 30;
export const REVEAL_FRAMES = 150;

const SMOOTH_FRAMES = 109;
const cleanSrc = (n: number) => staticFile(`footage-smooth/clean-${n}.jpg`);
const smoothSrc = (i: number) => staticFile(`footage-smooth/s${String(i + 1).padStart(3, '0')}.jpg`);

/** A cleaned 1280×720 footage frame, absolutely filling its parent. */
function Frame({ src, opacity = 1 }: { src: string; opacity?: number }) {
  return <Img src={src} style={{ position: 'absolute', left: 0, top: 0, width: 1280, height: 720, opacity }} />;
}

export function TruckReveal() {
  const frame = useCurrentFrame();

  // Playhead through the footage: eases out into the final frame.
  const pos = interpolate(frame, [0, 138], [0, SMOOTH_FRAMES - 1], {
    easing: Easing.bezier(0.3, 0.05, 0.3, 1),
    extrapolateRight: 'clamp',
  });
  const a = Math.floor(pos);
  const b = Math.min(a + 1, SMOOTH_FRAMES - 1);
  const t = pos - a;

  // Gentle optical pull-back on top of the footage's own camera move.
  const zoom = interpolate(frame, [0, 150], [1.12, 1.03], { easing: Easing.out(Easing.quad), extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0c110f', overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: '45% 60%',
          // Light grade: a touch more contrast and warmth than the raw render.
          filter: 'contrast(1.06) saturate(1.06) sepia(0.06)',
        }}
      >
        <Frame src={smoothSrc(a)} />
        {t > 0.01 && <Frame src={smoothSrc(b)} opacity={t} />}
      </AbsoluteFill>
      {/* Lens vignette */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 60% 50%, transparent 55%, rgba(0,0,0,0.35) 100%)' }} />
    </AbsoluteFill>
  );
}

/**
 * A graded still from the same footage, for the site's photo slots.
 * `focus` is the object-position of the crop; `zoom` scales from that point.
 */
export function FootageStill({ frame, focus = '50% 50%', zoom = 1 }: { frame: number; focus?: string; zoom?: number }) {
  const { width, height } = useVideoConfig();
  // Cover-fit the 1280×720 source into this still, then zoom about `focus`.
  const cover = Math.max(width / 1280, height / 720) * zoom;
  const [fx, fy] = focus.split(' ').map((p) => parseFloat(p) / 100);
  const left = (width - 1280 * cover) * fx;
  const top = (height - 720 * cover) * fy;
  return (
    <AbsoluteFill style={{ backgroundColor: '#0c110f', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width: 1280,
          height: 720,
          transform: `scale(${cover})`,
          transformOrigin: '0 0',
          filter: 'contrast(1.06) saturate(1.06) sepia(0.06)',
        }}
      >
        <Frame src={cleanSrc(frame)} />
      </div>
    </AbsoluteFill>
  );
}
