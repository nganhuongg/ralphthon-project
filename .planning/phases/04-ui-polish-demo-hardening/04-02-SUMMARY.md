---
phase: 04-ui-polish-demo-hardening
plan: 02
subsystem: path-tree-view
tags: [svg-animation, framer-motion, fallback, demo-hardening, url-params, next-js]
dependency_graph:
  requires: [04-01]
  provides: [PathConnectors-svg, fallback-demo-json, reset-url-handler]
  affects: [components/PathTreeView.tsx, app/page.tsx, public/fallback-demo.json]
tech_stack:
  added: []
  patterns: [motion.path-pathLength-animation, Promise.race-timeout, useSearchParams-Suspense-boundary]
key_files:
  created:
    - public/fallback-demo.json
  modified:
    - components/PathTreeView.tsx
    - app/page.tsx
decisions:
  - PathConnectors placed inside flex-1 min-w-0 wrapper above the column grid to align SVG coordinate system with three columns
  - fallbackIndex ref tracks per-path index so sequential expand calls on the same path load successive fallback nodes
  - loadFallbackNode defined as async function declaration (hoisted) after refs, called from handleExpand catch block
  - ResetHandler is a separate named component — not inline in Home — required by Next.js 14 Suspense/useSearchParams rule
metrics:
  duration_minutes: 6
  completed_date: "2026-03-28T18:31:03Z"
  tasks_completed: 2
  files_modified: 3
---

# Phase 04 Plan 02: SVG Branch Connectors, Fallback Hardening, Reset Handler Summary

**One-liner:** Incense smoke SVG branch animation via motion.path pathLength, 8s timeout fallback to static JSON, and ?reset URL param handler for clean demo resets.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | PathConnectors SVG + fallback hardening in PathTreeView | 8a30013 | components/PathTreeView.tsx, public/fallback-demo.json |
| 2 | ?reset URL handler with Suspense boundary in page.tsx | 954647e | app/page.tsx |

## What Was Built

### PathConnectors SVG (UI-04)

A `PathConnectors` subcomponent was added above the `PathTreeView` default export. It renders three cubic bezier SVG curves from a center point (480, 0) down to each column header position — left (Duty), center (Desire), right (Transformation). Each curve uses `motion.path` with `pathLength` animated from 0 to 1 with a 1.4s ease and 0.15s per-curve stagger. The SVG uses `preserveAspectRatio="none"` to stretch to container width. Visibility is controlled by `isVisible={!!chart}` — curves only animate in when a chart exists.

The render structure changed from a flat `flex-1 grid grid-cols-3 gap-6 min-w-0` to a `flex-1 min-w-0` wrapper containing the SVG connector above a `grid grid-cols-3 gap-6` div — keeping the SVG coordinate system aligned with the three columns.

### Fallback Hardening (DEMO-01)

`handleExpand` now wraps the completion call in `Promise.race` against an 8-second timeout. On any error (network failure, API error, or timeout), a `loadFallbackNode(pathId)` call fires instead, fetching `public/fallback-demo.json` and injecting the next pre-written node for that path. A `fallbackIndex` ref tracks the per-path position to serve successive nodes on repeated expand calls.

`public/fallback-demo.json` contains 5 pre-written nodes per path (15 total) for demo birthday 1990-03-21, with content emphasizing duty/conflict/transformation themes appropriate for that chart's psychological profile.

### Reset URL Handler (DEMO-02)

A `ResetHandler` function component was added above `Home` in `app/page.tsx`. It uses `useSearchParams()` from `next/navigation` to detect the `?reset` query parameter, then calls `resetChart()` and `clearGriefArchive()` from the Zustand store, and redirects to `/` via `router.replace('/')`. The component is rendered inside `<Suspense fallback={null}>` as the first child of the Home return — required by Next.js 14 App Router, which throws a build error if `useSearchParams` is called outside a Suspense boundary.

## Deviations from Plan

None — plan executed exactly as written. Function ordering (loadFallbackNode defined after handleExpand) works correctly because both are `async function` declarations and are hoisted within the component function body.

## Self-Check: PASSED

Files created/modified:
- FOUND: components/PathTreeView.tsx (PathConnectors, pathLength, fallback-demo.json, Promise.race, 8000)
- FOUND: public/fallback-demo.json (version: 1, duty/desire/transformation keys, 5 nodes each)
- FOUND: app/page.tsx (ResetHandler, useSearchParams, Suspense, clearGriefArchive, router.replace('/'), searchParams.has('reset'))

Commits:
- FOUND: 8a30013 (feat(04-02): PathConnectors SVG + fallback hardening)
- FOUND: 954647e (feat(04-02): add ResetHandler with Suspense boundary)

TypeScript: npx tsc --noEmit exits 0
