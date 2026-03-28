---
phase: 04-ui-polish-demo-hardening
plan: 01
subsystem: ui
tags: [tailwind, css, framer-motion, lacquerware, texture, transitions]

# Dependency graph
requires:
  - phase: 03-grief-system-archive
    provides: PathColumn component with isAbandoned state in Zustand store
provides:
  - Paper grain texture overlay on body via feTurbulence SVG data URI
  - Inset red-lacquer box-shadow on main element (altar scroll framing)
  - 1px gold decorative rule at top of content area
  - Per-element ash-color transitions on abandoned PathColumn (header, depth dots, node borders)
  - tabular-nums rendering on depth dots
affects: [04-02, 04-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SVG feTurbulence data URI for CSS background grain texture (no external image files)"
    - "Per-element conditional color class pattern replacing flat opacity wrapper for abandoned state"
    - "transition-colors duration-700 for smooth gold -> ash fade on abandon"

key-files:
  created: []
  modified:
    - app/globals.css
    - app/layout.tsx
    - components/PathColumn.tsx

key-decisions:
  - "Per-element ash transitions replace flat opacity-40 wrapper — enables independent control of each UI element's abandoned visual state"
  - "tabular-nums added to depth dots container — consistent glyph widths as depth counter changes"
  - "Gold rule placed as first child of main (before children) — acts as altar scroll top border at 1px height with mb-8 breathing room"

patterns-established:
  - "Abandoned path visual state: conditional className on isAbandoned, never opacity wrapper"
  - "SVG noise texture: data URI on body background-image, background-size: 200px 200px, opacity 0.05"

requirements-completed: [UI-01, UI-02, UI-03, UI-05, UI-06, UI-07]

# Metrics
duration: 5min
completed: 2026-03-28
---

# Phase 4 Plan 01: Vietnamese Lacquerware Visual Layer Summary

**Paper grain texture on body, inset red-lacquer altar scroll shadow on main, 1px gold rule in layout, and per-element ash-color transitions replacing flat opacity-40 on abandoned PathColumn paths**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-28T18:25:54Z
- **Completed:** 2026-03-28T18:27:48Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added feTurbulence SVG data URI grain overlay to body (5% opacity noise at 200px tile) — paper texture visible against dark background
- Added inset red-lacquer box-shadow on main element (rgba(139,26,26,0.08)) — altar scroll frame glow
- Added 1px gold decorative rule (border-verse-gold/20) at top of content area in layout.tsx
- Replaced flat opacity-40 wrapper on abandoned paths with per-element conditional color transitions: header h2 gold/70 -> ash/50, depth dots gold -> ash/60, committed node borders gold/30 -> ash/20, all over 500-700ms
- Added tabular-nums to depth dots container

## Task Commits

Each task was committed atomically:

1. **Task 1: Paper texture, altar scroll glow, gold rule** - `af8b5f7` (feat)
2. **Task 2: PathColumn ash-state per-element color transitions** - `483ee4f` (feat)

## Files Created/Modified
- `app/globals.css` - Paper texture data URI on body, altar scroll box-shadow on main
- `app/layout.tsx` - Gold decorative rule (border-verse-gold/20) as first child of main
- `components/PathColumn.tsx` - Per-element ash transitions replacing flat opacity-40 wrapper; tabular-nums on depth dots

## Decisions Made
- Per-element ash transitions replace the flat opacity-40 wrapper — each UI element (header, dots, borders) independently fades to ash/50, ash/60, ash/20 respectively, matching the UI-SPEC abandoned state specification
- tabular-nums on depth dots container ensures consistent glyph widths as depth counter increments/decrements
- Gold rule placed as first-child `<div className="border-b border-verse-gold/20 mb-8" />` inside main — acts as altar scroll top border without altering the main element's existing Tailwind classes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None — all three files contain real implementation, no placeholder content.

## Next Phase Readiness
- Visual lacquerware layer is complete for globals.css and layout.tsx
- PathColumn ash transitions are live — abandoned paths now visually degrade gracefully
- Phase 4 Plan 02 (node tree polish) and Plan 03 (demo hardening) can proceed

## Self-Check: PASSED

- app/globals.css: FOUND
- app/layout.tsx: FOUND
- components/PathColumn.tsx: FOUND
- 04-01-SUMMARY.md: FOUND
- Commit af8b5f7: FOUND
- Commit 483ee4f: FOUND

---
*Phase: 04-ui-polish-demo-hardening*
*Completed: 2026-03-28*
