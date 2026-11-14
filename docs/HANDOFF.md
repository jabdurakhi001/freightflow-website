# Handoff: photoreal video for the drive

Read this first if you are picking the work up in a new session.

## Where things stand

- The site is a scroll-directed 3D drive (three.js) behind the page copy. It is
  built, polished and pushed on branch `ccr-8ce79623-sii4tw`. Vercel builds a
  preview for every push to that branch.
- README.md, section "The drive (3D scene)", explains the architecture: camera
  shots in `src/drive/shots.ts`, engine in `src/drive/engine.ts`, chapters in
  `src/components/chapters/`, each section tagged `data-shot="<name>"`.
- Checks: `npx tsc --noEmit`, `npm test` (23 tests), `npm run build`. All pass.
- Never verified on a real GPU, only software-rendered screenshots. Worth a look
  in a real browser.

## What the owner wants next

Hyper-realistic footage in place of the stylised 3D render, generated with
Higgsfield (Seedance 2.5, Ultra plan, unlimited 720p video for 14 days when
generated on higgsfield.ai itself — the unlimited allowance does not apply
through Higgsfield's MCP or CLI).

### Step 1 — generate five clips

`docs/higgsfield/shot-list.md` has the settings and a prompt per clip.
`docs/higgsfield/01..05-*.jpg` are start frames captured from the current scene
(1920×1080, UI hidden) so the footage matches the truck, livery and palette.

| Clip | Start frame | Replaces shot(s) |
|---|---|---|
| Hero | 01-hero.jpg | `hero` |
| Compliance | 02-compliance.jpg | `compliance` |
| Drivers | 03-drivers.jpg | `drivers` |
| Aerial | 04-aerial.jpg | `faq` |
| Sunrise | 05-sunrise.jpg | `cta` |

The prompts are untested. Expect to adjust wording after the first takes.
Reject takes where the "FreightFlow" wordmark is garbled, the livery changes
(navy cab, orange stripe, white trailer), or the camera cuts or shakes.

Check Higgsfield's terms before automating generation in the browser, and
confirm the plan allows commercial use of the output.

### Step 2 — build the clips into the site

Not started. Suggested approach:

- Keep live 3D for `services`, `how`, `lanes`, `platform`, `fleet` (x-ray truck,
  scroll-driven gates, lane map — video cannot do these).
- For the five shots above, cross-fade a full-bleed `<video>` over the canvas
  while that chapter is active, driven by the same active-shot signal the
  engine already uses. Pause the 3D render while a video fully covers it.
- Videos: `muted loop playsInline preload="metadata"`, a poster image each,
  H.264 MP4 (plus WebM if it is smaller), aim for under ~3 MB per clip, in
  `public/video/`. Load a clip only when its chapter is near.
- Respect the existing quality ladder: `static` mode and
  `prefers-reduced-motion` show the poster only, never autoplay.
- Keep the copy readable: the existing scrims were tuned for the dark 3D scene,
  so re-check contrast over real footage, on mobile portrait too (clips are
  16:9; crop with `object-fit: cover` and pick `object-position` per clip).
- Re-shoot `public/og-image.jpg` from the hero clip when it lands.

## Rules that still apply

- Work on branch `ccr-8ce79623-sii4tw`; no pull request unless the owner asks.
- `src/content.ts`: do not add claims (stats, testimonials, coverage numbers)
  the business has not confirmed.
- Ask before anything outward-facing or paid: purchases, plan changes,
  production deploys.
