// Renders the site's Remotion assets into ../public:
//   hero/{day,night,day-to-night,night-to-day}.{mp4,webm} + stills
//                                      theme-following hero clips (DayNight.tsx, encode-hero.mjs)
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
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { prepareFootage } from './prepare-footage.mjs';
import { blurred, heroOut, transcode, writeOgFrames } from './encode-hero.mjs';
import { prepareDayNight } from './prepare-daynight.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(here, '..', 'public');
const workDir = path.join(here, 'out');
for (const d of [path.join(site, 'hero'), path.join(site, 'photos'), workDir]) mkdirSync(d, { recursive: true });
const browserExecutable = process.env.REMOTION_BROWSER || null;

prepareFootage();
prepareDayNight();
// Before bundling: the bundle copies public/, which needs the OG card's frames.
writeOgFrames();
const serveUrl = await bundle({ entryPoint: path.join(here, 'src', 'index.tsx'), publicDir: path.join(here, 'public') });
const pick = (id) => selectComposition({ serveUrl, id, browserExecutable });
const still = async (id, output, extra = {}) =>
  renderStill({ composition: await pick(id), serveUrl, browserExecutable, imageFormat: 'jpeg', jpegQuality: 84, output, ...extra });

// Hero: four theme-following clips. Each rest frame (last frame of an intro or
// transition) is shared by the clip that leaves that state, so the site can cut
// between them invisibly.
const HERO = [
  ['DayIntro', 'day'],
  ['NightIntro', 'night'],
  ['DayToNight', 'day-to-night'],
  ['NightToDay', 'night-to-day'],
];
for (const [id, name] of HERO) {
  const composition = await pick(id);
  const master = path.join(workDir, `${name}-master.mp4`);
  await renderMedia({ composition, serveUrl, browserExecutable, codec: 'h264', crf: 10, muted: true, outputLocation: master });
  transcode(master, name);
  if (id.endsWith('Intro')) {
    await still(id, path.join(heroOut, `${name}-first.jpg`), { frame: 0 });
    const rest = path.join(heroOut, `${name}-rest.jpg`);
    await still(id, rest, { frame: composition.durationInFrames - 1 });
    blurred(rest, path.join(heroOut, `${name}-backdrop.jpg`));
  }
}
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
