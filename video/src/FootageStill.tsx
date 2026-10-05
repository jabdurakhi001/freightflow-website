import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion';

/*
 * Graded stills from FreightFlow's truck footage for the site's photo slots.
 * The road smear in the source frames is inpainted by prepare-footage.mjs, so
 * the frames used here (footage-smooth/clean-*.jpg) are already clean.
 */

const cleanSrc = (n: number) => staticFile(`footage-smooth/clean-${n}.jpg`);

/** A cleaned 1280×720 footage frame, absolutely filling its parent. */
function Frame({ src, opacity = 1 }: { src: string; opacity?: number }) {
  return <Img src={src} style={{ position: 'absolute', left: 0, top: 0, width: 1280, height: 720, opacity }} />;
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
