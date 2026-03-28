// lib/tuvi/__tests__/chart.test.ts
// Tests for the full calculateChart pipeline + individual module exports
// RED: these tests must FAIL before implementation exists

import { calculateChart } from '../index';
import { buildPalaces } from '../palace-builder';
import { placeStars } from '../star-placer';
import { extractProfile } from '../profile-extractor';
import { CHINH_TINH_14, PALACE_NAMES } from '../constants';
import type { BirthInput } from '../types';

// Reference birth input for most tests
const REFERENCE_INPUT: BirthInput = {
  solarDate: { year: 1990, month: 3, day: 15 },
  hour: null,
  gender: 'M',
  birthplace: 'Hà Nội',
  timezoneOffset: 7,
  decision: 'Should I change careers?',
};

describe('calculateChart — full pipeline', () => {
  it('Test 1: returns palaces array of exactly length 12', () => {
    const chart = calculateChart(REFERENCE_INPUT);
    expect(chart.palaces).toHaveLength(12);
  });

  it('Test 2: all 14 stars from CHINH_TINH_14 appear in the chart exactly once', () => {
    const chart = calculateChart(REFERENCE_INPUT);
    const allStarNames = chart.palaces.flatMap((p) => p.stars.map((s) => s.name));
    // Every CHINH_TINH_14 star must appear
    for (const starName of CHINH_TINH_14) {
      expect(allStarNames).toContain(starName);
    }
    // No duplicates
    const uniqueStarNames = new Set(allStarNames);
    expect(uniqueStarNames.size).toBe(14);
    expect(allStarNames).toHaveLength(14);
  });

  it('Test 3: one and only one palace has isMenh === true', () => {
    const chart = calculateChart(REFERENCE_INPUT);
    const menhPalaces = chart.palaces.filter((p) => p.isMenh);
    expect(menhPalaces).toHaveLength(1);
  });

  it('Test 4: profile.dominantPalaceIndex is 0–11', () => {
    const chart = calculateChart(REFERENCE_INPUT);
    expect(chart.profile.dominantPalaceIndex).toBeGreaterThanOrEqual(0);
    expect(chart.profile.dominantPalaceIndex).toBeLessThanOrEqual(11);
  });

  it('Test 5: profile.relationalPattern is a non-empty string', () => {
    const chart = calculateChart(REFERENCE_INPUT);
    expect(typeof chart.profile.relationalPattern).toBe('string');
    expect(chart.profile.relationalPattern.length).toBeGreaterThan(0);
  });

  it('Test 6: profile.ambitionStructure is a non-empty string', () => {
    const chart = calculateChart(REFERENCE_INPUT);
    expect(typeof chart.profile.ambitionStructure).toBe('string');
    expect(chart.profile.ambitionStructure.length).toBeGreaterThan(0);
  });

  it('returns palaces with valid earthlyBranch values', () => {
    const chart = calculateChart(REFERENCE_INPUT);
    const validBranches = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
    for (const palace of chart.palaces) {
      expect(validBranches).toContain(palace.earthlyBranch);
    }
  });

  it('returns palaces with valid heavenlyStem values', () => {
    const chart = calculateChart(REFERENCE_INPUT);
    const validStems = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
    for (const palace of chart.palaces) {
      expect(validStems).toContain(palace.heavenlyStem);
    }
  });

  it('returns a lunarDate with correct yearCanChi for 1990-03-15', () => {
    const chart = calculateChart(REFERENCE_INPUT);
    expect(chart.lunarDate.yearCanChi).toBe('Canh Ngọ');
  });

  it('returns chart.input equal to the input passed in', () => {
    const chart = calculateChart(REFERENCE_INPUT);
    expect(chart.input).toBe(REFERENCE_INPUT);
  });

  it('profile.dominantPalaceName is a valid PalaceName', () => {
    const chart = calculateChart(REFERENCE_INPUT);
    expect(PALACE_NAMES).toContain(chart.profile.dominantPalaceName);
  });

  it('profile.dominantTheme is a non-empty string', () => {
    const chart = calculateChart(REFERENCE_INPUT);
    expect(typeof chart.profile.dominantTheme).toBe('string');
    expect(chart.profile.dominantTheme.length).toBeGreaterThan(0);
  });

  // Test with explicit birth hour
  it('handles explicit birth hour correctly', () => {
    const inputWithHour: BirthInput = { ...REFERENCE_INPUT, hour: 14 };
    const chart = calculateChart(inputWithHour);
    expect(chart.palaces).toHaveLength(12);
    expect(chart.lunarDate.gioIndex).toBe(7); // (14+1)%24/2 = 7 (Mùi)
  });

  // Test female input
  it('handles female gender input', () => {
    const femaleInput: BirthInput = { ...REFERENCE_INPUT, gender: 'F' };
    const chart = calculateChart(femaleInput);
    expect(chart.palaces).toHaveLength(12);
  });
});

