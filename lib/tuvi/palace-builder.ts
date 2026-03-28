// lib/tuvi/palace-builder.ts
// Builds the 12 palace structure from a LunarDate
// Palace assignment algorithm: standard Vietnamese Tử Vi tradition
// Mệnh palace branch is derived from birth lunar month and birth giờ

import { PALACE_NAMES, EARTHLY_BRANCHES, HEAVENLY_STEMS } from './constants';
import type { LunarDate, Palace, PalaceName } from './types';

// Mệnh palace branch index table: indexed by (lunarMonth - 1) for birth months 1–12
// Month 1 (Giêng) → Dần (index 2); counter-clockwise assignment follows
// Source: Standard Vietnamese Tử Vi algorithm
const MENH_BRANCH_BY_MONTH: readonly number[] = [
  2,  // Month 1  → Dần (index 2)
  3,  // Month 2  → Mão
  4,  // Month 3  → Thìn
  5,  // Month 4  → Tỵ
  6,  // Month 5  → Ngọ
  7,  // Month 6  → Mùi
  8,  // Month 7  → Thân
  9,  // Month 8  → Dậu
  10, // Month 9  → Tuất
  11, // Month 10 → Hợi
  0,  // Month 11 → Tý
  1,  // Month 12 → Sửu
] as const;

// Palace heavenly stem lookup table
// Year stems map to palace stem starting points (An Cung Trụ Mệnh rule)
// For year stem Giáp/Kỷ (0,5): Tý palace gets Bính
// For year stem Ất/Canh (1,6): Tý palace gets Mậu
// For year stem Bính/Tân (2,7): Tý palace gets Canh
// For year stem Đinh/Nhâm (3,8): Tý palace gets Nhâm
// For year stem Mậu/Quý (4,9): Tý palace gets Giáp
const TY_PALACE_STEM_BY_YEAR_STEM: readonly number[] = [
  2,  // Giáp (0) → Bính (2)
  4,  // Ất (1)   → Mậu (4)
  6,  // Bính (2) → Canh (6)
  8,  // Đinh (3) → Nhâm (8)
  0,  // Mậu (4)  → Giáp (0)
  2,  // Kỷ (5)   → Bính (2)
  4,  // Canh (6) → Mậu (4)
  6,  // Tân (7)  → Canh (6)
  8,  // Nhâm (8) → Nhâm (8)
  0,  // Quý (9)  → Giáp (0)
] as const;

export function buildPalaces(lunarDate: LunarDate): Palace[] {
  const lunarMonth = lunarDate.month; // leap month uses same index as regular for palace assignment

  // Mệnh branch: base branch from birth month, adjusted by birth giờ
  const baseBranch = MENH_BRANCH_BY_MONTH[(lunarMonth - 1) % 12] ?? 0;
  // Giờ adjustment: subtract giờ index from base branch (mod 12)
  const menhBranchIndex = ((baseBranch - lunarDate.gioIndex) + 12) % 12;

  // Derive palace heavenly stems using An Cung Trụ Mệnh rule
  // Stems cycle from the Tý palace (branch index 0) based on birth year stem
  const yearStem = lunarDate.yearCanChi.split(' ')[0] ?? 'Giáp';
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem as typeof HEAVENLY_STEMS[number]);
  const safeYearStemIndex = yearStemIndex === -1 ? 0 : yearStemIndex;

  // Stem for palace at branch 0 (Tý)
  const tyStemIndex = TY_PALACE_STEM_BY_YEAR_STEM[safeYearStemIndex] ?? 0;

  const palaces: Palace[] = [];
  for (let i = 0; i < 12; i++) {
    // Each palace i is at branch (menhBranchIndex + i) % 12
    // Palaces go counter-clockwise: branch index increases with palace index
    const branchIndex = (menhBranchIndex + i) % 12;

    // Palace stem: stems cycle from Tý palace position, +1 per palace (mod 10)
    // Branch Tý is at index 0; branchIndex tells us how far from Tý we are
    const stemIndex = (tyStemIndex + branchIndex) % 10;

    palaces.push({
      index: i,
      name: PALACE_NAMES[i] as PalaceName,
      earthlyBranch: EARTHLY_BRANCHES[branchIndex] ?? 'Tý',
      heavenlyStem: HEAVENLY_STEMS[stemIndex] ?? 'Giáp',
      stars: [],
      isMenh: i === 0,
      isDominant: false,
    });
  }

  return palaces;
}
