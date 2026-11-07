import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Approximate visitor location for the homepage lane picker.
 *
 * Vercel adds these headers to every request from its own IP geolocation, so nothing is
 * sent to a third party and the browser never shows a permission prompt. We only echo
 * coordinates back to the same visitor; nothing is logged or stored.
 * Off Vercel (local dev) the headers are absent and this returns { found: false }.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const h = (name: string) => {
    const v = req.headers[name];
    return Array.isArray(v) ? v[0] : v;
  };
  const country = h('x-vercel-ip-country');
  const lat = Number(h('x-vercel-ip-latitude'));
  const lon = Number(h('x-vercel-ip-longitude'));

  const found = country === 'US' && Number.isFinite(lat) && Number.isFinite(lon);
  const body = found ? { found, lat, lon } : { found: false };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  // Per-visitor answer: never let a CDN or shared cache hand one visitor's city to another.
  res.setHeader('Cache-Control', 'private, no-store');
  res.end(JSON.stringify(body));
}
