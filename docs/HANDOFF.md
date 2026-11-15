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

### Step 2 — build the plates into the site

Done for stills. `src/components/drive/PhotoLayer.tsx` cross-fades a photographic plate over
the canvas for the `hero`, `compliance`, `drivers`, `faq` and `cta` shots and pauses the 3D
engine while a plate fully covers it. The plates are in `public/drive/photo/`.

How the plates were made: the Seedance start frame locks the look, so animating the 3D
captures directly only gave moving 3D renders. Each capture was first re-rendered as a
photograph with `gpt_image_2_6` (capture as `image_references`, quality high, 2k), and
those photographs are the plates and the start frames for video.

Clips are in too: `public/drive/video/<name>.mp4` (1080p) and `<name>-720.mp4` (phones),
made from the plates with Seedance 2.5 at 1080p, 8 s (128 credits each through the
connector). `hero`, `compliance` and `sunrise` hold a steady framing and are encoded as
seamless 7 s loops (last second cross-faded into the first). `drivers` and `aerial` have a
camera move, so they play once as the chapter arrives and hold their last frame
(`video: 'once'` in `PLATES`). Reduced motion and save-data get the stills only.

The generated truck is not a Freightliner Cascadia, which the copy names. The owner has
been told; regenerate the plates or use real fleet photos if that needs to match.

## Rules that still apply

- Work on branch `ccr-8ce79623-sii4tw`; no pull request unless the owner asks.
- `src/content.ts`: do not add claims (stats, testimonials, coverage numbers)
  the business has not confirmed.
- Ask before anything outward-facing or paid: purchases, plan changes,
  production deploys.
