---
phase: 04-ui-polish-demo-hardening
plan: 03
subsystem: ui
tags: [demo, birthday, verification, fallback-demo, layout, 1280x800]

# Dependency graph
requires:
  - phase: 04-ui-polish-demo-hardening
    plan: 01
    provides: Vietnamese lacquerware visual layer, per-element ash transitions
  - phase: 04-ui-polish-demo-hardening
    plan: 02
    provides: SVG branch connectors, fallback-demo.json, ?reset URL handler
provides:
  - Confirmed demo birthday 1990-03-21 recorded in public/fallback-demo.json demoBirthday field
  - Human-verified 1280x800 layout correctness (no horizontal overflow)
  - Full visual and functional sign-off on Phase 4 output
  - TypeScript clean (npx tsc --noEmit exits 0)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Demo birthday vetting: run calculateChart against candidates, select by riskStarName + prose substance"

key-files:
  created: []
  modified:
    - public/fallback-demo.json

key-decisions:
  - "Demo birthday 1990-03-21 confirmed: riskStarName non-null, relationalPattern and ambitionStructure prose substantive, strong archetypal contrast across duty/desire/transformation paths"

patterns-established: []

requirements-completed: [DEMO-03, DEMO-04]

# Metrics
duration: ~5min
completed: 2026-03-28
---

# Phase 4 Plan 03: Demo Birthday Vetting and 1280x800 Human Verification Summary

**Demo birthday 1990-03-21 confirmed in public/fallback-demo.json producing named-star profile with substantive prose; 1280x800 layout, altar aesthetic, SVG connectors, ash transitions, fallback hardening, and ?reset all approved by human verifier**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-28T18:31:00Z
- **Completed:** 2026-03-28T18:36:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Confirmed demoBirthday 1990-03-21 in public/fallback-demo.json — produces a compelling Tử Vi profile with a non-null riskStarName, substantive relationalPattern, and strong archetypal contrast across the three path themes (duty / desire / transformation)
- Human verified complete Phase 4 visual layer at 1280x800: no horizontal overflow, paper grain texture visible, gold rule present, SVG bezier branch connectors animating, per-element ash transitions on abandoned paths, ?reset URL clearing all state
- TypeScript remains clean (npx tsc --noEmit exits 0) after all Phase 4 changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Select and record the demo birthday** — `public/fallback-demo.json` demoBirthday field set to `1990-03-21` (completed in plan 02 context)
2. **Task 2: Human verify 1280x800 layout and full visual pass** — APPROVED

**Plan metadata commit:** to be recorded after docs commit

## Files Created/Modified

- `public/fallback-demo.json` — demoBirthday field confirmed as `1990-03-21`; all five pre-written nodes per path already aligned with that chart's psychological profile themes

## Decisions Made

- Demo birthday 1990-03-21 selected: Tử Vi chart for this date yields a riskStarName that is not null and profile prose that is substantive and evocative — confirmed to produce strong archetypal contrast across the duty/desire/transformation branching structure needed for a compelling live demo

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Known Stubs

None — public/fallback-demo.json contains 15 pre-written nodes (5 per path) with real content. demoBirthday is a real date, not a placeholder.

## Next Phase Readiness

Phase 4 is complete. All requirements UI-01 through UI-07 and DEMO-01 through DEMO-04 have been satisfied:

- UI-01: Tailwind color tokens applied throughout
- UI-02: Paper grain SVG texture on body
- UI-03: Inset red-lacquer altar scroll shadow on main
- UI-04: SVG bezier branch connector animation (PathConnectors)
- UI-05: Per-element ash-color transitions on abandoned PathColumn
- UI-06: Gold decorative rule in layout
- UI-07: tabular-nums depth dots
- DEMO-01: 8-second timeout fallback to public/fallback-demo.json
- DEMO-02: ?reset URL handler clears all session state
- DEMO-03: Layout verified at 1280x800 — no overflow
- DEMO-04: Demo birthday 1990-03-21 recorded and verified

The app is demo-ready.

## Self-Check: PASSED

- public/fallback-demo.json: FOUND — demoBirthday: 1990-03-21
- paths keys: duty, desire, transformation — all present
- TypeScript: npx tsc --noEmit exits 0

---
*Phase: 04-ui-polish-demo-hardening*
*Completed: 2026-03-28*
