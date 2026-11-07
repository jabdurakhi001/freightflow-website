/**
 * Lane estimate maths for the hero lane picker, kept free of DOM so it can be tested.
 *
 * Road miles = great-circle distance × 1.2 (a typical road-to-straight-line ratio),
 * rounded to the nearest 10. Days = road miles / 500 (about what one driver covers
 * in a day within hours-of-service limits), rounded up, never less than one.
 */

export type LatLon = readonly [lat: number, lon: number];

export const CITIES: Record<string, LatLon> = {
  'Albuquerque, NM': [35.08, -106.65], 'Atlanta, GA': [33.75, -84.39], 'Baltimore, MD': [39.29, -76.61], 'Billings, MT': [45.78, -108.5],
  'Birmingham, AL': [33.52, -86.8], 'Boise, ID': [43.62, -116.2], 'Boston, MA': [42.36, -71.06], 'Buffalo, NY': [42.89, -78.88],
  'Charlotte, NC': [35.23, -80.84], 'Chicago, IL': [41.88, -87.63], 'Cincinnati, OH': [39.1, -84.51], 'Cleveland, OH': [41.5, -81.69],
  'Columbus, OH': [39.96, -83.0], 'Dallas, TX': [32.78, -96.8], 'Denver, CO': [39.74, -104.99], 'Des Moines, IA': [41.59, -93.62],
  'Detroit, MI': [42.33, -83.05], 'El Paso, TX': [31.76, -106.49], 'Fargo, ND': [46.88, -96.79], 'Fort Worth, TX': [32.76, -97.33],
  'Fresno, CA': [36.74, -119.79], 'Houston, TX': [29.76, -95.37], 'Indianapolis, IN': [39.77, -86.16], 'Jacksonville, FL': [30.33, -81.66],
  'Kansas City, MO': [39.1, -94.58], 'Laredo, TX': [27.51, -99.51], 'Las Vegas, NV': [36.17, -115.14], 'Little Rock, AR': [34.75, -92.29],
  'Los Angeles, CA': [34.05, -118.24], 'Louisville, KY': [38.25, -85.76], 'Memphis, TN': [35.15, -90.05], 'Miami, FL': [25.76, -80.19],
  'Milwaukee, WI': [43.04, -87.91], 'Minneapolis, MN': [44.98, -93.27], 'Nashville, TN': [36.16, -86.78], 'New Orleans, LA': [29.95, -90.07],
  'New York, NY': [40.71, -74.01], 'Newark, NJ': [40.74, -74.17], 'Oakland, CA': [37.8, -122.27], 'Oklahoma City, OK': [35.47, -97.52],
  'Omaha, NE': [41.26, -95.94], 'Orlando, FL': [28.54, -81.38], 'Philadelphia, PA': [39.95, -75.17], 'Phoenix, AZ': [33.45, -112.07],
  'Pittsburgh, PA': [40.44, -80.0], 'Portland, OR': [45.52, -122.68], 'Reno, NV': [39.53, -119.81], 'Richmond, VA': [37.54, -77.44],
  'Sacramento, CA': [38.58, -121.49], 'Salt Lake City, UT': [40.76, -111.89], 'San Antonio, TX': [29.42, -98.49], 'Savannah, GA': [32.08, -81.09],
  'Seattle, WA': [47.61, -122.33], 'Spokane, WA': [47.66, -117.43], 'St. Louis, MO': [38.63, -90.2], 'Tulsa, OK': [36.15, -95.99],
};

export const CITY_NAMES = Object.keys(CITIES);
export const HUB = 'Chicago, IL';
export const DEFAULT_DESTINATION = 'Dallas, TX';

export const ROAD_FACTOR = 1.2;
export const MILES_PER_DAY = 500;
const EARTH_RADIUS_MI = 3958.8;

const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle (haversine) distance in statute miles. */
export function greatCircleMiles([la1, lo1]: LatLon, [la2, lo2]: LatLon): number {
  const a = Math.sin(rad(la2 - la1) / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(rad(lo2 - lo1) / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(a));
}

export interface LaneEstimate {
  /** Estimated road miles, rounded to the nearest 10. */
  road: number;
  /** Solo-driver days, rounded up, at least 1. */
  days: number;
}

export function estimateFromMiles(straightLine: number): LaneEstimate {
  const road = Math.round((straightLine * ROAD_FACTOR) / 10) * 10;
  return { road, days: Math.max(1, Math.ceil(road / MILES_PER_DAY)) };
}

export function estimateLane(from: string, to: string): LaneEstimate | null {
  const a = CITIES[from], b = CITIES[to];
  if (!a || !b || from === to) return null;
  return estimateFromMiles(greatCircleMiles(a, b));
}

/** "Chicago, IL" -> "Chicago" */
export const shortName = (name: string) => name.split(',')[0];

/** Nearest listed city within `maxMiles`, or null. */
export function nearestCity(lat: number, lon: number, maxMiles = 250): string | null {
  let best: string | null = null, bestMi = Infinity;
  for (const n of CITY_NAMES) {
    const mi = greatCircleMiles([lat, lon], CITIES[n]);
    if (mi < bestMi) { bestMi = mi; best = n; }
  }
  return bestMi <= maxMiles ? best : null;
}

/** Parses a `?near=lat,lon` override (used to preview the geo guess anywhere). */
export function parseNear(search: string): { lat: number; lon: number } | null {
  const near = new URLSearchParams(search).get('near');
  if (!near) return null;
  const [lat, lon] = near.split(',').map(Number);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

/**
 * The visitor's approximate pickup city: `?near=` override, else /api/geo (Vercel's IP
 * geolocation headers, nothing sent to a third party), else null (keep the Chicago hub).
 */
export async function guessOrigin(search = window.location.search): Promise<string | null> {
  let geo: { lat: number; lon: number } | null = parseNear(search);
  if (!geo) {
    try {
      const r = await fetch('/api/geo', { cache: 'no-store' });
      const json = r.ok && (r.headers.get('content-type') || '').includes('json') ? await r.json() : null;
      if (json && json.found && Number.isFinite(json.lat) && Number.isFinite(json.lon)) geo = { lat: json.lat, lon: json.lon };
    } catch {
      /* offline or no API in dev: keep the hub */
    }
  }
  return geo ? nearestCity(geo.lat, geo.lon) : null;
}
