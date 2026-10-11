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

The hero clip, the section photos and the social share image are built from the scripts in [`video/`](video/). It's a separate package, so the site build doesn't depend on it; the rendered files are committed.

```bash
cd video
npm install
npm run studio   # preview and tweak the Remotion stills
npm run render   # writes public/hero/truck-reveal*, public/photos/*.jpg and public/og-image.jpg
```

Rendering needs a system `ffmpeg` with libx264, libvpx-vp9, the `removelogo` filter and WebP decoding (any distro build has them).

- **Hero clips** (`src/DayNight.tsx`, `encode-hero.mjs`): built from `video/public/footage/hero-daynight-source.mp4`, the owner's 8 s day-to-night aerial shot of a Cascadia. `prepare-daynight.mjs` extracts its frames (gitignored). Four Remotion clips follow the site theme:
  - `day` / `night` intros play once on load, for the current theme.
  - `day-to-night` and `night-to-day` are time-lapses (sunset → blue hour → night; sunrise flare → day) played when the visitor toggles the theme.
  - Every clip starts on the frame the other state rests on, so the hero swaps between them invisibly. All are ≤5 s and play only on load or on the toggle, so they need no pause control.
  - Desktop shows the full frame as a feathered window over a blurred backdrop that crossfades between day and night; phones and tablets show a band above the sign.
  - Reduced-motion and Data Saver visitors get the day or night rest frame as a still (see `src/components/sections/Hero.tsx`).
- **Photos** (`fleet`, `drivers`, `final`): an owner-supplied shot in `video/public/photos-source/<name>.*` is cropped and encoded as is (the Fleet photo uses one); otherwise the graded Remotion still (`PhotoFleet`, `PhotoDrivers`, `PhotoFinal`) from the truck footage frames in `video/public/footage/` is used. `prepare-footage.mjs` first inpaints a road smear in those frames (output in `video/public/footage-smooth/`, gitignored, rebuilt on demand).
- **`OgCard`**: the 1200×630 Open Graph / Twitter image, a guide sign beside the hero truck (frames written to `video/public/og/` by `encode-hero.mjs`).
- **`generate-trucks.mjs`**: optional. Generates new truck stills and a hero clip with the Gemini API into `video/public/generated/` for review (needs `GEMINI_API_KEY` with billing enabled).

Remotion is free for individuals and companies with up to 3 employees; larger teams need a [company license](https://www.remotion.pro/license).

## Deployment

Configured for Vercel (see [vercel.json](vercel.json)).
