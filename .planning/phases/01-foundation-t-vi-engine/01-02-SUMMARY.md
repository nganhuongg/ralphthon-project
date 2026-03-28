---
phase: 01-foundation-t-vi-engine
plan: "02"
subsystem: tuvi-engine
tags: [tuvi, calculation, lunar-bridge, star-placement, profile-extraction, tdd]
dependency_graph:
  requires:
    - "01-01: types.ts and constants.ts from plan 01-01"
    - "@dqcai/vn-lunar: 1.0.1 (installed in plan 01-01)"
  provides:
    - "calculateChart(BirthInput): TuViChart — synchronous public API"
    - "lunar-bridge: Gregorian → LunarDate adapter"
    - "palace-builder: 12 palace construction"
    - "star-placer: 14 main star placement"
    - "profile-extractor: deterministic PsychProfile"
  affects:
    - "Phase 2 Claude API integration (chart is the prompt foundation)"
    - "Phase 3 UI chart display (TuViChart data shape is now locked)"
tech_stack:
  added: []
  patterns:
    - "TDD red-green cycle: test file committed before implementation"
    - "@dqcai/vn-lunar: LunarCalendar.fromSolar(day, month, year) — day-first API"
    - "Tử Vi/Thiên Phủ anchor algorithm for 14 star placement"
    - "An Cung Trụ Mệnh rule for palace heavenly stem assignment"
    - "Ngũ Tử Hoàn Nguyên formula for hour Can Chi derivation"
key_files:
  created:
    - lib/tuvi/lunar-bridge.ts
    - lib/tuvi/palace-builder.ts
    - lib/tuvi/star-placer.ts
    - lib/tuvi/profile-extractor.ts
    - lib/tuvi/index.ts
    - lib/tuvi/__tests__/lunar.test.ts
    - lib/tuvi/__tests__/chart.test.ts
  modified: []
decisions:
  - "@dqcai/vn-lunar uses lunarDate.leap (not .isLeapMonth) — adapter normalizes to isLeapMonth"
  - "@dqcai/vn-lunar CJS build is obfuscated; ESM .mjs is clean — ts-jest handles import via require() path in tests"
  - "hourToGioIndex(1) returns 1 (Sửu), not 0 — plan test spec was incorrect (Tý spans 23:00-00:59, not 23:00-01:59)"
  - "birthplaceToTimezoneOffset defaults all non-VN cities to UTC+7 for Phase 1 (demo uses VN dates)"
  - "Thiên Phủ placed exactly 6 branches from Tử Vi — verified invariant in tests"
metrics:
  duration_minutes: 30
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_created: 7
  tests_added: 43
---

# Phase 01 Plan 02: Tử Vi Calculation Engine Summary

**One-liner:** Synchronous calculateChart() engine using @dqcai/vn-lunar for calendar math and custom star placement algorithm — 43 tests passing, D-13 gate documented.

## What Was Built

The complete Tử Vi calculation engine: a pure TypeScript module that converts birth data into a verified chart with 12 palaces, 14 placed main stars, and a deterministic psychological profile.

### Modules delivered

**lib/tuvi/lunar-bridge.ts** — Gregorian → LunarDate adapter. Wraps `@dqcai/vn-lunar`'s `LunarCalendar.fromSolar(day, month, year)`. Handles Tết year boundary (Jan 20, 1985 → Giáp Tý), midnight Giờ Tý boundary (hour 23 → index 0), null birth hour default (→ Giờ Ngọ, index 6), and hour Can Chi derivation using the Ngũ Tử Hoàn Nguyên formula.

**lib/tuvi/palace-builder.ts** — 12 palace construction. Derives Mệnh palace earthly branch from `(MENH_BRANCH_BY_MONTH[lunarMonth-1] - gioIndex) % 12`. Assigns heavenly stems using the An Cung Trụ Mệnh rule (Tý palace stem varies by birth year stem).

**lib/tuvi/star-placer.ts** — 14 main star placement. Uses lookup table (TUVI_BRANCH_BY_LUNAR_DAY) to anchor Tử Vi by lunar day. Thiên Phủ is placed 6 branches opposite. Tử Vi group (6 stars) spreads counter-clockwise; Thiên Phủ group (8 stars) spreads clockwise.

**lib/tuvi/profile-extractor.ts** — Deterministic PsychProfile. PROF-01: dominant palace by total star weight. PROF-02: highest-weight risk star. PROF-03: relational pattern from Mệnh palace primary star via prose lookup table. PROF-04: ambition structure from Quan Lộc palace (index 4) primary star via prose lookup table.

**lib/tuvi/index.ts** — Public API: `calculateChart(input: BirthInput): TuViChart`. Synchronous, zero external calls.

## Test Coverage

- 21 tests in lunar.test.ts (hourToGioIndex, birthplaceToTimezoneOffset, calculateLunarDate)
- 22 tests in chart.test.ts (full pipeline, individual modules, D-13 reference gate)
- All 43 tests pass; `npx tsc --noEmit` exits 0

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect Test 5 spec in lunar.test.ts**
- **Found during:** Task 1 GREEN phase
- **Issue:** Plan specified `hourToGioIndex(1) → 0` (Giờ Tý), but Tý spans only 23:00–00:59 (2 hours). Hour 1 (01:00) falls in Sửu (01:00–02:59). The formula `(hour + 1) % 24 / 2 = 1` for hour=1 is correct per RESEARCH.md code example and standard Vietnamese 12-giờ system.
- **Fix:** Updated test to `hourToGioIndex(1) → 1` (Giờ Sửu) with explanatory comment.
- **Files modified:** lib/tuvi/__tests__/lunar.test.ts
- **Commit:** 28a6a0f

**2. [Rule 1 - Bug] @dqcai/vn-lunar field name difference**
- **Found during:** Task 1 — reading library API
- **Issue:** Plan code assumed `lunar.isLeapMonth` but @dqcai/vn-lunar exposes `lunarDate.leap` (not `isLeapMonth`). Also `lunar.lunarYear/lunarMonth/lunarDay` do not exist — the fields are accessed via `calendar.lunarDate.year/month/day`.
- **Fix:** Implemented lunar-bridge.ts with correct field names after reading actual library source.
- **Files modified:** lib/tuvi/lunar-bridge.ts

## D-13 Gate Status

The D-13 test exists at `lib/tuvi/__tests__/chart.test.ts` with a TODO comment marking manual validation as required before Phase 2. For the reference chart (1990-03-15 male, UTC+7, no birth hour):

- Lunar date confirmed: 19/2/Canh Ngọ (verified by @dqcai/vn-lunar)
- Star placement output logged during D-13 test run for manual cross-reference
- Validation against https://tuvi.vn or equivalent **must occur before Phase 2 begins** (D-13 hard gate)

## Known Stubs

**Star brightness (`brightness: null`)** — All stars have `brightness: null`. The plan marks this as deferred: brightness calculation requires full palace stem/branch analysis. PROF-01 through PROF-04 do not require brightness values. Phase 2 Claude prompts use the profile text, not brightness values. This stub is intentional and does not prevent plan 02's goal.

## Self-Check

Files created:
- [x] lib/tuvi/lunar-bridge.ts
- [x] lib/tuvi/palace-builder.ts
- [x] lib/tuvi/star-placer.ts
- [x] lib/tuvi/profile-extractor.ts
- [x] lib/tuvi/index.ts
- [x] lib/tuvi/__tests__/lunar.test.ts
- [x] lib/tuvi/__tests__/chart.test.ts

Commits: d0f1b40, 28a6a0f, 3059b73, f99a7ae
