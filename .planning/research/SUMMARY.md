# Research Summary: Verse

**Project:** Verse — Vietnamese Tử Vi astrology life path explorer
**Domain:** AI-powered branching narrative / grief ritual / life decision tool
**Researched:** 2026-03-28
**Overall confidence:** MEDIUM

---

## Executive Summary

Verse is a hackathon-scoped life path explorer where a real Tử Vi astrology chart (calculated from birthdate + timezone) grounds Claude-generated branching future timelines. The core product loop is: input birthday + decision → compute chart → extract psychological profile → generate three archetypal path trees → let the user explore nodes, abandon paths, and accumulate a "grief archive" of who they chose not to become. The product's differentiator is not the AI generation but the calculation layer underneath it: the chart gives Claude a defensible, personalized foundation that competing "AI life coach" tools (Pi, Replika, Co-Star) lack.

The recommended technical approach is a pure Next.js 14 App Router application with no backend. The Tử Vi calculation runs as pure TypeScript on the client (no API calls). Claude is invoked via three Next.js Route Handlers using the Vercel AI SDK for streaming. State is managed in a Zustand store with localStorage persistence limited to the grief archive. Framer Motion handles the "incense smoke" branching tree animations. The single highest-risk technical dependency is the Tử Vi calculation engine: no production-grade JavaScript/TypeScript library for full Tử Vi chart placement was confirmed to exist as of mid-2025. This module must be implemented from scratch or adapted from Chinese lunar calendar libraries. It is the critical path for the entire demo.

The biggest risks for the hackathon are: (1) the Tử Vi calculation containing an edge-case bug that produces a wrong chart — which destroys user trust instantly since the product claims algorithmic exactness; (2) the Claude API timing out or hitting rate limits during the live demo; and (3) generic AI prose that fails the "tender mirror" test — paths that could belong to anyone, not this specific chart. All three risks are addressable with discipline: a unit test suite with Tết-boundary dates, a pre-generated fallback JSON for demo hardening, and a "prove it" prompt test that verifies output changes meaningfully when chart data changes.

---

## Recommended Stack

| Tool | Version | Why |
|------|---------|-----|
| Next.js | 14.x (App Router) | Constrained by PROJECT.md; App Router required for Route Handler streaming |
| React | 18.x | Ships with Next.js 14; concurrent features support streaming UI |
| TypeScript | 5.x | Tử Vi placement logic is complex enough that type errors become wrong charts |
| Tailwind CSS | 3.4.x | Avoid v4 for hackathon — ecosystem not fully settled, docs sparser under deadline |
| Framer Motion | 11.x | Constrained by PROJECT.md; `AnimatePresence mode="popLayout"` + SVG `pathLength` for incense-smoke tree |
| Vercel AI SDK (`ai`) | 3.x / 4.x | `useChat` + Route Handler gives token streaming with minimal boilerplate; avoid raw Server Actions for streaming |
| `@ai-sdk/anthropic` | current | Claude provider for Vercel AI SDK; wraps `@anthropic-ai/sdk` |
| Zod | 3.x | Validate birthday/birthplace form inputs server-side before chart calculation |
| `date-fns` | 3.x | Gregorian date normalization before lunar conversion; tree-shakeable, not deprecated like moment.js |
| Zustand | 4.x | Cross-cutting grief-to-path state requires a store; Jotai atom granularity is overkill for a 3×5 node tree |
| `nanoid` | current | Session IDs and node IDs for localStorage schema |

**Verify before first commit:**
```bash
npm info amlich                   # Vietnamese lunar calendar package
npm info lunar-javascript         # Chinese lunar calendar (adaptable)
npm info @nghiavuive/lunar-date-vn # TypeScript-typed Vietnamese lunar package
npm search tuvi                   # Any Tử Vi calculation packages
npm info ai                       # Vercel AI SDK current version
npm info framer-motion            # Confirm v11.x
```

**Do not use:** `reactflow` (wrong abstraction for fixed tree), `d3` force simulation (overkill), `moment.js` (deprecated), Server Actions for streaming (streams HTML not tokens), any DB/ORM (no backend in V1).

---

## Table Stakes Features

These must work in the demo or the demo fails.

