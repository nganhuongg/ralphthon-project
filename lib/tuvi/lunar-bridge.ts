// lib/tuvi/lunar-bridge.ts
// Adapter: Gregorian SolarDate + timezone offset → LunarDate
// Uses @dqcai/vn-lunar for calendar math (never call this library elsewhere)
// All timezone offset application happens HERE before passing to library

import { LunarCalendar } from '@dqcai/vn-lunar';
import { GIO_NAMES, DEFAULT_GIO_INDEX, HEAVENLY_STEMS, EARTHLY_BRANCHES } from './constants';
import type { SolarDate, LunarDate } from './types';

// Vietnamese cities → UTC+7 (Vietnam is uniformly UTC+7)
const VN_CITIES = [
  'hà nội', 'hanoi', 'hồ chí minh', 'ho chi minh', 'saigon', 'sài gòn',
  'đà nẵng', 'da nang', 'hải phòng', 'hai phong', 'cần thơ', 'can tho',
  'huế', 'hue', 'nha trang', 'đà lạt', 'da lat', 'vũng tàu', 'vung tau',
  'việt nam', 'vietnam', 'viet nam',
];

export function birthplaceToTimezoneOffset(birthplace: string): number {
  const normalized = birthplace.toLowerCase().trim();
  if (VN_CITIES.some((city) => normalized.includes(city))) {
    return 7; // UTC+7
  }
  // For non-Vietnamese birthplaces: default to UTC+7 for Phase 1
  // Vietnam is the primary demo use case; diaspora refinement is Phase 2+
  return 7;
}

// Convert hour 0–23 (local time) to 12-giờ block index 0–11
// Tý (index 0) spans 23:00–00:59 (the tricky midnight boundary)
// Per D-01: null → default Giờ Ngọ (index 6)
export function hourToGioIndex(hour: number | null): number {
  if (hour === null) return DEFAULT_GIO_INDEX;
  // Tý hour: 23:00–00:59 wraps midnight
  // Formula: (hour + 1) wraps 23→0, then divide by 2
  return Math.floor(((hour + 1) % 24) / 2);
}

// Derive hour Can Chi from day stem index and giờ index
// Ngũ Tử Hoàn Nguyên formula: standard Vietnamese Tử Vi algorithm
function deriveHourCanChi(dayCanChi: string, gioIndex: number): string {
  // Extract day stem (first character/word of dayCanChi)
  const dayStem = dayCanChi.split(' ')[0] ?? 'Giáp';
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem as typeof HEAVENLY_STEMS[number]);
  const safeDayStemIndex = dayStemIndex === -1 ? 0 : dayStemIndex;

  // Hour stem cycles: starts at different points based on day stem parity
  // Day stems Giáp/Kỷ (0,5)   → hour stem starts at Giáp (0)
  // Day stems Ất/Canh (1,6)   → hour stem starts at Bính (2)
  // Day stems Bính/Tân (2,7)  → hour stem starts at Mậu (4)
  // Day stems Đinh/Nhâm (3,8) → hour stem starts at Canh (6)
  // Day stems Mậu/Quý (4,9)   → hour stem starts at Nhâm (8)
  const HOUR_STEM_STARTS = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8] as const; // indexed by day stem
  const startStem = HOUR_STEM_STARTS[safeDayStemIndex] ?? 0;

  const hourStemIndex = (startStem + gioIndex) % 10;
  const hourBranchIndex = gioIndex % 12;

  const stem = HEAVENLY_STEMS[hourStemIndex] ?? HEAVENLY_STEMS[0];
  const branch = EARTHLY_BRANCHES[hourBranchIndex] ?? EARTHLY_BRANCHES[0];
  return `${stem} ${branch}`;
}

export function calculateLunarDate(solar: SolarDate, timezoneOffset: number, hour: number | null): LunarDate {
  // @dqcai/vn-lunar: fromSolar(day, month, year) — day first
  const calendar = LunarCalendar.fromSolar(solar.day, solar.month, solar.year);
  const lunarRaw = calendar.lunarDate; // { day, month, year, leap, jd }

  const gioIndex = hourToGioIndex(hour);
  const gioName = GIO_NAMES[gioIndex] ?? 'Ngọ';

  // Hour Can Chi derived from day stem and giờ index
  const hourCanChi = deriveHourCanChi(calendar.dayCanChi, gioIndex);

  return {
    year: lunarRaw.year,
    month: lunarRaw.month,
    day: lunarRaw.day,
    isLeapMonth: lunarRaw.leap,   // @dqcai/vn-lunar uses .leap not .isLeapMonth
    yearCanChi: calendar.yearCanChi,
    monthCanChi: calendar.monthCanChi,
    dayCanChi: calendar.dayCanChi,
    hourCanChi,
    gioIndex,
    gioName,
  };
}
