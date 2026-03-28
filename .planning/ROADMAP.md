# Roadmap: Verse

## Overview

Verse is built in four phases that mirror its technical dependency chain. The Tử Vi calculation engine must be correct before Claude can use it; Claude streaming must be stable before grief context can flow through it; the grief system must be complete before visual polish can properly animate its states. The final phase hardens everything for a live hackathon demo where a single visible failure is catastrophic.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation + Tử Vi Engine** - Project scaffolding, TypeScript types, Zustand store shape, and the full Tử Vi calculation engine producing a verified chart output (completed 2026-03-28)
- [ ] **Phase 2: Claude Integration + Path Generation** - Vercel AI SDK streaming wired to chart types, three archetypal path trees generated and interactable node-by-node
- [ ] **Phase 3: Grief System + Archive** - Grief interview overlay, abandoned path persistence, grief context feeding back into remaining path generation, archive view
- [ ] **Phase 4: UI Polish + Demo Hardening** - Full lacquerware aesthetic, incense smoke animations, ash fade, pre-generated fallback, reset URL, 1280×800 verification

## Phase Details

### Phase 1: Foundation + Tử Vi Engine
**Goal**: A verified Tử Vi chart engine exists that accepts birthday + birthplace and produces a correct, typed chart with psychological profile — the foundational data contract all other phases depend on
**Depends on**: Nothing (first phase)
**Requirements**: INPUT-01, INPUT-02, INPUT-03, INPUT-04, CHART-01, CHART-02, CHART-03, CHART-04, PROF-01, PROF-02, PROF-03, PROF-04, PROF-05
**Success Criteria** (what must be TRUE):
  1. User can fill in a date of birth, birthplace, and life decision and submit the form with validation errors shown for missing or invalid inputs
  2. Submitting the form produces a rendered chart display showing 14 main stars placed across 12 palaces with heavenly stem and earthly branch annotations
  3. The chart output matches a known reference chart for at least one test birthday (verifiable by the developer against a trusted Tử Vi source)
  4. A psychological profile card appears below the chart showing dominant palace, risk star, relational pattern, and ambition structure in synthesized prose (not raw star names)
**Plans**: 4 plans
Plans:
- [x] 01-01-PLAN.md — Next.js 14 scaffold, TypeScript types contract, Zustand store (Wave 1)
- [x] 01-02-PLAN.md — Tử Vi calculation engine: lunar bridge, palace builder, star placer (Wave 2)
- [x] 01-03-PLAN.md — Input form with Zod v4 validation (Wave 2, parallel to 01-02)
- [x] 01-04-PLAN.md — Chart display (4×4 grid) and psychological profile card (Wave 3)
**UI hint**: yes

### Phase 2: Claude Integration + Path Generation
**Goal**: Three divergent life path trees are generated from the psychological profile and streamed to the user, with nodes expandable on demand and grief context plumbed through from previous abandonments
**Depends on**: Phase 1
**Requirements**: PATH-01, PATH-02, PATH-03, PATH-04, PATH-05, NODE-01, NODE-02, NODE-03, NODE-04, NODE-05
**Success Criteria** (what must be TRUE):
  1. After chart generation, three path cards appear labeled Duty, Desire, and Transformation — each with a root prediction node that streamed visibly from Claude
  2. Clicking a node on any path triggers a new Claude generation that streams the next prediction onto that path
  3. A path cannot be expanded beyond 5 nodes deep — the expand control disappears or is disabled at depth 5
  4. User can see a visual indicator showing which depth they are at on any path
  5. User can trigger abandonment on any path at any node depth
**Plans**: 3 plans
Plans:
- [ ] 02-01-PLAN.md — generate-node streaming API route with grief context injection (Wave 1)
- [ ] 02-02-PLAN.md — PathColumn and PathTreeView UI components (Wave 2)
- [ ] 02-03-PLAN.md — Page wiring, parallel root generation, .env.local scaffold (Wave 3)
**UI hint**: yes

### Phase 3: Grief System + Archive
**Goal**: Abandoning a path triggers a complete grief ritual — 3-question interview, ash fade, localStorage persistence — and the answers reshape what Claude generates for remaining active paths
**Depends on**: Phase 2
**Requirements**: GRIEF-01, GRIEF-02, GRIEF-03, GRIEF-04, GRIEF-05, GRIEF-06, ARCH-01, ARCH-02, ARCH-03, ARCH-04
**Success Criteria** (what must be TRUE):
  1. Abandoning a path opens a grief interview overlay that asks exactly 3 conversational questions (what are you letting go of, what does that cost you, what do you now know) and accepts user text answers
  2. After completing the interview, the abandoned path visually fades to an ash color via animation and the interview overlay closes
  3. Generating a node on a remaining active path after abandonment produces text that is noticeably different in tone or content compared to what would generate without grief context — verifiable by swapping contexts in dev
  4. A grief archive panel is accessible during the session and shows all abandoned paths with their 3 interview answers
  5. Refreshing the page preserves all grief archive entries in the same browser tab session
**Plans**: TBD

### Phase 4: UI Polish + Demo Hardening
**Goal**: The app is visually complete with the full Vietnamese lacquerware aesthetic and is hardened against the specific failure modes of a live 2-minute hackathon demo
**Depends on**: Phase 3
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, DEMO-01, DEMO-02, DEMO-03, DEMO-04
**Success Criteria** (what must be TRUE):
  1. The app renders in deep red, gold, and black with a paper texture background and altar scroll layout at 1280×800 resolution without overflow or layout breaks
  2. Node branching animates as incense smoke splitting (Framer Motion path animation) and abandoned paths fade to ash color while the active chosen path remains gold
  3. If the Claude API fails or times out, the app silently loads pre-generated fallback JSON for the demo birthday and the experience continues without a broken state
  4. Navigating to `?reset` clears all session state and returns the user to the input screen
  5. A specific demo birthday has been selected and verified to produce a compelling psychological profile with strong archetypal path contrasts
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + Tử Vi Engine | 4/4 | Complete   | 2026-03-28 |
| 2. Claude Integration + Path Generation | 0/3 | Not started | - |
| 3. Grief System + Archive | 0/? | Not started | - |
| 4. UI Polish + Demo Hardening | 0/? | Not started | - |
