// Renders a few stills for checking a composition without a full render.
//   node preview.mjs <compositionId> <outDir> [frames...]
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const [id = 'DriveLandscape', outDir = 'out', ...frameArgs] = process.argv.slice(2);
const frames = frameArgs.length ? frameArgs.map(Number) : [0, 60, 120, 180];
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.join(here, 'src', 'index.tsx'), publicDir: path.join(here, '..', 'public') });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
for (const frame of frames) {
  await renderStill({ composition, serveUrl, browserExecutable, frame, output: path.join(outDir, `${id}-f${String(frame).padStart(3, '0')}.png`) });
}
console.log('stills', id, frames.join(','));
