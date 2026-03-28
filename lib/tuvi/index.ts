// lib/tuvi/index.ts
// Public API: calculateChart(input: BirthInput) → TuViChart
// Synchronous, no side effects, no async — (per RESEARCH.md Pattern 1)

import { calculateLunarDate, birthplaceToTimezoneOffset } from './lunar-bridge';
import { buildPalaces } from './palace-builder';
import { placeStars } from './star-placer';
import { extractProfile } from './profile-extractor';
import type { BirthInput, TuViChart } from './types';

export function calculateChart(input: BirthInput): TuViChart {
  const lunarDate = calculateLunarDate(input.solarDate, input.timezoneOffset, input.hour);
  const emptyPalaces = buildPalaces(lunarDate);
  const palacesWithStars = placeStars(emptyPalaces, lunarDate);
  const { palaces, profile } = extractProfile(palacesWithStars);

  return {
    input,
    lunarDate,
    palaces,
    profile,
  };
}

// Re-export types for convenience
export type { BirthInput, TuViChart } from './types';

// Re-export utility for form layer
export { birthplaceToTimezoneOffset } from './lunar-bridge';
