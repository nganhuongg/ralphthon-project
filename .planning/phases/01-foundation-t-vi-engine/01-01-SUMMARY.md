---
phase: 01-foundation-t-vi-engine
plan: "01"
subsystem: infra
tags: [nextjs, typescript, tailwind, zustand, jest, motion, vercel-ai-sdk]

# Dependency graph
requires: []
provides:
  - Next.js 14 App Router project with TypeScript strict mode
  - Zustand v5 store with full four-phase shape
  - Complete TuViChart type hierarchy (lib/tuvi/types.ts)
  - Tử Vi constants: 14 stars, 12 palaces, stems, branches, grid positions
  - Tailwind lacquerware color tokens (verse-red, verse-gold, verse-black, verse-paper)
  - Be Vietnam Pro font loaded with Vietnamese subset
  - Jest configured with ts-jest for Plan 02 TDD tasks
affects: [01-02, 01-03, 01-04, 02, 03, 04]

# Tech tracking
tech-stack:
  added:
    - next@14.2.35
    - react@18
    - typescript@5
    - tailwindcss@3.4.17
    - zustand@5.0.12
    - motion@12.38.0
    - ai@6.0.141
    - "@ai-sdk/anthropic"
    - "@ai-sdk/react"
    - "@dqcai/vn-lunar@1.0.1"
    - date-fns@4.1.0
    - nanoid@5.1.7
    - zod@4.3.6
    - jest@30 + ts-jest@29
  patterns:
    - "All shared types live in lib/tuvi/types.ts — no circular imports allowed"
    - "lib/tuvi/constants.ts is data-only — no logic, all arrays readonly"
    - "Zustand persist scoped to griefEntries only via partialize"
    - "Tailwind lacquerware tokens prefixed verse-* for all palette colors"

key-files:
  created:
    - lib/tuvi/types.ts
    - lib/tuvi/constants.ts
    - lib/store.ts
    - jest.config.ts
    - tailwind.config.ts
    - app/layout.tsx
    - app/globals.css
    - app/page.tsx
    - package.json
    - tsconfig.json
  modified:
    - .gitignore

key-decisions:
  - "Scaffolded in /tmp then copied to project root due to non-empty directory constraint"
  - "noUncheckedIndexedAccess added to tsconfig.json beyond the plan's strict:true requirement"
  - "PathNode imported directly in store.ts rather than via inline import type"

patterns-established:
  - "Pattern 1: lib/tuvi/types.ts is the single source of truth for all types — downstream modules import only from here"
  - "Pattern 2: Constants are readonly as const arrays — prevents mutation, enables type narrowing"
  - "Pattern 3: Zustand store uses idlePathState factory to initialize all three path IDs consistently"

requirements-completed:
  - CHART-04

# Metrics
duration: 5min
completed: 2026-03-28
---

# Phase 01 Plan 01: Project Bootstrap Summary

**Next.js 14 App Router with TypeScript strict mode, Zustand v5 store skeleton, TuViChart type hierarchy (14 stars, 12 palaces), and Jest/ts-jest configured for Plan 02 TDD**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-28T11:12:26Z
- **Completed:** 2026-03-28T11:17:30Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- Next.js 14.2.35 App Router project builds successfully with all 12+ dependencies at exact versions
- Complete TypeScript type contract established in lib/tuvi/types.ts — every downstream plan imports from here
- Zustand v5 store with four-phase shape; only griefEntries persisted to localStorage via partialize
- Tailwind lacquerware tokens (verse-red, verse-gold, verse-black, verse-paper) and Be Vietnam Pro Vietnamese font loaded
- Jest configured with ts-jest preset — Plan 02's TDD tasks can run immediately

## Task Commits

Each task was committed atomically:

1. **Task 1: Bootstrap Next.js 14 App Router** - `7102563` (chore)
2. **Task 2: Define TuViChart type contract and constants** - `86e2974` (feat)
3. **Task 3: Create Zustand v5 store** - `bc4da31` (feat)

## Files Created/Modified

- `lib/tuvi/types.ts` - All shared TypeScript types: TuViChart, BirthInput, SolarDate, LunarDate, Palace, Star, PsychProfile, PathState, GriefEntry, PathId, PathNode, StarName, PalaceName
- `lib/tuvi/constants.ts` - CHINH_TINH_14 (14 stars), PALACE_NAMES, PALACE_GLOSSES, HEAVENLY_STEMS, EARTHLY_BRANCHES, STAR_WEIGHTS, RISK_STARS, PALACE_GRID_POSITIONS
- `lib/store.ts` - Zustand v5 store with useVerseStore, partialize scoped to griefEntries
- `jest.config.ts` - ts-jest preset, node environment, @/* module alias
- `tailwind.config.ts` - Lacquerware palette: verse-red, verse-gold, verse-black, verse-paper (11 tokens)
- `app/layout.tsx` - Be Vietnam Pro via next/font, Vietnamese subset, altar scroll container
- `app/globals.css` - Tailwind v3 directives, verse-black background
- `app/page.tsx` - Minimal placeholder with verse-gold heading
- `package.json` - All dependencies + test/test:watch scripts
- `tsconfig.json` - strict + noUncheckedIndexedAccess
- `.gitignore` - Standard Next.js ignores including .next/, node_modules

## Decisions Made

- Scaffolded Next.js in /tmp then copied files to project root (non-empty directory prevented in-place scaffold)
- Added `noUncheckedIndexedAccess: true` to tsconfig alongside `strict: true` for stronger guarantees
- PathNode type imported directly at top of store.ts for clarity (no inline import)

## Deviations from Plan

None - plan executed exactly as written. One minor note: scaffold was done in /tmp due to existing files in project root, but outcome is identical to scaffolding in-place.

## Issues Encountered

- create-next-app@14 refuses to scaffold into a non-empty directory. Resolved by scaffolding into /tmp/verse-scaffold then copying files across and running `npm install` clean to avoid the corrupted symlinked node_modules/.bin from a cross-device copy.

## User Setup Required

None - no external service configuration required for this plan.

## Next Phase Readiness

- Plan 02 (lunar calendar conversion + star placement TDD) can start immediately
- Jest is live; `npx jest --passWithNoTests` exits 0
- All types in lib/tuvi/types.ts are ready to import
- @dqcai/vn-lunar@1.0.1 is installed and ready for the calculation engine

---
*Phase: 01-foundation-t-vi-engine*
*Completed: 2026-03-28*
