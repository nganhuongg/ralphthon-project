# Phase 3: Grief System + Archive - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Abandoning a path triggers a complete grief ritual — a 3-question interview overlay, ash fade animation, localStorage persistence via the grief archive, and grief context feeding back into Claude's remaining path generation. Creating paths, node generation mechanics, and visual polish are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Interview Question Phrasing
- **D-01:** Questions are static text — no API call. Claude has discretion on exact wording, but must match the "tender, grounded, not mystical" tone established in the system prompt.
- **D-02:** Three question slots (from GRIEF-03): (1) what are you letting go of, (2) what does that cost you, (3) what do you now know. These topic slots are fixed; the surface wording is Claude's discretion.

### Abandonment Overlay Flow
- **D-03:** One question at a time — Q1 appears, user answers and submits, Q2 appears, etc. Matches the `advanceInterview(answer)` store action already built.
- **D-04:** No dismiss/close button. The overlay is non-dismissible. Path stays in pending-abandonment state until all 3 answers are submitted. Abandonment requires completing the ritual.

### Ash Fade Timing
- **D-05:** Column fades to ash **after** the interview completes — specifically after `addGriefEntry()` is called and the grief entry is saved. The visual transformation is the conclusion of the ritual, not the initiation.
- **D-06:** Implementation implication: `abandonPath()` (which sets `isAbandoned: true`) should be called at interview completion, NOT at Abandon button click. The Abandon button should call `setActiveInterview(pathId)` instead. PathColumn's opacity-40 styling will trigger only after interview completes.

### Archive View Placement
- **D-07:** Persistent collapsible sidebar on the right side. Always present alongside the 3-column path view, toggleable open/closed. Good for demo: judges can see archived paths while the active paths remain visible.
- **D-08:** Archive sidebar shows each abandoned path with its `pathSummary` (first node content) and all 3 grief answers.

### Claude's Discretion
- Exact static question wording for each of the 3 questions (must be conversational, grounded, tender)
- Ash fade animation specifics (color, duration, easing — see UI hint in ROADMAP.md and Phase 4 for full polish)
- Archive sidebar open/closed default state
- Answer input: textarea vs single-line input per question

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Grief System Requirements
- `.planning/REQUIREMENTS.md` §Grief System (GRIEF-01 through GRIEF-06) — exact behavioral requirements for interview, localStorage, ash fade, and grief context injection
- `.planning/REQUIREMENTS.md` §Grief Archive (ARCH-01 through ARCH-04) — archive view requirements and localStorage schema versioning

### Existing Type Contract
- `lib/tuvi/types.ts` — `GriefEntry`, `PathState`, `PathNode`, `PathId` — all grief types are fully defined here; do not redefine

### Existing Store Implementation
- `lib/store.ts` — Full Zustand store with `activeInterview` state, `setActiveInterview/advanceInterview/clearInterview/addGriefEntry/clearGriefArchive` actions all pre-implemented. `griefEntries` already persisted via Zustand persist middleware (localStorage key: `verse-grief-archive`, version: 1).

### Existing API Route
- `app/api/generate-node/route.ts` — `griefContext?: GriefEntry[]` already accepted and injected into system prompt. PathTreeView already passes `griefEntries` to each generation body. No changes needed to make grief context flow.

### Existing UI Components
- `components/PathColumn.tsx` — Abandon button currently calls `abandonPath()` directly; Phase 3 must change this to `setActiveInterview(pathId)` instead. The opacity-40 abandoned state is already wired to `isAbandoned`.
- `components/PathTreeView.tsx` — Parent of PathColumn; good candidate for hosting the grief interview overlay and archive sidebar.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useVerseStore` with `activeInterview` state: already has `pathId`, `questionIndex`, `answers[]` — perfectly maps to one-at-a-time interview flow
- `advanceInterview(answer: string)`: increments `questionIndex` + appends answer — call this after each question is submitted
- `clearInterview()`: resets interview state — call after grief entry is created
- `addGriefEntry(entry: GriefEntry)`: persists to localStorage — call at interview completion
- Framer Motion + AnimatePresence already imported in PathColumn — usable for overlay entrance/exit and ash fade

### Established Patterns
- Zustand store selectors: `useVerseStore((s) => s.activeInterview)` pattern established
- `nanoid()` used for node IDs — use same for `GriefEntry.id`
- Framer Motion `motion.div` with `initial/animate/exit` props used in PathColumn nodes
- `useCompletion` from `@ai-sdk/react` — existing pattern for streaming; grief interview does NOT need streaming (static questions, text answers)

### Integration Points
- **Abandon flow change:** PathColumn Abandon button → currently calls `abandonPath()`. Must change to `setActiveInterview(pathId)`. Interview overlay reads `activeInterview.pathId !== null` to know when to show.
- **Interview completion:** On 3rd answer submit: call `abandonPath(pathId, depth, summary)` THEN `addGriefEntry(entry)` THEN `clearInterview()`. This sequence sets `isAbandoned: true` (triggering ash fade) and persists the entry.
- **Archive sidebar:** Reads `griefEntries` from store (already populated by `addGriefEntry`). Displayed alongside PathTreeView columns.

</code_context>

<specifics>
## Specific Ideas

- Archive sidebar layout: persistent collapsible panel on the right side of the 3-column path view (see ASCII mockup from discussion). Judges can see archived paths alongside active paths during demo.
- The grief ritual is non-negotiable: abandonment requires completing the interview. No escape hatch.
- Ash fade is the ritual's conclusion, not its initiation — this ordering is intentional and meaningful.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-grief-system-archive*
*Context gathered: 2026-03-28*
