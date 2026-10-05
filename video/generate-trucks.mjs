// Generates distinct truck imagery with Google's Gemini API, one truck per
// spot on the site, into video/public/generated/ (review before using):
//   node video/generate-trucks.mjs            stills (Nano Banana) + hero clip (Veo)
//   node video/generate-trucks.mjs --images   stills only
//   node video/generate-trucks.mjs --video    hero clip only
// Needs GEMINI_API_KEY with billing enabled (image and video generation are
// paid on the Gemini API). Model ids can be overridden with IMAGE_MODEL /
// VIDEO_MODEL when Google renames them.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'public', 'generated');
mkdirSync(out, { recursive: true });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set.');
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });
const IMAGE_MODEL = process.env.IMAGE_MODEL || 'gemini-2.5-flash-image';
const VIDEO_MODEL = process.env.VIDEO_MODEL || 'veo-3.0-fast-generate-001';

// Shared look so the set feels like one photo shoot of one fleet.
const STYLE =
  'Photorealistic editorial photograph, shot on a full-frame camera, natural light, true-to-life colour, ' +
  'sharp detail, no text, no logos, no watermarks, no people in focus. The truck is a current-generation ' +
  '(2025–2027) Freightliner Cascadia sleeper tractor pulling a clean plain white 53-foot dry van trailer.';

const STILLS = [
  {
    name: 'fleet',
    aspect: '4:3',
    prompt: `${STYLE} A glossy black Cascadia backed into a loading dock at a modern distribution centre, early morning, three-quarter front view, wet concrete reflecting dock lights.`,
  },
  {
    name: 'drivers',
    aspect: '16:9',
    prompt: `${STYLE} A deep red Cascadia parked at a clean truck stop at dusk, cab lights on, warm sodium lights, side view with space on the left for text.`,
  },
  {
    name: 'final',
    aspect: '16:9',
    prompt: `${STYLE} A metallic blue Cascadia on an open desert interstate in the American Southwest, late afternoon, low three-quarter rear view of the truck heading toward distant mesas.`,
  },
  {
    name: 'hero-start',
    aspect: '16:9',
    prompt: `${STYLE} Aerial drone view at sunrise of a deep forest-green Cascadia cruising along an empty four-lane interstate through flat Midwest farmland, long shadows, light haze. The truck sits in the right third of the frame.`,
  },
];

async function generateStill({ name, aspect, prompt }) {
  const res = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: prompt,
    config: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } },
  });
  const part = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part) throw new Error(`${name}: no image returned (${res.candidates?.[0]?.finishReason ?? 'unknown'})`);
  const file = path.join(out, `${name}.png`);
  writeFileSync(file, Buffer.from(part.inlineData.data, 'base64'));
  console.log('image', file);
}

async function generateHeroClip() {
  let op = await ai.models.generateVideos({
    model: VIDEO_MODEL,
    prompt:
      `${STYLE} Smooth aerial drone shot at sunrise tracking alongside and slightly ahead of a deep forest-green ` +
      'Cascadia cruising along an empty four-lane interstate through flat Midwest farmland. Steady camera, ' +
      'gentle forward motion, warm low sun, long shadows, light haze. No cuts.',
    config: { aspectRatio: '16:9', numberOfVideos: 1 },
  });
  while (!op.done) {
    await new Promise((r) => setTimeout(r, 10_000));
    op = await ai.operations.getVideosOperation({ operation: op });
    process.stdout.write('.');
  }
  const video = op.response?.generatedVideos?.[0]?.video;
  if (!video) throw new Error(`hero clip: no video returned ${JSON.stringify(op.error ?? op.response ?? {})}`);
  const file = path.join(out, 'hero.mp4');
  await ai.files.download({ file: video, downloadPath: file });
  console.log('\nvideo', file);
}

const only = process.argv[2];
if (only !== '--video') for (const s of STILLS) await generateStill(s);
if (only !== '--images') await generateHeroClip();
