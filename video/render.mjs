// Renders the site's Remotion assets into ../public:
//   hero/truck-reveal*                 5 s hero clip + stills (encode-hero.mjs, from footage/hero-source.mp4)
//   photos/{fleet,drivers,final}.jpg   graded stills for the page
//   og-image.jpg                       1200×630 social card
// Sources: truck footage in video/public/footage (frames cleaned by prepare-footage.mjs).
// Set REMOTION_BROWSER to a Chromium / headless-shell binary to skip Remotion's
// own browser download (e.g. where that host is blocked).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { prepareFootage } from './prepare-footage.mjs';
import { encodeHero } from './encode-hero.mjs';

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

// Hero clip: the owner's aerial footage, trimmed, retimed and graded by ffmpeg
encodeHero();
console.log('hero done');

// Photos: an owner-supplied shot in public/photos-source/<name>.* wins;
// otherwise the graded Remotion still from the truck footage frames.
const SOURCES = path.join(here, 'public', 'photos-source');
const PHOTOS = [
  ['PhotoFleet', 'fleet', [1200, 900]],
  ['PhotoDrivers', 'drivers', [1600, 900]],
  ['PhotoFinal', 'final', [1600, 900]],
];
for (const [id, name, [w, h]] of PHOTOS) {
  const output = path.join(site, 'photos', `${name}.jpg`);
  const source = existsSync(SOURCES) && readdirSync(SOURCES).find((f) => f.startsWith(`${name}.`));
  if (source) {
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', path.join(SOURCES, source),
      '-vf', `scale=${w}:${h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${w}:${h}`, '-q:v', '3', output], { stdio: 'inherit' });
  } else {
    await still(id, output);
  }
}
console.log('photos done');

await still('OgCard', path.join(site, 'og-image.jpg'), { jpegQuality: 88 });
console.log('og-image done');
