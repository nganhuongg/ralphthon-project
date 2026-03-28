// lib/tuvi/constants.ts
// Immutable reference data for Tử Vi calculation.
// All arrays are readonly. No logic — only data.

import type { StarName, PalaceName } from './types';

// ── 14 Main Stars (Chính Tinh) ────────────────────────────────────────────────
// Canonical order: Tử Vi group (6 stars) first, then Thiên Phủ group (8 stars)
// Tử Vi group:    Tử Vi, Thiên Cơ, Thái Dương, Vũ Khúc, Thiên Đồng, Liêm Trinh
// Thiên Phủ group: Thiên Phủ, Thái Âm, Tham Lang, Cự Môn, Thiên Tướng, Thiên Lương, Thất Sát, Phá Quân
// Source: Standard Vietnamese Tử Vi tradition

export const CHINH_TINH_14: readonly StarName[] = [
  'Tử Vi',
  'Thiên Cơ',
  'Thái Dương',
  'Vũ Khúc',
  'Thiên Đồng',
  'Liêm Trinh',
  'Thiên Phủ',
  'Thái Âm',
  'Tham Lang',
  'Cự Môn',
  'Thiên Tướng',
  'Thiên Lương',
  'Thất Sát',
  'Phá Quân',
] as const;

// ── Palace Names (12 palaces, counter-clockwise from Mệnh) ───────────────────

export const PALACE_NAMES: readonly PalaceName[] = [
  'Mệnh',
  'Phụ Mẫu',
  'Phúc Đức',
  'Điền Trạch',
  'Quan Lộc',
  'Nô Bộc',
  'Thiên Di',
  'Tật Ách',
  'Tài Bạch',
  'Tử Tức',
  'Phu Thê',
  'Huynh Đệ',
] as const;

// ── Palace English Glosses (per D-04) ────────────────────────────────────────

export const PALACE_GLOSSES: Record<PalaceName, string> = {
  'Mệnh': 'life & destiny',
  'Phụ Mẫu': 'parents & heritage',
  'Phúc Đức': 'fortune & virtue',
  'Điền Trạch': 'home & property',
  'Quan Lộc': 'career & authority',
  'Nô Bộc': 'subordinates',
  'Thiên Di': 'travel & movement',
  'Tật Ách': 'health & obstacles',
  'Tài Bạch': 'wealth & resources',
  'Tử Tức': 'children & creativity',
  'Phu Thê': 'spouse & partnership',
  'Huynh Đệ': 'siblings & peers',
};

// ── Heavenly Stems (10 Thiên Can) ────────────────────────────────────────────

export const HEAVENLY_STEMS = [
  'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu',
  'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý',
] as const;

export type HeavenlyStem = typeof HEAVENLY_STEMS[number];

// ── Earthly Branches (12 Địa Chi) ────────────────────────────────────────────

export const EARTHLY_BRANCHES = [
  'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
  'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi',
] as const;

export type EarthlyBranch = typeof EARTHLY_BRANCHES[number];

// ── 12 Giờ Blocks ────────────────────────────────────────────────────────────
// Tý hour starts at 23:00; each block = 2 hours

export const GIO_NAMES: readonly string[] = [
  'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
  'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi',
];

// Default giờ index when birth hour not provided (per D-01): Giờ Ngọ = index 6
export const DEFAULT_GIO_INDEX = 6;

// ── Star weights for dominant palace detection ────────────────────────────────
// Higher weight = more influential for profile extraction

export const STAR_WEIGHTS: Record<StarName, number> = {
  'Tử Vi': 10,
  'Thiên Phủ': 9,
  'Thái Dương': 7,
  'Thái Âm': 7,
  'Tham Lang': 6,
  'Cự Môn': 6,
  'Thiên Tướng': 6,
  'Thiên Đồng': 5,
  'Liêm Trinh': 6,
  'Vũ Khúc': 7,
  'Thiên Cơ': 6,
  'Thiên Lương': 6,
  'Thất Sát': 8,
  'Phá Quân': 8,
};

// ── Risk stars (for PROF-02) ──────────────────────────────────────────────────
// Primary challenging stars in Vietnamese Tử Vi tradition

export const RISK_STARS: readonly StarName[] = [
  'Thất Sát',
  'Phá Quân',
  'Tham Lang',
  'Liêm Trinh',
] as const;

// ── 4×4 Grid Palace Position Map (per D-03, Pattern 5 in RESEARCH.md) ────────
// Maps palace index (0–11) to [row, col] in the 4×4 grid
// Center cells (rows 1–2, cols 1–2) are chart metadata
// Counter-clockwise from bottom-right: standard Vietnamese layout

export const PALACE_GRID_POSITIONS: Record<number, [number, number]> = {
  0:  [3, 3], // bottom-right
  1:  [3, 2],
  2:  [3, 1],
  3:  [3, 0], // bottom-left
  4:  [2, 0],
  5:  [1, 0],
  6:  [0, 0], // top-left
  7:  [0, 1],
  8:  [0, 2],
  9:  [0, 3], // top-right
  10: [1, 3],
  11: [2, 3],
};
