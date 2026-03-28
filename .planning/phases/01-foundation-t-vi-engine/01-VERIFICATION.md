---
phase: 01-foundation-t-vi-engine
verified: 2026-03-28T12:00:00Z
status: human_needed
score: 19/20 must-haves verified
re_verification: false
human_verification:
  - test: "D-13 gate — validate star placement for reference chart against external source"
    expected: "Star placement for birthday March 15, 1990 (male, UTC+7, no birth hour) matches a trusted Vietnamese Tử Vi reference (e.g. tuvi.vn)"
    why_human: "The chart.test.ts D-13 test contains only structural assertions (12 palaces, 14 stars, yearCanChi). The exact earthly branch assigned to each star has not been cross-checked against an external reference. The SUMMARY documents this validation as 'D-13 gate cleared — approved by user' but no specific branch-level assertions were added to the test file. Algorithmic correctness of star placement cannot be verified programmatically without a known-correct reference fixture."
---

# Phase 1: Foundation and Tử Vi Engine Verification Report

**Phase Goal:** A verified Tử Vi chart engine exists that accepts birthday + birthplace and produces a correct, typed chart with psychological profile — the foundational data contract all other phases depend on
**Verified:** 2026-03-28T12:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Next.js 14 App Router project runs without errors (npm run build exits 0) | VERIFIED | `npm run build` exits 0; static output generated for / and /_not-found |
| 2 | TypeScript strict mode is active — tsc --noEmit passes with zero errors | VERIFIED | `npx tsc --noEmit` exits 0; tsconfig.json has "strict": true and "noUncheckedIndexedAccess": true |
| 3 | TuViChart, BirthInput, Palace, Star, PsychProfile, PathState, GriefEntry types are exported from lib/tuvi/types.ts | VERIFIED | All 12 types confirmed in lib/tuvi/types.ts: SolarDate, BirthInput, LunarDate, StarName, Star, PalaceName, Palace, TuViChart, PsychProfile, PathId, PathNode, PathState, GriefEntry |
| 4 | Zustand store shape covers all four slices: chart/profile (populated Phase 1), paths + grief archive (shape only, Phase 2–3) | VERIFIED | lib/store.ts exports useVerseStore with all four slices; partialize scoped to griefEntries |
| 5 | Tailwind lacquerware tokens (deep red, gold, black) are defined and visible on the page shell | VERIFIED | tailwind.config.ts defines verse-red, verse-gold, verse-black, verse-paper; app/layout.tsx uses bg-verse-black and text-verse-paper |
| 6 | Vietnamese diacritic-capable font (Be Vietnam Pro) is loaded via next/font | VERIFIED | app/layout.tsx imports Be_Vietnam_Pro with subsets: ['latin', 'vietnamese'] |
| 7 | Jest is configured and npm test runs without error | VERIFIED | jest.config.ts with ts-jest preset; 43 tests pass across 2 suites in 0.263s |
| 8 | calculateChart(input) returns a TuViChart with exactly 12 palaces | VERIFIED | Test 1 in chart.test.ts passes; confirmed by 43/43 test run |
| 9 | Each palace has an earthly branch and heavenly stem | VERIFIED | Tests for valid branches and stems in chart.test.ts pass; palace-builder.ts uses EARTHLY_BRANCHES and HEAVENLY_STEMS |
| 10 | All 14 main stars appear across the 12 palaces with no star duplicated | VERIFIED | Test 2 in chart.test.ts asserts exactly 14 unique stars; passes |
| 11 | Birth hour defaults to Giờ Ngọ (index 6) when hour is null (D-01) | VERIFIED | hourToGioIndex(null) returns DEFAULT_GIO_INDEX=6; lunar.test.ts Test 3 passes |
| 12 | Lunar year boundary handled correctly — birthday Jan 20, 1985 returns lunar year Giáp Tý not Ất Sửu | VERIFIED | lunar.test.ts Tết boundary test passes (Tết 1985 was Feb 20) |
| 13 | User can fill in date of birth (day, month, year) with separate fields | VERIFIED | components/InputForm.tsx has name="birthDay", name="birthMonth", name="birthYear" as separate inputs |
| 14 | User can fill in birthplace (text input) | VERIFIED | components/InputForm.tsx has name="birthplace" text input |
| 15 | User can fill in a life decision (textarea, minimum 10 characters) | VERIFIED | components/InputForm.tsx has name="decision" textarea; Zod schema enforces min(10) |
| 16 | Birth hour field is optional and accepts HH:MM format (D-02) | VERIFIED | type="time" input; parseTimeString handles HH:MM; birthHour uses .optional() in schema |
| 17 | Submitting without required fields shows per-field validation error messages | VERIFIED | handleSubmit iterates result.error.issues; per-field setErrors with inline error display |
| 18 | Submitting with valid data calls the onSubmit handler with a typed BirthInput | VERIFIED | formDataToBirthInput produces BirthInput; setBirthInput + onSubmit called on valid parse |
| 19 | Submitting the form produces a rendered 4x4 palace grid and psychological profile card | VERIFIED | app/page.tsx calls calculateChart synchronously; renders ChartDisplay + PsychProfile; build succeeds |
| 20 | D-13 gate: star placement for reference birthday manually verified against trusted Tử Vi source | UNCERTAIN | D-13 test exists and passes structural invariants. SUMMARY claims human approval. No specific branch-level assertions added to test. Requires human confirmation of exact star positions against external reference. |

