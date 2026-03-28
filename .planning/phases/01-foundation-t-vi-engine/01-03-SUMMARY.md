---
phase: 01-foundation-t-vi-engine
plan: "03"
subsystem: ui
tags: [zod, react, tailwind, form-validation, nextjs]

# Dependency graph
requires:
  - phase: 01-foundation-t-vi-engine
    plan: "01"
    provides: "BirthInput and SolarDate types in lib/tuvi/types.ts; Zustand store with setBirthInput/setIsCalculating in lib/store.ts"
provides:
  - "Zod v4 form validation schema (InputFormSchema) with per-field error messages"
  - "formDataToBirthInput factory converting raw form data to typed BirthInput"
  - "parseTimeString helper for HH:MM clock input parsing"
  - "birthplaceToOffset timezone derivation (UTC+7 default, Phase 1 simplification)"
  - "InputForm React component — controlled form with lacquerware styling and per-field Zod validation"
  - "app/page.tsx updated to mount InputForm with onSubmit handler stub"
affects:
  - 01-04 (chart wiring — Plan 04 will replace the console.log stub in handleFormSubmit with calculateChart)
  - 02-* (all Phase 2 plans consume BirthInput produced by this form)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zod v4 safeParse on form submit — access result.error.issues (NOT .errors)"
    - "Zod v4 error messages use error: param (NOT message: or required_error)"
    - "Controlled React form with useState — no react-hook-form for simple forms"
    - "Per-field error clearing on change via setErrors"

key-files:
  created:
    - lib/tuvi/validation.ts
    - components/InputForm.tsx
  modified:
    - app/page.tsx

key-decisions:
  - "Zod v4 syntax enforced throughout — error: param not message:, .issues not .errors"
  - "Birth hour uses HTML type=time (HH:MM) — no traditional 12-giờ names exposed in UI (D-02)"
  - "Empty birth time field -> hour: null in BirthInput — calculation engine applies Gio Ngo default silently (D-01)"
  - "Removed traditional hour names from comments in InputForm.tsx to fully satisfy D-02 acceptance criteria"

patterns-established:
  - "Form validation pattern: InputFormSchema.safeParse() -> result.error.issues iteration -> per-field error map"
  - "Tailwind lacquerware tokens: verse-red, verse-gold, verse-black, verse-paper, verse-ash"

requirements-completed: [INPUT-01, INPUT-02, INPUT-03, INPUT-04]

# Metrics
duration: 2min
completed: 2026-03-28
---

# Phase 01 Plan 03: Input Form Summary

**Controlled React form with Zod v4 validation producing a typed BirthInput for chart generation, styled with Vietnamese lacquerware tokens**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-28T11:20:05Z
- **Completed:** 2026-03-28T11:22:29Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Zod v4 schema with per-field error messages using correct v4 syntax (error: param, .issues access)
- InputForm component with separate day/month/year fields, optional HH:MM clock input, gender select, birthplace text, decision textarea
- Per-field validation errors displayed inline; errors clear on change
- app/page.tsx updated to mount InputForm and show "Casting your chart..." state
- Build passes cleanly (Next.js build + TypeScript)

## Task Commits

Each task was committed atomically:

1. **Task 1: Zod v4 validation schema and BirthInput factory** - `a3bd042` (feat)
2. **Task 2: InputForm component with per-field validation and lacquerware styling** - `f442816` (feat)

## Files Created/Modified

- `lib/tuvi/validation.ts` - Zod v4 InputFormSchema, formDataToBirthInput, parseTimeString, birthplaceToOffset
- `components/InputForm.tsx` - Controlled React form with lacquerware styling and per-field Zod validation
- `app/page.tsx` - Updated to mount InputForm; shows calculating state; chart-ready placeholder for Plan 04

## Decisions Made

- Used Zod v4 syntax throughout (error: param, result.error.issues) per plan requirement
- Removed traditional Vietnamese hour names (Gio Ngo) from code comments in InputForm.tsx to fully satisfy D-02 acceptance criteria which prohibits any mention in the component file
- birth hour field uses HTML `type="time"` (HH:MM clock input) per D-02 — no traditional 12-block names shown to users
- handleFormSubmit in page.tsx is a stub (console.log) — Plan 04 will wire calculateChart

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed traditional hour name from JSX comment**
- **Found during:** Task 2 (InputForm component)
- **Issue:** Acceptance criteria states component must NOT contain any mention of traditional giờ names. Initial comment `/* D-01: When left empty, chart engine silently defaults to noon (Giờ Ngọ) */` contained the name.
- **Fix:** Changed comment to `/* D-01: When left empty, chart engine silently defaults to the noon hour */`
- **Files modified:** components/InputForm.tsx
- **Verification:** `grep "Giờ" components/InputForm.tsx` returns no matches
- **Committed in:** f442816 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - comment text fix)
**Impact on plan:** Necessary for acceptance criteria compliance. No scope change.

## Issues Encountered

- Pre-existing TypeScript error in `lib/tuvi/__tests__/lunar.test.ts` (cannot find `../lunar-bridge`) — this is from Plan 02 (lunar bridge module), not created by this plan. Next.js build still passes. Out of scope for this plan.

## Known Stubs

- `handleFormSubmit` in `app/page.tsx` (line ~27): logs `BirthInput` to console. Plan 04 will replace this with actual `calculateChart` call. This is an **intentional stub** — the form's goal (producing a valid BirthInput and wiring to store) is fully achieved.

## Next Phase Readiness

- InputForm is complete and wired to Zustand store — Plan 04 can call calculateChart in handleFormSubmit
- BirthInput type contract is fully honored — no drift from lib/tuvi/types.ts
- Zod validation patterns established for future forms in Phase 2+

---
*Phase: 01-foundation-t-vi-engine*
*Completed: 2026-03-28*
