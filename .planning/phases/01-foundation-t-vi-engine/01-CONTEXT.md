# Phase 1: Foundation + Tử Vi Engine - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffold, TypeScript types, Zustand store shape, Tailwind theme foundation, input form, full Tử Vi calculation engine (lunar calendar conversion, 14 main stars across 12 palaces with Can Chi), and psychological profile extraction and display. Everything downstream depends on the chart being algorithmically correct and the data types being stable.

</domain>

<decisions>
## Implementation Decisions

### Birth Hour Input
- **D-01:** Birth hour is optional — if not provided, silently default to Giờ Ngọ (noon, 11am–1pm block). No caveat shown to the user.
- **D-02:** Birth hour input is a clock time field (HH:MM) if shown. We convert to the correct giờ block internally. No need to expose the traditional 12-giờ names in the input form.

### Chart Display
- **D-03:** 12-palace chart renders as a modern 4×4 grid — same structural layout as traditional Vietnamese Tử Vi charts (outer ring of 12 palaces, hollow center or center used for chart metadata), styled with lacquerware aesthetic tokens.
- **D-04:** Each palace cell displays: star names + palace label + a short English gloss (e.g. "Quan Lộc — career"). This makes the chart legible to curious outsiders while remaining authentic.
- **D-05:** The dominant palace (from the psychological profile) should be visually distinguished in the chart — highlighted palace cell.

### Theme Foundation (in scope for Phase 1)
- **D-06:** Phase 1 sets up the full Tailwind token foundation: lacquerware color palette (deep red, gold, black), paper texture (CSS background or image), and typography (Vietnamese diacritic-capable font).
- **D-07:** Phase 1 also builds a basic page shell — background color/texture applied, altar scroll layout container, so every subsequent phase drops components into the correct visual context. Full animations and polish are deferred to Phase 4.

### Project Scaffold
- **D-08:** Next.js 14 App Router (not Pages Router) — required for Claude API streaming in Phase 2.
- **D-09:** TypeScript strict mode. All chart types defined as a shared `TuViChart` interface before any UI is built.
- **D-10:** Zustand store established in Phase 1 with the full shape (chart data, psychological profile, path states, grief archive) — even though only chart/profile slices are populated in this phase.

### Tử Vi Calculation
- **D-11:** Algorithmically exact calculation. Investigate whether `lunar-javascript` or `amlich` (npm) can handle Vietnamese lunar calendar conversion before writing from scratch. If no suitable library, implement Hồ Ngọc Đức algorithm (~200 lines for Gregorian→lunar, ~400 more for star placement).
- **D-12:** Birthplace is used only for timezone derivation → accurate birth hour. No regional narrative flavor in V1.
- **D-13:** Chart calculation must be validated against at least one known-correct reference chart before Phase 2 begins. This is a hard gate.

### Claude's Discretion
- Exact color hex values within the lacquerware palette (deep red ~#8B0000, gold ~#C9A84C, black ~#1A0A00 — exact values are Claude's call)
- Loading/transition state between form submit and chart display
- Empty state for palace cells with no stars
- Exact Zustand store slice boundaries

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Project vision, core value, constraints
- `.planning/REQUIREMENTS.md` — Full v1 requirements with REQ-IDs (INPUT-01–04, CHART-01–04, PROF-01–05 are Phase 1 scope)

### Research Findings
- `.planning/research/STACK.md` — Stack recommendations, Tử Vi algorithm approach, lunar calendar library candidates
- `.planning/research/ARCHITECTURE.md` — Component map, Zustand store shape, TuViChart type contract, build order
- `.planning/research/PITFALLS.md` — Tử Vi calculation edge cases (year boundary, leap month, midnight hour), Framer Motion performance notes
- `.planning/research/SUMMARY.md` — Synthesized key findings and open questions

### No external specs
No ADRs or design docs exist yet — all requirements are captured in REQUIREMENTS.md and decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. No existing components, hooks, or utilities.

### Established Patterns
- None yet — Phase 1 establishes all patterns.

### Integration Points
- Phase 1 output (`TuViChart` type + Zustand store shape) is the integration surface for Phase 2 (Claude API uses chart data as system prompt context).

</code_context>

<specifics>
## Specific Ideas

- Chart should be recognizable to someone who has seen a real Tử Vi chart — the 4×4 grid structure with outer palaces and center is the canonical visual.
- "Tender, not mystical" — the chart display should feel like a tool, not a tarot deck. Clean, readable, grounded.
- The `TuViChart` TypeScript type is the most important artifact of Phase 1 — it's the contract between the calculation engine, Claude's system prompt, and the UI.
- The product is called **Verse** (not "Mệnh" — earlier working name).

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation-t-vi-engine*
*Context gathered: 2026-03-28*
