# Phase 2: Claude Integration + Path Generation - Context

**Gathered:** 2026-03-28 (auto mode)
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire Vercel AI SDK streaming to the existing TuViChart types and Zustand store. Generate three divergent life path trees (Duty / Desire / Transformation) from the psychological profile and life decision. Each path starts with a streamed root node. Users can click to generate subsequent nodes (max 5 deep). Grief context from previously abandoned paths is plumbed through to remaining path generation. This phase does NOT include the grief interview overlay or ash animation (Phase 3), or full visual polish (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### API Route
- **D-01:** Single `/api/generate-node` route handler handles all node generation — root nodes and subsequent depth nodes. Request shape: `{ pathId: PathId, depth: number, chart: TuViChart, previousNodes: PathNode[], griefContext?: GriefEntry[] }`.
- **D-02:** Route handler uses Vercel AI SDK `streamText` with `@ai-sdk/anthropic` provider and `claude-sonnet-4-6` model. Returns a streaming `Response` using `result.toDataStreamResponse()`.

### Streaming Hook Pattern
- **D-03:** Client uses `useCompletion` from `@ai-sdk/react` for each path column — each path column has its own `useCompletion` instance (three instances total on the page). `useCompletion` exposes `completion` (streamed text), `isLoading`, and `complete(prompt)`.
- **D-04:** Root node generation is triggered in parallel — all three `complete()` calls fire simultaneously when the chart + profile are available. The user sees all three paths streaming at once.

### Prompt Schema
- **D-05:** System prompt contains: TuViChart profile (dominantTheme, relationalPattern, ambitionStructure, riskStarName, dominantPalaceName), the life decision text, the archetypal tension for this path (Duty / Desire / Transformation), and generation instructions (tone, length, format). Static per path.
- **D-06:** User prompt contains: current depth (1–5), concatenation of all previous node text on this path (so each node builds on prior nodes), and a grief context modifier block if `griefContext` is non-empty. Dynamic per click.
- **D-07:** Each generated node is 2–4 sentences. Tone matches PROJECT.md: "tender, not mystical." First-person future tense ("You will...") grounded in the profile's psychological language.

### Grief Context Plumbing (PATH-05)
- **D-08:** The `generate-node` route accepts optional `griefContext: GriefEntry[]`. If non-empty, a grief modifier is injected into the system prompt: the first `lettingGo` and `nowKnow` answers from each abandoned path are included as: "The user has let go of [path name] — they are releasing [lettingGo] and they now know [nowKnow]. Let this subtly inflect the remaining prediction."
- **D-09:** In Phase 2, the client passes `griefEntries` from the Zustand store when calling `generate-node`. In Phase 3, the store is actually populated after interviews — but the plumbing already works because Phase 2 passes whatever is in `state.griefEntries` (empty until Phase 3 is complete).

### Node Tree Interaction
- **D-10:** Path depth indicator renders as a simple dot or step sequence below each path column (e.g., ● ● ○ ○ ○ for depth 2 of 5).
- **D-11:** "Expand" button is visible and active at depths 1–4. At depth 5 (max), the button is hidden (not just disabled). A small text note "Path complete" appears instead.
- **D-12:** `abandonPath` action is wired to an "Abandon" button on each path card. Clicking abandon calls `useVerseStore.abandonPath(pathId, depth, firstNodeContent)` — grief interview overlay is Phase 3's concern.

### Path Card Layout
- **D-13:** Three path columns render side-by-side in a CSS grid (3 columns) below the psychological profile card. Labels: "Duty", "Desire", "Transformation" as column headers.
- **D-14:** Each path column scrolls independently if nodes overflow. New nodes animate in with `motion` (slide-down entrance). `AnimatePresence` wraps the nodes list.

### Claude's Discretion
- Exact system prompt wording (tone, format instructions, archetypal framing text)
- Whether to add a brief "archetype summary" above each path column before the first node streams
- Error handling UI (inline error vs. retry button) if streaming fails
- Exact dot/step visual for the depth indicator

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Project vision, core value, constraints (model: `claude-sonnet-4-6`, no backend)
- `.planning/REQUIREMENTS.md` — PATH-01–05 and NODE-01–05 are Phase 2 scope

### Phase 1 Artifacts
- `.planning/phases/01-foundation-t-vi-engine/01-CONTEXT.md` — Prior decisions (D-08 through D-13), established store shape (D-10), TuViChart type contract
- `lib/tuvi/types.ts` — TuViChart, PsychProfile, PathState, PathNode, PathId, GriefEntry types
- `lib/store.ts` — Zustand store: `paths`, `setPathNode`, `abandonPath`, `griefEntries` actions

### Research
- `.planning/research/STACK.md` — Vercel AI SDK approach, `useCompletion` vs `useChat` analysis, streaming in App Router

### No ADRs yet
No ADRs or design docs beyond REQUIREMENTS.md and decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/store.ts` — `useVerseStore` with `paths` (PathState × 3), `setPathNode`, `abandonPath`, `griefEntries` fully defined. Phase 2 just populates these.
- `lib/tuvi/types.ts` — `TuViChart`, `PsychProfile`, `PathNode`, `PathId`, `GriefEntry` types. API route imports directly.
- `components/PsychProfile.tsx` — Profile display; Phase 2 renders path cards below it.
- `app/page.tsx` — Already has the `{/* Phase 2 will render path cards below this */}` insertion point in the chart-visible block.
- `nanoid` — Already installed, used for `PathNode.id`.
- `motion` (Framer Motion v12) — Already installed for node entrance animations.

### Established Patterns
- Client components are `'use client'` with explicit directive.
- Zustand store accessed via selectors: `useVerseStore((s) => s.chart)`.
- No React context used — all global state via Zustand.
- TypeScript strict + `noUncheckedIndexedAccess` — array access needs bounds checks.
- Vercel AI SDK already installed: `ai` v6, `@ai-sdk/anthropic` v3, `@ai-sdk/react` v3.

### Integration Points
- `app/page.tsx`: Path cards rendered inside the `{chart && !isCalculating}` block, after `<PsychProfile>`.
- `app/api/generate-node/route.ts`: New App Router route handler (POST). Reads `TuViChart` from request body, streams with `streamText`.
- Zustand `paths` slice: Phase 2 writes `PathNode` entries to `state.paths[pathId].nodes` via `setPathNode`.
- `griefEntries` from store passed as optional context to `generate-node` — empty in Phase 2, populated in Phase 3.

</code_context>

<specifics>
## Specific Ideas

- Parallel streaming of all 3 root nodes is the "wow moment" for the demo — the experience of seeing three futures unfurl simultaneously is the core UX hook.
- Each path has an archetypal header ("Duty", "Desire", "Transformation") — not ornate, just the single word as a column title.
- Grief context injection (D-08) should feel like a subtle narrative shift, not a visible label change. The prompt modifier is internal only.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-claude-integration-path-generation*
*Context gathered: 2026-03-28*
