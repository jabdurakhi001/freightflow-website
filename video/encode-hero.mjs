// Hero media helpers for render.mjs. The hero follows the site theme with four
// Remotion clips (src/DayNight.tsx), built from the owner's day-to-night clip
// public/footage/hero-daynight-source.mp4:
//   ../public/hero/day.{mp4,webm}            DayIntro, plays on load in light mode
//   ../public/hero/night.{mp4,webm}          NightIntro, plays on load in dark mode
//   ../public/hero/day-to-night.{mp4,webm}   time-lapse played when switching to dark
//   ../public/hero/night-to-day.{mp4,webm}   time-lapse played when switching to light
//   ../public/hero/{day,night}-first.jpg     posters (first frames of the intros)
//   ../public/hero/{day,night}-rest.jpg      rest frames (reduced motion / Data Saver)
//   ../public/hero/{day,night}-backdrop.jpg  small, blurred rest frames behind the
//                                            desktop hero's feathered video window
// All clips are ≤5 s and play once, so they need no pause control (WCAG 2.2.2).
// Also writes the OG card's frames into public/og (frame.jpg, backdrop.jpg).
// Uses the system ffmpeg (libx264 + libvpx-vp9).
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, 'public', 'footage', 'hero-daynight-source.mp4');
export const heroOut = path.join(here, '..', 'public', 'hero');
const ogOut = path.join(here, 'public', 'og');

// Same base grade as DayNight.tsx (contrast 1.05, saturation 1.06).
const GRADE = 'eq=contrast=1.05:saturation=1.06';

const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });

/** Web encodes of a rendered master: MP4 (H.264) and WebM (VP9), no audio. */
export function transcode(master, name) {
  mkdirSync(heroOut, { recursive: true });
  ff(['-i', master, '-an', '-c:v', 'libx264', '-crf', '24', '-preset', 'veryslow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(heroOut, `${name}.mp4`)]);
  ff(['-i', master, '-an', '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '1', '-pix_fmt', 'yuv420p', path.join(heroOut, `${name}.webm`)]);
}

/** Small blurred copy of a still, for the desktop hero backdrop. */
export function blurred(input, output) {
  ff(['-i', input, '-vf', 'scale=640:-2,gblur=sigma=14', '-q:v', '3', output]);
}

/** The OG card's truck frame (day, 1 s into the source) and its blurred backdrop. */
export function writeOgFrames() {
  mkdirSync(ogOut, { recursive: true });
  const AT = 1;
  ff(['-ss', String(AT), '-i', src, '-frames:v', '1', '-vf', GRADE, '-q:v', '2', path.join(ogOut, 'frame.jpg')]);
  ff(['-ss', String(AT), '-i', src, '-frames:v', '1', '-vf', `${GRADE},scale=640:-2,gblur=sigma=16`, '-q:v', '3', path.join(ogOut, 'backdrop.jpg')]);
}
