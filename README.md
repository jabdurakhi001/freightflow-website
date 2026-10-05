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

The hero's highway-drive loop and the social share image are rendered with [Remotion](https://www.remotion.dev) from the source in [`video/`](video/). It's a separate package, so the site build doesn't depend on it; the rendered files are committed.

```bash
cd video
npm install
npm run studio   # preview and tweak the compositions
npm run render   # writes public/hero/drive-{landscape,portrait}.{mp4,webm,jpg} and public/og-image.jpg
```

- `HighwayDrive`: an 8 s seamless loop (landscape 1600×900 and portrait 900×1600 cuts) of a dusk interstate with FreightFlow gantry signs. Tall screens get the portrait cut. Reduced-motion and Data Saver visitors get the still poster, and a pause button sits on the hero (see `src/components/sections/Hero.tsx`).
- `OgCard`: the 1200×630 Open Graph / Twitter image.

Remotion is free for individuals and companies with up to 3 employees; larger teams need a [company license](https://www.remotion.pro/license).

## Deployment

Configured for Vercel (see [vercel.json](vercel.json)).
