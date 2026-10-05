// Renders a few stills for checking the composition without a full render.
//   node preview.mjs <outDir> [frames...]
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const [outDir = 'out', ...frameArgs] = process.argv.slice(2);
const frames = frameArgs.length ? frameArgs.map(Number) : [0, 30, 60, 100, 130, 179];
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.join(here, 'src', 'index.tsx'), publicDir: path.join(here, '..', 'public') });
const composition = await selectComposition({ serveUrl, id: 'HeroReveal', browserExecutable });
for (const frame of frames) {
  await renderStill({ composition, serveUrl, browserExecutable, frame, output: path.join(outDir, `f${String(frame).padStart(3, '0')}.png`) });
}
console.log('stills', frames.join(','));