- **Birthday + birthplace input form** — entry point; chart must render from this
- **Tử Vi chart display** — the "proof of work" that grounds the experience; judges need to see real computation happened
- **Psychological profile card** — 4 attributes (dominant palace, risk star, relational pattern, ambition structure) displayed as synthesized prose, not raw star names
- **Three named path cards** (duty / desire / transformation) — archetypal labels + one-line description before tree expands; orientation layer judges need before clicking
- **Node click → streaming text generation** — first node on the chosen path must stream visibly; loading spinners feel broken
- **Path abandonment trigger** — must be reachable within 2 minutes of demo start; this is the unique mechanic
- **Ash fade animation on abandonment** — single most visceral moment; must animate reliably
- **Grief interview overlay** — 3 conversational questions, Claude-generated, specific to the abandoned path content
- **Grief archive panel** — at least one entry visible by demo end; even thin demonstrates the concept
- **Vietnamese lacquerware visual identity** — deep red / gold / black / paper texture present at launch; generic UI destroys the product's tone

**Features explicitly deferred to V2:** user accounts, mobile optimization, social sharing, multiple simultaneous decisions, regional narrative flavor from birthplace, path regeneration, loading skeleton states, full WCAG accessibility compliance.

---

## Architecture in Brief

The app is a single-session Next.js 14 application with no backend. The Tử Vi calculation engine (`lib/tuvi/`) is a pure synchronous TypeScript module — no React, no async, no API calls — that takes `{ solarDate, hour, gender }` and returns a fully typed `TuViChart` object with 12 palaces and placed stars. This chart object is the central data contract: it flows into a `PsychProfile` display component (deterministic template rendering) and then into three Route Handlers (`/api/generate-paths`, `/api/generate-node`, `/api/grief-interview`) that call Claude via the Vercel AI SDK and stream responses back. The client tree is orchestrated by a Zustand store that holds chart state, three `PathState` slices (each a flat array of `PathNode` objects), an `activeInterview` slice, and an append-only `griefEntries` array. Only `griefEntries` is persisted to localStorage. Grief context flows through the API — when generating the next node for an active path, accumulated grief entries are serialized into the request body as structured influence signals (`{ abandoned_path, grief_themes, inflection }`), and Claude receives them as a system prompt modifier of no more than 100 tokens. The React tree does not need to know how grief reshapes predictions; it passes grief entries to fetch calls and the prompt builder handles the rest.

**Major components:**
1. `lib/tuvi/` — pure calculation engine: `lunar-converter.ts`, `palace-builder.ts`, `star-placer.ts`, `profile-extractor.ts`
2. `components/PathForest/` — 3 PathTree instances + grief context orchestration; calls `/api/generate-paths` on mount
3. `components/GriefInterview/` — modal overlay; calls `/api/grief-interview`; writes `GriefEntry` to store and localStorage
4. `app/api/` — 3 Route Handlers (generate-paths, generate-node, grief-interview); all stream; ANTHROPIC_API_KEY server-side only
5. `lib/store.ts` — Zustand store with localStorage `persist` middleware scoped to `griefEntries` only

---

## Critical Risks (Top 5)

Ranked by severity in hackathon context (a live 2-minute demo where a single failure is visible).

1. **Tử Vi chart calculation bug (demo-fatal).** A wrong star placement is immediately detectable by any Vietnamese user with chart knowledge, and invalidates the entire "algorithmically exact" claim that differentiates the product. Prevention: unit test the lunar converter with Tết-boundary dates (Jan 1 through Tết, exact Tết day, Tết through Dec 31); validate output against 3–5 known-correct reference charts from a trusted source (Tử Vi Kinh Dịch app or a Vietnamese astrologer) before Phase 2 begins. Do not proceed to Claude integration until the chart is verified.

2. **No production Tử Vi JS library exists (highest implementation risk).** The algorithm must be built from scratch or adapted from Chinese lunar calendar libraries (`lunar-javascript`). The lunar calendar conversion alone is ~200 lines; full star placement is ~400–600 lines. This is the most algorithmically dense component and the one most likely to harbor subtle bugs. Mitigation: scope birth years to 1967–present (avoids pre-reform calendar divergence), represent leap months as `{ month, isLeap }` tuples throughout, and verify `lunar-javascript` output is compatible with Vietnamese Tử Vi conventions before committing to it.

3. **Claude API failure during live demo (demo-fatal).** Rate limits (Tier 1: ~5 RPM), Vercel timeout (60s serverless / no limit on Edge Runtime), and network issues can all produce a blank or broken UI at the worst moment. Prevention: implement a pre-generated fallback JSON for the demo birthday, loaded transparently if any API call fails; add a hidden keyboard shortcut (`Cmd+Shift+D`) to jump to pre-generated state; use Edge Runtime (`export const runtime = 'edge'`) on all streaming routes to avoid the 60s timeout; generate 3 paths in parallel, not sequentially.

