// Renders the site's Remotion assets into ../public:
//   hero/truck-reveal.{mp4,webm}       5 s photo-real hero clip (plays once)
//   hero/truck-reveal-first.jpg        video poster (= first frame)
//   hero/truck-reveal-last.jpg         still for phones / reduced motion (= last frame)
//   photos/{fleet,drivers,final}.jpg   graded stills for the page
//   og-image.jpg                       1200×630 social card
// Sources: FreightFlow's own truck footage in video/public/footage (smoothed by prepare-footage.mjs).
// Set REMOTION_BROWSER to a Chromium / headless-shell binary to skip Remotion's
// own browser download (e.g. where that host is blocked).
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { prepareFootage } from './prepare-footage.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(here, '..', 'public');
const workDir = path.join(here, 'out');
for (const d of [path.join(site, 'hero'), path.join(site, 'photos'), workDir]) mkdirSync(d, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER || null;

prepareFootage();
const serveUrl = await bundle({ entryPoint: path.join(here, 'src', 'index.tsx'), publicDir: path.join(here, 'public') });
const pick = (id) => selectComposition({ serveUrl, id, browserExecutable });
const still = async (id, output, extra = {}) =>
  renderStill({ composition: await pick(id), serveUrl, browserExecutable, imageFormat: 'jpeg', jpegQuality: 84, output, ...extra });

const ffmpeg = (input, ...args) =>
  execFileSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', input, ...args], { cwd: here, stdio: 'inherit' });

// Hero clip
const reveal = await pick('TruckReveal');
const master = path.join(workDir, 'truck-reveal-master.mp4');
await renderMedia({ composition: reveal, serveUrl, browserExecutable, codec: 'h264', crf: 10, muted: true, outputLocation: master });
ffmpeg(master, '-an', '-c:v', 'libx264', '-crf', '24', '-preset', 'veryslow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(site, 'hero', 'truck-reveal.mp4'));
ffmpeg(master, '-an', '-c:v', 'libvpx-vp9', '-crf', '40', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '1', '-pix_fmt', 'yuv420p', path.join(site, 'hero', 'truck-reveal.webm'));
await still('TruckReveal', path.join(site, 'hero', 'truck-reveal-first.jpg'), { frame: 0 });
await still('TruckReveal', path.join(site, 'hero', 'truck-reveal-last.jpg'), { frame: reveal.durationInFrames - 1 });
console.log('hero done');

for (const [id, name] of [
  ['PhotoFleet', 'fleet'],
  ['PhotoDrivers', 'drivers'],
  ['PhotoFinal', 'final'],
]) {
  await still(id, path.join(site, 'photos', `${name}.jpg`));
}
console.log('photos done');

await still('OgCard', path.join(site, 'og-image.jpg'), { jpegQuality: 88 });
console.log('og-image done');
