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

- **Hero clip** (`encode-hero.mjs`): `video/public/footage/hero-source.mp4` is an 8 s aerial shot of a Cascadia at sunrise. It's cut to the first 6.25 s at 1.25× speed (5 s), lightly graded, and encoded to MP4 and WebM, plus first-frame, last-frame and blurred-backdrop stills.
  - It plays once and rests on its last frame, so it needs no pause control.
  - Desktop shows the full frame as a feathered window on the right, so the sign never covers the truck; phones and tablets show it as a band above the sign.
  - Reduced-motion and Data Saver visitors get the last frame as a still (see `src/components/sections/Hero.tsx`).
- **Photos** (`PhotoFleet`, `PhotoDrivers`, `PhotoFinal`): graded Remotion stills from the truck footage frames in `video/public/footage/`. `prepare-footage.mjs` first inpaints a road smear in those frames (output in `video/public/footage-smooth/`, gitignored, rebuilt on demand).
- **`OgCard`**: the 1200×630 Open Graph / Twitter image.
- **`generate-trucks.mjs`**: optional. Generates new truck stills and a hero clip with the Gemini API into `video/public/generated/` for review (needs `GEMINI_API_KEY` with billing enabled).

Remotion is free for individuals and companies with up to 3 employees; larger teams need a [company license](https://www.remotion.pro/license).

## Deployment

Configured for Vercel (see [vercel.json](vercel.json)).
