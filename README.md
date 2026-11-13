# FreightFlow Website

Marketing site for FreightFlow Logistics: a single page that rides along with one truck from night to dawn. A real-time 3D scene (three.js) sits fixed behind the page and the scroll position directs it: each chapter of copy calls a camera shot, and the scene blends between them.

## Tech stack

- **React 19** + **TypeScript**
- **Vite 6** (dev server & build)
- **Tailwind CSS 4**
- **three.js** (the scroll-directed 3D scene, loaded as its own chunk after first paint)
- **motion** (modal and chat transitions)
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

## The drive (3D scene)

Everything 3D lives in [`src/drive/`](src/drive/); React only talks to it through a small bridge in [`src/components/drive/`](src/components/drive/).

| File | What it is |
| --- | --- |
| `shots.ts` | The camera script: one shot per chapter (camera, time of day, blueprint amount, map, gates). Edit this to re-direct the film. |
| `engine.ts` | Renderer, scroll → shot blending, lighting, labels pinned to the scene, quality watchdog. |
| `truck.ts` | The procedural tractor and 53′ trailer (no model files; textures are drawn on canvas). |
| `road.ts`, `scenery.ts`, `sky.ts` | Road and terrain shaders, traffic, lamps, skyline, ridgelines, night-to-dawn sky. |
| `gates.ts` | The five checkpoints of “How it works”; scrolling drives the truck through them. |
| `map3d.ts` | The lower-48 map the camera lifts off to, the visitor's lane and the illustrative network. |

A chapter is any element with `data-shot="<name>"`; the name must exist in `shots.ts`. Chapters, in order: hero, services (trailer opens to show the load), how it works (pinned, scroll-driven), lanes (map and lane estimate), platform, compliance, fleet (blueprint, drag to turn), drivers, FAQ, quote (the truck leaves into the sunrise).

**Fallbacks.** `capabilities.ts` picks a mode per device: `high` (bloom), `low` (no post-processing, 1× pixels) or `static` (no canvas, a painted backdrop; also used for save-data and when WebGL is missing). If frames stay slow at runtime the page steps down one rung. With `prefers-reduced-motion` the scene stops moving on its own and cuts between chapters, and the pinned chapter becomes a plain list. Append `?drive=high|low|static` to pin a mode while testing.

The share image tooling in [`video/`](video/) (Remotion) is a separate package and is not part of the site build.

## Deployment

Configured for Vercel (see [vercel.json](vercel.json)).
