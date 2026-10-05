# FreightFlow Website

Marketing site for FreightFlow Logistics — a single-page React app built with Vite, TypeScript, and Tailwind CSS, featuring a scroll-driven hero, live-style dispatch visuals, and quote/application capture.

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

## Hero video (Remotion)

The 5-second sketch-to-photo clip behind the hero is rendered with [Remotion](https://www.remotion.dev) from the source in [`video/`](video/). It's a separate package, so the site build doesn't depend on it. The rendered files are committed in `public/hero/`.

```bash
cd video
npm install
npm run studio   # preview and tweak the composition
npm run render   # writes public/hero/hero-reveal.{webm,mp4} and the poster
```

The clip is built from the frames in `public/hero-frames/w1280`. Wide screens play it once; phones, reduced-motion users and Data Saver users get the static `frame-050.jpg` instead (see `src/components/Hero.tsx`). Remotion is free for individuals and companies with up to 3 employees; larger teams need a [company license](https://www.remotion.pro/license).

## Deployment

Configured for Vercel (see [vercel.json](vercel.json)).
