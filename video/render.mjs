// Renders the site's Remotion assets into ../public:
//   hero/drive-landscape.{webm,mp4,jpg}, hero/drive-portrait.{webm,mp4,jpg}, og-image.jpg
// Each loop is rendered once as a near-lossless master, then encoded for the web
// with Remotion's bundled ffmpeg (no audio, small files, fast start).
// Set REMOTION_BROWSER to a Chromium / headless-shell binary to skip Remotion's
// own browser download (e.g. where that host is blocked).
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, '..', 'public');
const heroDir = path.join(publicDir, 'hero');
const workDir = path.join(here, 'out');
mkdirSync(heroDir, { recursive: true });
mkdirSync(workDir, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER || null;

const serveUrl = await bundle({ entryPoint: path.join(here, 'src', 'index.tsx'), publicDir });

const ffmpeg = (input, ...args) =>
  execFileSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', input, ...args], {
    cwd: here,
    stdio: 'inherit',
  });

for (const [id, name] of [
  ['DriveLandscape', 'drive-landscape'],
  ['DrivePortrait', 'drive-portrait'],
]) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  const master = path.join(workDir, `${name}-master.mp4`);
  await renderMedia({ composition, serveUrl, browserExecutable, codec: 'h264', crf: 10, muted: true, outputLocation: master });
  ffmpeg(master, '-an', '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '1', '-pix_fmt', 'yuv420p', path.join(heroDir, `${name}.webm`));
  ffmpeg(master, '-an', '-c:v', 'libx264', '-crf', '25', '-preset', 'veryslow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(heroDir, `${name}.mp4`));
  // Poster = frame 0, so the swap from still to video is seamless.
  await renderStill({ composition, serveUrl, browserExecutable, frame: 0, imageFormat: 'jpeg', jpegQuality: 82, output: path.join(heroDir, `${name}.jpg`) });
  console.log(`${name} done`);
}

const og = await selectComposition({ serveUrl, id: 'OgCard', browserExecutable });
await renderStill({ composition: og, serveUrl, browserExecutable, imageFormat: 'jpeg', jpegQuality: 88, output: path.join(publicDir, 'og-image.jpg') });
console.log('og-image done');
