// Builds public/footage-smooth/ (gitignored) from the committed source frames
// (public/footage/frame-34…64.webp):
//   1. clean-<n>.jpg: each frame with the grey smear on the road right of the
//      bumper (x 1110–1280, y 546–664, fixed across frames) inpainted. The
//      frame is mirrored first so the fill has clean pixels on every side,
//      then the fill is softened with a feathered blur so it reads as road
//      motion blur rather than a hard-edged patch.
//   2. s001…s109.jpg: motion-compensated slow motion of the cleaned frames, so
//      the hero clip doesn't ghost the way plain frame-blending does.
// Uses the system ffmpeg (needs removelogo, minterpolate and a WebP decoder,
// which Remotion's bundled ffmpeg lacks). Run automatically by render.mjs.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'public', 'footage-smooth');

export function prepareFootage({ force = false } = {}) {
  if (!force && existsSync(out) && existsSync(path.join(out, 's109.jpg'))) return;
  mkdirSync(out, { recursive: true });
  const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  const mask = path.join(out, 'smear-mask.png');
  ff(['-f', 'lavfi', '-i', 'color=black:s=2560x720', '-frames:v', '1', '-vf', 'drawbox=x=1110:y=546:w=340:h=118:color=white:t=fill,format=gray', mask]);
  const feather = path.join(out, 'smear-feather.png');
  ff(['-f', 'lavfi', '-i', 'color=black:s=1280x720', '-frames:v', '1', '-vf', 'drawbox=x=1116:y=553:w=164:h=108:color=white:t=fill,gblur=sigma=7,format=gray', feather]);
  ff([
    '-start_number', '34', '-i', path.join(here, 'public', 'footage', 'frame-%d.webp'),
    '-i', feather,
    '-filter_complex',
    `[0]split[a][b];[b]hflip[m];[a][m]hstack,removelogo=${mask},crop=1280:720:0:0,format=rgba,split[c][s];` +
      `[s]gblur=sigma=16[bl];[1]format=gray[f];[bl][f]alphamerge[soft];[c][soft]overlay,format=yuvj444p`,
    '-q:v', '1', '-start_number', '34', path.join(out, 'clean-%d.jpg'),
  ]);
  ff(
    [
      '-framerate', '8', '-start_number', '34', '-i', path.join(out, 'clean-%d.jpg'),
      '-vf', 'minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1',
      '-q:v', '2', path.join(out, 's%03d.jpg'),
    ],
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  prepareFootage({ force: process.argv.includes('--force') });
  console.log('footage-smooth:', readdirSync(out).length, 'files');
}
