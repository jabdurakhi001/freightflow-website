import { describe, expect, it } from 'vitest';
import { CITIES } from './lanes';
import { MAP_H, MAP_W, laneControl, projectAlbers } from './projection';

describe('Albers USA (lower 48) projection', () => {
  it('puts the projection centre (-0.6°, 38.7° after the 96° rotation) at the translate point', () => {
    const [x, y] = projectAlbers([38.7, -96.6]);
    expect(x).toBeCloseTo(487.5, 1);
    expect(y).toBeCloseTo(305, 1);
  });

  it('keeps every listed city inside the 975×610 map box, west to east and north to south', () => {
    for (const ll of Object.values(CITIES)) {
      const [x, y] = projectAlbers(ll);
      expect(x).toBeGreaterThan(0); expect(x).toBeLessThan(MAP_W);
      expect(y).toBeGreaterThan(0); expect(y).toBeLessThan(MAP_H);
    }
    expect(projectAlbers(CITIES['Seattle, WA'])[0]).toBeLessThan(projectAlbers(CITIES['Chicago, IL'])[0]);
    expect(projectAlbers(CITIES['Miami, FL'])[1]).toBeGreaterThan(projectAlbers(CITIES['Chicago, IL'])[1]);
  });

  it('bends the lane arc to the left of travel, at most 80px', () => {
    const c = laneControl([0, 0], [1000, 0]);
    expect(c).toEqual([500, -80]);
  });
});
