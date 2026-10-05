# FreightFlow Website

Marketing site for FreightFlow Logistics — a single-page React app built with Vite, TypeScript, and Tailwind CSS, built on an Interstate-signage design system (Overpass type, guide-sign green, work-zone orange), with a Remotion-rendered hero, quote capture and live chat.

## Tech stack

- **React 19** + **TypeScript**
- **Vite 6** (dev server & build)
- **Tailwind CSS 4**
- **motion** (animations, scroll-driven hero)
- **lucide-react** (icons)
- **Supabase** / serverless API routes under `api/`

## Run locally

**Prerequisites:** Node.js 18+

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

## Environment variables

See [.env.example](.env.example). At minimum:

- `GEMINI_API_KEY` — powers the AI chat widget
- `APP_URL` — base URL used for self-referential links and API endpoints

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server on port 3000    |
| `npm run build`   | Production build to `dist/`          |
| `npm run preview` | Preview the production build         |
| `npm run lint`    | Type-check with `tsc --noEmit`       |

## Motion assets (Remotion)

The hero clip, the section photos and the social share image are rendered with [Remotion](https://www.remotion.dev) from FreightFlow's own truck footage in [`video/`](video/). It's a separate package, so the site build doesn't depend on it; the rendered files are committed.

```bash
cd video
npm install
npm run studio   # preview and tweak the compositions
npm run render   # writes public/hero/truck-reveal*, public/photos/*.jpg and public/og-image.jpg
```

Rendering needs a system `ffmpeg` with the `removelogo` and `minterpolate` filters and WebP decoding (any distro build has them). `prepare-footage.mjs` runs first: it inpaints a smear in the source frames (`video/public/footage/`) and builds motion-interpolated slow motion into `video/public/footage-smooth/` (gitignored, rebuilt on demand).

- `TruckReveal`: a 5 s camera pull-back from a FreightFlow Cascadia on the interstate. It plays once and rests on its last frame, so it needs no pause control. Phones see it as a 16:9 band above the sign; reduced-motion and Data Saver visitors get the last frame as a still (see `src/components/sections/Hero.tsx`).
- `PhotoFleet`, `PhotoDrivers`, `PhotoFinal`: graded stills from the same footage for the Fleet, Drivers and closing sections.
- `OgCard`: the 1200×630 Open Graph / Twitter image.

Remotion is free for individuals and companies with up to 3 employees; larger teams need a [company license](https://www.remotion.pro/license).

## Deployment

Configured for Vercel (see [vercel.json](vercel.json)).
