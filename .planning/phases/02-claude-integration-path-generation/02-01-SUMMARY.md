---
phase: 02-claude-integration-path-generation
plan: 01
subsystem: api
tags: [vercel-ai-sdk, streaming, anthropic, claude, route-handler, grief-context]

# Dependency graph
requires:
  - phase: 01-foundation-t-vi-engine
    provides: TuViChart, PsychProfile, PathNode, GriefEntry, PathId types from lib/tuvi/types.ts
provides:
  - POST /api/generate-node route handler that streams prediction text for all three path archetypes
  - Grief context injection into system prompt when grief entries exist
  - 400 validation for missing required fields; 405 handled by Next.js App Router
affects:
  - 02-02 (path column UI uses this endpoint via useCompletion)
  - 02-03 (abandon + grief wiring reads griefEntries from store; this endpoint already accepts them)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "streamText from ai (v6) with @ai-sdk/anthropic provider — maxOutputTokens not maxTokens"
    - "toTextStreamResponse() for App Router streaming — toDataStreamResponse does not exist in ai v6"
    - "Named export pattern: export async function POST — no default exports in route files"

key-files:
  created:
    - app/api/generate-node/route.ts
  modified: []

key-decisions:
  - "ai SDK v6 uses maxOutputTokens (not maxTokens) and toTextStreamResponse (not toDataStreamResponse) — plan spec was written for an older SDK version"
  - "405 for non-POST handled by Next.js App Router convention — no explicit guard code needed"
  - "Grief modifier injected into system prompt (not user prompt) — keeps the user prompt clean and contextual"

patterns-established:
  - "API route: validate body fields with if-checks (not Zod) for streaming routes"
  - "System prompt built as template string with inline profile fields; grief appended conditionally"

requirements-completed: [PATH-01, PATH-02, PATH-03, PATH-04, PATH-05]

# Metrics
duration: 2min
completed: 2026-03-28
---

# Phase 2 Plan 1: Generate-Node Streaming Route Summary

**Streaming POST /api/generate-node handler using ai v6 streamText + claude-sonnet-4-6, with per-archetype framing and grief context injection**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-28T14:30:30Z
- **Completed:** 2026-03-28T14:31:57Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created `app/api/generate-node/route.ts` — the single endpoint for all node generation in Phase 2
- System prompt encodes PsychProfile fields + life decision + per-archetype framing (Duty / Desire / Transformation)
- Grief context modifier appended when `griefContext.length > 0` — plumbing ready for Phase 3
- Returns 400 for missing `pathId`, `depth`, or `chart`; 405 handled by Next.js App Router for non-POST

## Task Commits

Each task was committed atomically:

1. **Task 1: Create generate-node streaming route handler** - `468c149` (feat)

## Files Created/Modified

- `app/api/generate-node/route.ts` — App Router POST handler: validates body, builds system+user prompts, streams via streamText, injects grief context

## Decisions Made

- ai SDK v6 uses `maxOutputTokens` (not `maxTokens`) and `toTextStreamResponse()` (not `toDataStreamResponse()`) — corrected during implementation
- 405 for non-POST is handled by Next.js App Router when no matching named export exists — no explicit guard code added
- Grief modifier goes into system prompt (not user prompt) to keep archetype/profile context cohesive

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ai SDK v6 API: maxTokens -> maxOutputTokens, toDataStreamResponse -> toTextStreamResponse**
- **Found during:** Task 1 (create generate-node streaming route handler)
- **Issue:** Plan spec used `maxTokens` and `toDataStreamResponse()` which don't exist in ai v6. TypeScript reported two type errors on first tsc run.
- **Fix:** Changed `maxTokens: 200` to `maxOutputTokens: 200` and `result.toDataStreamResponse()` to `result.toTextStreamResponse()`
- **Files modified:** app/api/generate-node/route.ts
- **Verification:** `npx tsc --noEmit` exits 0 after fix
- **Committed in:** 468c149 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — SDK API mismatch)
**Impact on plan:** Required correction for the code to compile. No behavior change; streaming semantics identical.

## Issues Encountered

None beyond the SDK API version mismatch corrected above.

## User Setup Required

`ANTHROPIC_API_KEY` environment variable must be set. The `@ai-sdk/anthropic` provider reads it automatically — no code changes needed.

## Next Phase Readiness

- `/api/generate-node` is ready for 02-02 (PathColumn component + useCompletion wiring)
- Grief plumbing is already in place — Phase 3 just needs to populate `griefEntries` in the store and pass them through
- `toTextStreamResponse()` returns a standard text stream — client-side `useCompletion` hook consumes it correctly

## Self-Check

- `app/api/generate-node/route.ts` exists: YES
- Commit `468c149` exists: YES

## Self-Check: PASSED

---
*Phase: 02-claude-integration-path-generation*
*Completed: 2026-03-28*
