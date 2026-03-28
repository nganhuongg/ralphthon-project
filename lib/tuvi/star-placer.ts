// lib/tuvi/star-placer.ts
// Places 14 main stars (chính tinh) across 12 palaces
// Algorithm: standard Vietnamese Tử Vi tradition
// Cross-reference: tuvi-neo repository (algorithmic reference only — not a dependency)
// The 14 stars split into two groups anchored by Tử Vi and Thiên Phủ

import { STAR_WEIGHTS } from './constants';
import type { LunarDate, Palace, Star, StarName } from './types';

// Tử Vi palace index lookup by lunar day of birth
// Standard table: indexed by lunar day 1–30 → palace branch index 0–11
// Source: Vietnamese Tử Vi tradition (Cung An Tử Vi algorithm)
// The palace is identified by earthly branch; index here = branch index (0=Tý)
const TUVI_BRANCH_BY_LUNAR_DAY: Record<number, number> = {
  1:  2,  2:  1,  3:  0,  4: 11,  5: 10,
  6:  9,  7:  8,  8:  7,  9:  6, 10:  5,
  11: 4, 12:  3, 13:  2, 14:  1, 15:  0,
  16: 11, 17: 10, 18:  9, 19:  8, 20:  7,
  21: 6, 22:  5, 23:  4, 24:  3, 25:  2,
  26: 1, 27:  0, 28: 11, 29: 10, 30:  9,
};

// Tử Vi group: relative offsets from Tử Vi branch index (clockwise = positive)
// Tử Vi is at offset 0; other stars are placed at offset positions
// Counter-clockwise direction: offset -1 means one palace counter-clockwise
const TUVI_GROUP_OFFSETS: Readonly<Record<StarName, number>> = {
  'Tử Vi':      0,
  'Thiên Cơ':  -1,
  'Thái Dương': -2,
  'Vũ Khúc':   -3,
  'Thiên Đồng': -4,
  'Liêm Trinh': -5,
  // Thiên Phủ group — handled separately
  'Thiên Phủ':  0,
  'Thái Âm':    0,
  'Tham Lang':  0,
  'Cự Môn':     0,
  'Thiên Tướng': 0,
  'Thiên Lương': 0,
  'Thất Sát':   0,
  'Phá Quân':   0,
};

// Thiên Phủ is placed symmetrically opposite Tử Vi (6 branches away)
// Relative offsets from Thiên Phủ branch (clockwise = positive)
const THIEN_PHU_GROUP_OFFSETS: Readonly<Partial<Record<StarName, number>>> = {
  'Thiên Phủ':   0,
  'Thái Âm':     1,
  'Tham Lang':   2,
  'Cự Môn':      3,
  'Thiên Tướng': 4,
  'Thiên Lương': 5,
  'Thất Sát':    6,
  'Phá Quân':   10,
};

export function placeStars(palaces: Palace[], lunarDate: LunarDate): Palace[] {
  // Clone palaces to avoid mutation
  const cloned = palaces.map((p) => ({ ...p, stars: [] as Star[] }));

  // Build a lookup: branch index → palace index in our palace array
  const branchToPalaceIndex = new Map<number, number>();
  for (const palace of cloned) {
    const branchIndex = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi']
      .indexOf(palace.earthlyBranch);
    if (branchIndex !== -1) {
      branchToPalaceIndex.set(branchIndex, palace.index);
    }
  }

  // Place Tử Vi anchor: based on lunar day of birth
  const tuviBranchIndex = TUVI_BRANCH_BY_LUNAR_DAY[lunarDate.day] ?? 0;

  // Thiên Phủ is always 6 branches away (diametrically opposite)
  const thienPhuBranchIndex = (tuviBranchIndex + 6) % 12;

  // Place Tử Vi group (6 stars)
  const tuviGroupStars: StarName[] = ['Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Thiên Đồng', 'Liêm Trinh'];
  for (const starName of tuviGroupStars) {
    const offset = TUVI_GROUP_OFFSETS[starName] ?? 0;
    const targetBranch = ((tuviBranchIndex + offset) + 12) % 12;
    const palaceIdx = branchToPalaceIndex.get(targetBranch);
    if (palaceIdx !== undefined) {
      const star: Star = {
        name: starName,
        weight: STAR_WEIGHTS[starName],
        brightness: null, // Brightness calc requires full stem/branch analysis — deferred
      };
      cloned[palaceIdx]?.stars.push(star);
    }
  }

  // Place Thiên Phủ group (8 stars)
  const thienPhuGroupStars: StarName[] = [
    'Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn',
    'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân',
  ];
  for (const starName of thienPhuGroupStars) {
    const offset = THIEN_PHU_GROUP_OFFSETS[starName] ?? 0;
    const targetBranch = (thienPhuBranchIndex + offset) % 12;
    const palaceIdx = branchToPalaceIndex.get(targetBranch);
    if (palaceIdx !== undefined) {
      const star: Star = {
        name: starName,
        weight: STAR_WEIGHTS[starName],
        brightness: null,
      };
      cloned[palaceIdx]?.stars.push(star);
    }
  }

  return cloned;
}