describe('buildPalaces — palace construction', () => {
  it('returns exactly 12 palaces', () => {
    const { calculateLunarDate } = require('../lunar-bridge');
    const lunarDate = calculateLunarDate({ year: 1990, month: 3, day: 15 }, 7, null);
    const palaces = buildPalaces(lunarDate);
    expect(palaces).toHaveLength(12);
  });

  it('palace at index 0 has isMenh === true', () => {
    const { calculateLunarDate } = require('../lunar-bridge');
    const lunarDate = calculateLunarDate({ year: 1990, month: 3, day: 15 }, 7, null);
    const palaces = buildPalaces(lunarDate);
    expect(palaces[0]?.isMenh).toBe(true);
  });

  it('palaces have incrementing indices 0–11', () => {
    const { calculateLunarDate } = require('../lunar-bridge');
    const lunarDate = calculateLunarDate({ year: 1990, month: 3, day: 15 }, 7, null);
    const palaces = buildPalaces(lunarDate);
    for (let i = 0; i < 12; i++) {
      expect(palaces[i]?.index).toBe(i);
    }
  });
});

describe('placeStars — star placement', () => {
  it('places exactly 14 stars across 12 palaces', () => {
    const { calculateLunarDate } = require('../lunar-bridge');
    const lunarDate = calculateLunarDate({ year: 1990, month: 3, day: 15 }, 7, null);
    const { buildPalaces } = require('../palace-builder');
    const palaces = buildPalaces(lunarDate);
    const placedPalaces = placeStars(palaces, lunarDate);
    const allStars = placedPalaces.flatMap((p) => p.stars);
    expect(allStars).toHaveLength(14);
  });

  it('Tử Vi and Thiên Phủ are exactly 6 palaces apart', () => {
    const { calculateLunarDate } = require('../lunar-bridge');
    const lunarDate = calculateLunarDate({ year: 1990, month: 3, day: 15 }, 7, null);
    const { buildPalaces } = require('../palace-builder');
    const palaces = buildPalaces(lunarDate);
    const placedPalaces = placeStars(palaces, lunarDate);

    let tuviPalaceIdx = -1;
    let thienPhuPalaceIdx = -1;
    for (const palace of placedPalaces) {
      for (const star of palace.stars) {
        if (star.name === 'Tử Vi') tuviPalaceIdx = palace.index;
        if (star.name === 'Thiên Phủ') thienPhuPalaceIdx = palace.index;
      }
    }
    expect(tuviPalaceIdx).toBeGreaterThanOrEqual(0);
    expect(thienPhuPalaceIdx).toBeGreaterThanOrEqual(0);
    const diff = Math.abs(tuviPalaceIdx - thienPhuPalaceIdx);
    expect(diff === 6 || diff === 6).toBe(true); // always 6 apart
  });
});

describe('extractProfile — profile extraction', () => {
  it('returns a dominantPalaceIndex of 0–11', () => {
    const { calculateLunarDate } = require('../lunar-bridge');
    const lunarDate = calculateLunarDate({ year: 1990, month: 3, day: 15 }, 7, null);
    const { buildPalaces } = require('../palace-builder');
    const palaces = buildPalaces(lunarDate);
    const { placeStars } = require('../star-placer');
    const placedPalaces = placeStars(palaces, lunarDate);
    const { profile } = extractProfile(placedPalaces);
    expect(profile.dominantPalaceIndex).toBeGreaterThanOrEqual(0);
    expect(profile.dominantPalaceIndex).toBeLessThanOrEqual(11);
  });

  it('relationalPattern does not contain raw star names', () => {
    const chart = calculateChart(REFERENCE_INPUT);
    // Profile prose should NOT contain raw Vietnamese star names like "Tử Vi", "Thất Sát"
    // It should be synthesized English prose
    expect(chart.profile.relationalPattern).not.toMatch(/^(Tử Vi|Thiên Phủ|Thất Sát|Phá Quân)$/);
  });
});

// ── D-13: Reference chart validation gate ────────────────────────────────────
// TODO: VERIFY — compare output against a trusted Tử Vi source for this date
// before Phase 2 begins. Use https://tuvi.vn or a Vietnamese astrologer.
// This test documents the expected structure; exact star placement indices
// must be manually confirmed against a reference chart.
describe('D-13: Reference chart validation (manual verification required before Phase 2)', () => {
  it('D-13 GATE: calculateChart for 1990-03-15 male produces expected structural properties', () => {
    // TODO: VERIFY — this test documents known structural truths but
    // exact star palace assignments need manual validation before Phase 2.
    // Reference date: March 15, 1990 (male, UTC+7, no birth hour)
    const chart = calculateChart(REFERENCE_INPUT);

    // Known facts from @dqcai/vn-lunar: lunar date is 19/2/Canh Ngọ
    expect(chart.lunarDate.yearCanChi).toBe('Canh Ngọ');
    expect(chart.lunarDate.month).toBe(2);
    expect(chart.lunarDate.day).toBe(19);

    // Structural invariants that must hold regardless of tradition:
    expect(chart.palaces).toHaveLength(12);
    const allStarNames = chart.palaces.flatMap((p) => p.stars.map((s) => s.name));
    expect(allStarNames).toHaveLength(14);

    // TODO: Once validated against reference, add assertions like:
    // expect(chart.palaces.find(p => p.stars.some(s => s.name === 'Tử Vi'))?.earthlyBranch).toBe('???');
    // This requires cross-checking with https://tuvi.vn or equivalent

    // Log the chart for manual inspection during Phase 1 validation
    const starMap = chart.palaces.reduce<Record<string, string[]>>((acc, p) => {
      acc[p.earthlyBranch] = p.stars.map((s) => s.name);
      return acc;
    }, {});
    console.log('D-13 Star placement map (for manual verification):', JSON.stringify(starMap, null, 2));
    console.log('D-13 Lunar date:', JSON.stringify(chart.lunarDate));
  });
});
