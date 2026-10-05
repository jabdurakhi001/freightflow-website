// Renders the hero clip into the website's public/hero/ folder:
//   npm run render  ->  hero-reveal.webm (VP9), hero-reveal.mp4 (H.264), hero-reveal-poster.jpg
// Remotion renders one near-lossless master; the web files are then encoded from
// it with Remotion's bundled ffmpeg, tuned for a background clip (small files,
// no audio track, fast start).
// Frames are read straight from the site's public/hero-frames, so the footage
// exists once. Set REMOTION_BROWSER to a Chromium / headless-shell binary to skip
// Remotion's own browser download (e.g. where that host is blocked).
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, '..', 'public');
const outDir = path.join(publicDir, 'hero');
const workDir = path.join(here, 'out');
mkdirSync(outDir, { recursive: true });
mkdirSync(workDir, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER || null;

const serveUrl = await bundle({ entryPoint: path.join(here, 'src', 'index.tsx'), publicDir });
const composition = await selectComposition({ serveUrl, id: 'HeroReveal', browserExecutable });
const common = { composition, serveUrl, browserExecutable };

const master = path.join(workDir, 'hero-reveal-master.mp4');
await renderMedia({ ...common, codec: 'h264', crf: 10, muted: true, outputLocation: master });
console.log('master done');

const ffmpeg = (...args) =>
  execFileSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', master, ...args], {
    cwd: here,
    stdio: 'inherit',
  });

ffmpeg(
  '-an', '-c:v', 'libvpx-vp9', '-crf', '50', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '1',
  '-pix_fmt', 'yuv420p', path.join(outDir, 'hero-reveal.webm'),
);
console.log('webm done');

ffmpeg(
  '-an', '-c:v', 'libx264', '-crf', '28', '-preset', 'veryslow', '-tune', 'film', '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart', path.join(outDir, 'hero-reveal.mp4'),
);
console.log('mp4 done');

await renderStill({ ...common, frame: 0, imageFormat: 'jpeg', jpegQuality: 80, output: path.join(outDir, 'hero-reveal-poster.jpg') });
console.log('poster done');