**Score:** 19/20 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/tuvi/types.ts` | All shared TypeScript types — the data contract | VERIFIED | 13 types exported; no circular imports |
| `lib/tuvi/constants.ts` | Star names, palace names/glosses, stems/branches, weights | VERIFIED | CHINH_TINH_14 (14 unique entries), PALACE_NAMES, PALACE_GLOSSES, HEAVENLY_STEMS, EARTHLY_BRANCHES, STAR_WEIGHTS, RISK_STARS, PALACE_GRID_POSITIONS all present |
| `lib/store.ts` | Zustand v5 store with full shape, griefEntries persisted | VERIFIED | useVerseStore exported; partialize key present (not partialState); name: 'verse-grief-archive', version: 1 |
| `app/layout.tsx` | Root layout with Be Vietnam Pro font, Tailwind globals | VERIFIED | Be_Vietnam_Pro with vietnamese subset; bg-verse-black, font-verse on body |
| `tailwind.config.ts` | Lacquerware palette tokens: verse-red, verse-gold, etc. | VERIFIED | 11 verse-* tokens defined |
| `jest.config.ts` | Jest with ts-jest transform and @/* alias | VERIFIED | preset: 'ts-jest'; moduleNameMapper @/* present |
| `lib/tuvi/lunar-bridge.ts` | Gregorian to LunarDate adapter | VERIFIED | Exports calculateLunarDate, birthplaceToTimezoneOffset, hourToGioIndex; uses @dqcai/vn-lunar with correct field names (lunarRaw.leap, calendar.lunarDate) |
| `lib/tuvi/palace-builder.ts` | 12 palace construction with branch/stem assignment | VERIFIED | Exports buildPalaces; implements An Cung Tru Menh rule; MENH_BRANCH_BY_MONTH and TY_PALACE_STEM_BY_YEAR_STEM tables present |
| `lib/tuvi/star-placer.ts` | 14 main star placement across 12 palaces | VERIFIED | Exports placeStars; TUVI_BRANCH_BY_LUNAR_DAY lookup table; THIEN_PHU_GROUP_OFFSETS for Thien Phu group; branch-indexed placement |
| `lib/tuvi/profile-extractor.ts` | Deterministic profile extraction | VERIFIED | Exports extractProfile; RELATIONAL_PATTERNS and AMBITION_STRUCTURES lookup tables (all 14 stars); synthesized prose, not raw star names |
| `lib/tuvi/index.ts` | Public API: calculateChart(input) → TuViChart | VERIFIED | Exports calculateChart; synchronous pipeline: lunar → palaces → stars → profile |
| `lib/tuvi/__tests__/chart.test.ts` | Reference chart validation test (D-13) | VERIFIED | 22 tests including D-13 structural gate; all pass |
| `lib/tuvi/__tests__/lunar.test.ts` | Lunar bridge tests | VERIFIED | 21 tests; Tet boundary, midnight Gio Ty, null hour default all covered |
| `lib/tuvi/validation.ts` | Zod v4 schema for form validation | VERIFIED | InputFormSchema, formDataToBirthInput, parseTimeString exported; Zod v4 syntax used (error: param, .optional()) |
| `components/InputForm.tsx` | Controlled React form with per-field errors | VERIFIED | InputFormSchema.safeParse; result.error.issues iteration; three date fields; type="time" |
| `components/ChartDisplay/PalaceGrid.tsx` | 4x4 grid layout | VERIFIED | PALACE_GRID_POSITIONS import; gridTemplateColumns CSS grid; center 2x2 metadata span |
| `components/ChartDisplay/PalaceCell.tsx` | Single palace cell with dominant highlight | VERIFIED | motion/react import (not framer-motion); isDominant conditional animate prop; PALACE_GLOSSES import |
| `components/ChartDisplay/ChartDisplay.tsx` | Chart container | VERIFIED | Imports PalaceGrid; passes chart prop |
| `components/PsychProfile.tsx` | Profile card with prose display | VERIFIED | Renders profile.relationalPattern, profile.ambitionStructure, profile.dominantPalaceName; no raw star names hardcoded in JSX rendering |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `lib/store.ts` | `lib/tuvi/types.ts` | TypeScript import | WIRED | Imports TuViChart, BirthInput, PsychProfile, PathState, PathNode, PathId, GriefEntry |
| `app/layout.tsx` | `tailwind.config.ts` | verse-* token usage | WIRED | bg-verse-black, font-verse, text-verse-paper all used in body element |
| `lib/tuvi/index.ts` | `lib/tuvi/lunar-bridge.ts` | synchronous function call | WIRED | calculateLunarDate called in calculateChart body |
| `lib/tuvi/index.ts` | `lib/tuvi/star-placer.ts` | synchronous function call | WIRED | placeStars called in calculateChart body |
| `components/InputForm.tsx` | `lib/tuvi/validation.ts` | safeParse on submit | WIRED | InputFormSchema.safeParse(rawData); result.error.issues accessed |
| `components/InputForm.tsx` | `lib/store.ts` | setBirthInput action | WIRED | useVerseStore((s) => s.setBirthInput); called with formDataToBirthInput result |
| `app/page.tsx` | `lib/tuvi/index.ts` | calculateChart call on form submit | WIRED | calculateChart(input) called in handleFormSubmit |
| `components/ChartDisplay/PalaceGrid.tsx` | `lib/tuvi/constants.ts` | PALACE_GRID_POSITIONS import | WIRED | import { PALACE_GRID_POSITIONS } from '@/lib/tuvi/constants'; used in palace placement loop |
| `components/PsychProfile.tsx` | `lib/store.ts` | useVerseStore profile slice | PARTIAL | PsychProfile receives profile as prop from app/page.tsx (chart.profile). Does not read from store directly. This is by design — app/page.tsx owns Zustand reads and passes props down. Not a defect. |
| `lib/tuvi/lunar-bridge.ts` | `@dqcai/vn-lunar` | import | WIRED | import { LunarCalendar } from '@dqcai/vn-lunar'; LunarCalendar.fromSolar(day, month, year) called |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `components/ChartDisplay/PalaceGrid.tsx` | chart.palaces | app/page.tsx → calculateChart() → Zustand store | Yes — calculateChart is synchronous and deterministic; palaces array always 12 elements with real stars | FLOWING |
| `components/ChartDisplay/PalaceCell.tsx` | palace.stars, palace.name, palace.isDominant | Flows from PalaceGrid → placeStars → extractProfile | Yes — stars are placed by star-placer.ts algorithm; isDominant set by extractProfile | FLOWING |
| `components/PsychProfile.tsx` | profile.relationalPattern, profile.ambitionStructure | calculateChart → extractProfile → lookup tables | Yes — prose strings from RELATIONAL_PATTERNS and AMBITION_STRUCTURES; fallback string if no match | FLOWING |
| `app/page.tsx` | chart (state) | useVerseStore((s) => s.chart); populated by setChart(result) in handleFormSubmit | Yes — chart is null until form submit; then set from calculateChart result | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| calculateChart returns 12 palaces | Jest Test 1 in chart.test.ts | PASS (43/43 tests pass) | PASS |
| All 14 stars placed exactly once | Jest Test 2 in chart.test.ts | PASS | PASS |
| hourToGioIndex(null) returns 6 | Jest Test 3 in lunar.test.ts | PASS | PASS |
| Tet boundary: Jan 20 1985 → Giao Ty | Jest in lunar.test.ts | PASS | PASS |
| npm run build exits 0 | Build output shows 5 static pages generated | PASS | PASS |
| tsc --noEmit exits 0 | No output (zero errors) | PASS | PASS |
| Module exports calculateChart | lib/tuvi/index.ts line 11: export function calculateChart | CONFIRMED | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| INPUT-01 | 01-03 | User can enter date of birth (day, month, year) | SATISFIED | components/InputForm.tsx has three separate number inputs for day, month, year |
| INPUT-02 | 01-03 | User can enter birthplace | SATISFIED | components/InputForm.tsx has birthplace text input; used in formDataToBirthInput for timezoneOffset |
| INPUT-03 | 01-03 | User can enter one life decision (free text) | SATISFIED | components/InputForm.tsx has decision textarea; Zod enforces 10–500 chars |
| INPUT-04 | 01-03 | Form validates inputs before chart calculation | SATISFIED | InputFormSchema.safeParse; per-field errors from result.error.issues; onSubmit not called on validation failure |
| CHART-01 | 01-02 | Gregorian → Vietnamese lunar calendar (algorithmically exact) | SATISFIED | lib/tuvi/lunar-bridge.ts wraps @dqcai/vn-lunar (Hồ Ngọc Đức algorithm); Tet boundary test passes |
| CHART-02 | 01-02 | Can Chi for year, month, day, and hour of birth | SATISFIED | LunarDate interface carries yearCanChi, monthCanChi, dayCanChi, hourCanChi; hourCanChi derived via Ngu Tu Hoan Nguyen formula |
| CHART-03 | 01-02 | Places all 14 main stars across 12 palaces | SATISFIED | star-placer.ts places all 14 via two-group algorithm; Test 2 confirms 14 unique stars |
| CHART-04 | 01-01 | Chart output is a typed TuViChart structure | SATISFIED | TuViChart interface in lib/tuvi/types.ts; calculateChart returns TuViChart |
| PROF-01 | 01-02, 01-04 | Extract dominant palace (highest-weight star cluster) | SATISFIED | extractProfile iterates all palaces, sums star weights, identifies dominant index |
| PROF-02 | 01-02, 01-04 | Identify risk star (primary challenging star) | SATISFIED | extractProfile finds highest-weight star from RISK_STARS list |
| PROF-03 | 01-02, 01-04 | Derive relational pattern (interpersonal tendencies) | SATISFIED | RELATIONAL_PATTERNS lookup keyed by Menh palace primary star; returns synthesized prose |
| PROF-04 | 01-02, 01-04 | Derive ambition structure (drive and career orientation) | SATISFIED | AMBITION_STRUCTURES lookup keyed by Quan Loc palace primary star; returns synthesized prose |
| PROF-05 | 01-04 | Profile displayed to user before paths are generated | SATISFIED | app/page.tsx renders PsychProfile component when chart exists and isCalculating is false |

**All 13 phase-1 requirements satisfied.**

No orphaned requirements: REQUIREMENTS.md traceability table maps all 13 Phase 1 IDs to Phase 1. No Phase 1 IDs appear in REQUIREMENTS.md without a plan claiming them.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `lib/tuvi/star-placer.ts` | 87 | `brightness: null` for all Star objects | Info | Intentional stub documented in SUMMARY. brightness is in the Star type but not used by PROF-01 through PROF-05, which use star weights only. Does not block any Phase 1 goal. |
| `app/page.tsx` | 29 | `console.error('Chart calculation failed:', err)` | Info | Error handling logs to console with no user-facing error state. calculateChart is synchronous and unlikely to throw in practice. Appropriate for Phase 1 scope. |
| `lib/tuvi/__tests__/chart.test.ts` | 219 | `// TODO: Once validated against reference, add assertions like:` | Warning | D-13 test contains only structural assertions (12 palaces, 14 stars, yearCanChi). Exact star branch assignments not verified programmatically. This is the human verification item below. |
| `lib/tuvi/lunar-bridge.ts` | 24-25 | `return 7` for all non-VN birthplaces | Info | Documented Phase 1 simplification (D-12). All non-Vietnamese cities default to UTC+7. Acceptable for demo scope. |

