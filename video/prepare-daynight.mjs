// Extracts every frame of the hero's day-to-night source clip
// (public/footage/hero-daynight-source.mp4, 8 s at 24 fps, 192 frames) to
// public/daynight/f000.jpg … f191.jpg (gitignored) for the Remotion
// DayIntro / NightIntro / DayToNight / NightToDay compositions.
//   frames   0–57   daylight (the day rest frame is 57)
//   frames  58–111  a continuous change of light: sunset, dusk, then dark with
//                   the headlights coming on (the real time-lapse, DayToNight)
//   frames 112–191  night (the night rest frame is 191)
// Uses the system ffmpeg. Run automatically by render.mjs.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, 'public', 'footage', 'hero-daynight-source.mp4');
const out = path.join(here, 'public', 'daynight');

export function prepareDayNight({ force = false } = {}) {
  if (!force && existsSync(path.join(out, 'f191.jpg'))) return;
  mkdirSync(out, { recursive: true });
  execFileSync(
    'ffmpeg',
    ['-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-start_number', '0', '-q:v', '2', path.join(out, 'f%03d.jpg')],
    { stdio: 'inherit' },
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  prepareDayNight({ force: process.argv.includes('--force') });
  console.log('daynight frames ready');
}