4. **Generic AI prose fails the "tender mirror" test.** Claude defaults to horoscope-register language when underconstrained. If paths could apply to anyone, the chart grounding claim collapses and the product is indistinguishable from Co-Star. Prevention: "prove it" test — swap chart data in the prompt and verify output changes meaningfully; ban "journey," "fulfillment," "purpose," "authentic," and "discover yourself" at the system prompt level; give each archetype (duty/desire/transformation) a structurally distinct template (not just a different theme).

5. **localStorage state pollution between demo sessions (demo-confusing).** Prior session grief entries corrupt the grief cross-contamination logic for the next demo audience. Prevention: `?reset` URL parameter that clears all localStorage on load; a visible "New Session" button; build this from Phase 1, not as a late patch.

---

## Build Order Recommendation

Dependencies strictly constrain order. Each phase must be stable before the next begins.

**Phase 1: Foundation + Tử Vi Engine**
The calculation engine is the critical dependency for everything else. Nothing else can be tested or integrated until the chart is correct. Build: TypeScript interfaces and `TuViChart` type contracts → Zustand store scaffolding → `lib/tuvi/` modules (lunar-converter → palace-builder → star-placer → profile-extractor) → `InputForm` + integration test → `ChartDisplay` rendering. Verification gate: chart output validated against reference charts before Phase 2. Scope declaration: 1967–present birth years only.

**Phase 2: Claude Streaming Integration**
With verified chart types in hand, wire the AI layer. Build: Vercel AI SDK setup + streaming verification (check browser network tab EventStream view before adding narrative complexity) → token budget design (cap context to spine-only, `max_tokens: 250` per node, session guard of 15 nodes) → `/api/generate-paths` route handler → prompt engineering with "prove it" test → `PathForest` + `PathTree` wired to store → `/api/generate-node` → `PsychProfile` rendering (synthesized prose, not raw star names).

**Phase 3: Grief System**
Depends on Phase 2 path state being stable. Build: grief influence schema design (structured signals, not raw text) → `/api/grief-interview` route handler → `GriefInterview` modal overlay → grief context injection into node generation prompts → `GriefArchive` drawer → localStorage persistence of grief entries → abandoned path `AnimatePresence` exit animation (unmount, not opacity:0).

**Phase 4: Polish + Demo Hardening**
Visual and reliability finishing. Build: ash fade animation → incense smoke SVG `pathLength` connector lines (fallback: CSS `scaleX` if SVG proves a rabbit hole) → gold glow on active path → Vietnamese altar scroll layout refinements → pre-generated fallback JSON for demo birthday → `?reset` URL parameter → hidden demo keyboard shortcut → test at 1280×800 resolution → identify 3 "high-drama" birthdays → rehearse the 2-minute demo arc.

**Critical path for hackathon demo:** Phases 1 and 2 are non-negotiable. Phase 3 (grief mechanic) is the differentiating mechanic but can be shown partially if time is short. Phase 4 polish strongly affects visual judges but is deferrable if core mechanics aren't solid.

---

## Open Questions to Resolve in Phase 1

These must be answered before writing production code — they affect fundamental architecture decisions.

1. **Does an active JS/TS Tử Vi library exist?** Run `npm info amlich`, `npm search tuvi`, `npm info lunar-javascript` before committing to a from-scratch implementation. If `lunar-javascript` covers Vietnamese lunar calendar with intercalary month support, use it as the calendar layer. If not, implement the Hồ Ngọc Đức algorithm directly.

2. **Does `lunar-javascript` output align with Vietnamese Tử Vi palace conventions?** Chinese and Vietnamese lunar calendars share the same math but use different meridians for pre-1967 dates. Since scope is limited to 1967–present, this may be moot — but verify with one test case before building on top of it.

3. **What is the exact star placement algorithm for the 14 main stars?** There are variant traditions in Tử Vi (Northern/Southern Vietnamese schools differ slightly on auxiliary star placement). Identify which tradition to implement and find a reference implementation to validate against before coding `star-placer.ts`.

4. **Which demo birthday produces the most compelling chart?** Run 10–20 birth dates through the algorithm once it's working. The demo birthday must be selected before Phase 3 so prompt testing uses the same chart data the live demo will use.

5. **Vercel AI SDK version compatibility with Next.js 14?** Run `npm info ai` and `npm info @ai-sdk/anthropic` and verify the streaming patterns in the current SDK docs match what's described in STACK.md before writing any route handler code.

---

*Research files: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*
*Research completed: 2026-03-28*
*Ready for roadmap: yes*