### Human Verification Required

#### 1. D-13 Gate — Reference Chart Star Placement Validation

**Test:** Run `npm run dev`, navigate to http://localhost:3000. Submit the form with: Day=15, Month=3, Year=1990, Gender=Male, Birthplace=Ha Noi, Decision="Should I change careers or stay in my current path?". Note which earthly branch each of the 14 main stars appears in on the rendered 4×4 grid.

**Expected:** Star placement matches a trusted Vietnamese Tử Vi reference source for this birthday. Specifically: Tử Vi should appear in the palace at the earthly branch corresponding to lunar day 19 via the TUVI_BRANCH_BY_LUNAR_DAY table (branch index 8 = Thân for day 19). Cross-check the full 14-star placement against https://tuvi.vn or equivalent.

**Why human:** The D-13 test in chart.test.ts validates structural invariants (12 palaces, 14 unique stars, yearCanChi = 'Canh Ngọ') but does not assert specific star-to-branch assignments. The star placement algorithm (TUVI_BRANCH_BY_LUNAR_DAY lookup table + THIEN_PHU_GROUP_OFFSETS) may correctly implement the Vietnamese tradition or may have off-by-one errors in the lookup table that only surface when checked against a reference. This is the hardest algorithmic correctness property to verify without domain expertise. The SUMMARY records "D-13 gate cleared" but no programmatic assertions for branch assignments were added. Human cross-reference with an external chart source is the only way to confirm correctness.

### Gaps Summary

No blocking gaps found. All artifacts exist, are substantive, and are wired. The codebase builds cleanly, TypeScript strict mode passes, and 43 tests pass. The single outstanding item is human verification of algorithmic correctness (D-13), which the plans themselves flagged as a required human step before Phase 2.

The `brightness: null` stub on all Star objects is an intentional deferral documented in SUMMARY and does not affect any Phase 1 requirement — brightness is not used by profile extraction.

The `PsychProfile` component receiving profile as a prop (rather than reading from the store directly) is an architectural decision by the implementation (app/page.tsx owns Zustand reads, passes props down) and not a wiring defect.

---

_Verified: 2026-03-28T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
