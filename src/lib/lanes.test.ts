import { describe, expect, it } from 'vitest';
import { estimateFromMiles, estimateLane, greatCircleMiles, CITIES, nearestCity, parseNear, shortName } from './lanes';

describe('lane estimate', () => {
  it.each([
    ['Chicago, IL', 'Dallas, TX', 970, 2],
    ['Chicago, IL', 'Seattle, WA', 2080, 5],
    ['Atlanta, GA', 'Seattle, WA', 2610, 6],
  ])('%s to %s is %i road miles, %i days', (from, to, road, days) => {
    expect(estimateLane(from, to)).toEqual({ road, days });
  });

  it('is symmetric', () => {
    expect(estimateLane('Dallas, TX', 'Chicago, IL')).toEqual(estimateLane('Chicago, IL', 'Dallas, TX'));
  });

  it('applies the 1.2 road factor and rounds to the nearest 10 miles', () => {
    expect(estimateFromMiles(100)).toEqual({ road: 120, days: 1 });
    expect(estimateFromMiles(104)).toEqual({ road: 120, days: 1 }); // 124.8 -> 120
    expect(estimateFromMiles(105)).toEqual({ road: 130, days: 1 }); // 126 -> 130
  });

  it('rounds days up at 500 miles a day, never below one', () => {
    expect(estimateFromMiles(1).days).toBe(1);
    expect(estimateFromMiles(0).days).toBe(1);
    expect(estimateFromMiles(500 / 1.2).days).toBe(1); // exactly 500 road miles
    expect(estimateFromMiles(510 / 1.2).days).toBe(2);
  });

  it('returns null for the same city or an unknown one', () => {
    expect(estimateLane('Chicago, IL', 'Chicago, IL')).toBeNull();
    expect(estimateLane('Chicago, IL', 'Nowhere, ZZ')).toBeNull();
  });

  it('measures great-circle distance in statute miles', () => {
    expect(greatCircleMiles(CITIES['Chicago, IL'], CITIES['Chicago, IL'])).toBe(0);
    expect(greatCircleMiles(CITIES['New York, NY'], CITIES['Los Angeles, CA'])).toBeCloseTo(2445, -1);
  });
});

describe('visitor origin', () => {
  it('snaps to the nearest listed city within 250 miles', () => {
    expect(nearestCity(41.9, -87.7)).toBe('Chicago, IL');
    expect(nearestCity(47.4, -122.2)).toBe('Seattle, WA');
    expect(nearestCity(64.8, -147.7)).toBeNull(); // Fairbanks: too far from any listed city
  });

  it('parses the ?near= override', () => {
    expect(parseNear('?near=33.7,-84.4')).toEqual({ lat: 33.7, lon: -84.4 });
    expect(parseNear('?near=abc')).toBeNull();
    expect(parseNear('')).toBeNull();
  });

  it('shortens city names', () => {
    expect(shortName('St. Louis, MO')).toBe('St. Louis');
  });
});
