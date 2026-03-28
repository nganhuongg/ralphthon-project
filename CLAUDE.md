<!-- GSD:project-start source:PROJECT.md -->
## Project

**Verse**

Verse is a life path explorer for people at crossroads. Users input their birthday, birthplace, and one decision they're stuck on. The system calculates a real Tử Vi astrology chart (14 main stars, 12 palaces, heavenly stems and earthly branches), extracts a psychological profile from it, then uses Claude to generate three divergent future timelines as interactive branching node trees. When users abandon a path, a grief interview runs — and what was grieved subtly reshapes what remains. The tool is tender, not mystical. A mirror for conscious choice, not fortune-telling.

**Core Value:** Turn the moment someone doesn't know what to do with their life into a documented map of who they chose not to become.

### Constraints

- **Stack**: Next.js 14, Tailwind CSS, Framer Motion, Claude API (`claude-sonnet-4-6`) — no backend
- **Auth**: None — localStorage only for grief archive
- **Timeline**: Hackathon deadline (V1 must be demoed live)
- **Tử Vi calc**: Algorithmically exact — real lunar calendar conversion, exact star placement by birth hour/day/month/year; birthplace used for timezone → birth hour accuracy only
- **Node depth**: Maximum 5 nodes deep per path
- **Grief interview**: 3 questions, conversational (not ceremonial), Claude-generated responses
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| Next.js | 14.x (App Router) | Full framework | Constrained by PROJECT.md. App Router required for streaming route handlers. |
| React | 18.x (bundled with Next.js 14) | UI | Ships with Next.js 14; concurrent features needed for streaming UI. |
| TypeScript | 5.x | Type safety | Tử Vi star placement logic is complex enough that type errors are runtime bugs. Strongly typed chart objects prevent silent miscalculation. |
| Tailwind CSS | 3.4.x | Styling | See v3 vs v4 section below. Stick with v3 for this project. |
| Framer Motion | 11.x | Node tree animations | Constrained by PROJECT.md. v11 has first-class React 18 support and layout animations. |
| Vercel AI SDK (`ai`) | 3.x / 4.x | Claude streaming abstraction | Simplest path for streaming in App Router. `useChat` hook handles server-sent events, partial rendering, and error states. See Claude integration section. |
| `@anthropic-ai/sdk` | 0.24.x | Direct Claude SDK | Used inside API route only; Vercel AI SDK wraps this. Not called client-side. |
| Zod | 3.x | Input validation | Validate birthday/birthplace form inputs server-side before chart calculation. |
| `date-fns` | 3.x | Date arithmetic baseline | Gregorian date normalization before lunar conversion. Well-maintained, tree-shakeable. |
## Tử Vi Algorithm Approach
### Is there an existing JS/TS library?
- `amlich` — A small npm package implementing the Hồ Ngọc Đức algorithm, the standard Vietnamese lunar calendar conversion algorithm published in the 1990s. This is the most widely referenced algorithm in Vietnamese developer communities. Package existence and maintenance status need `npm info amlich` verification.
- `lunar-calendar` — A broader lunar calendar package with Chinese/Vietnamese support. Check `npm info lunar-calendar`.
- `@nghiavuive/lunar-date-vn` — A TypeScript-typed package specifically for Vietnamese âm lịch. LOW confidence on current state; search GitHub for forks.
- `vietnamese-lunar-calendar` — Another candidate; verify on npm.
- GitHub search `tuvi` or `tu-vi` in Vietnamese repos yields scattered implementations in PHP, Python, and C#, occasionally JavaScript. These are usable as algorithmic references.
- `tuvi-js` or similar named packages — not confirmed to exist on npm; verify before assuming.
- **PHP:** `tuvi-php` repositories on GitHub (several exist; use as algorithmic reference).
- **Python:** `tuvi` packages on PyPI; algorithmically complete, translatable to TypeScript.
- **Vietnamese developer blogs:** "Lập lá số Tử Vi bằng code" articles exist and walk through the algorithm step-by-step. Blocked during this research session but accessible in browser.
- **The Hồ Ngọc Đức paper** on Vietnamese lunar calendar is the authoritative source for the calendar conversion step.
## Claude API Integration
### Recommended: Vercel AI SDK v3/v4 with Route Handler
- `useChat` hook handles SSE parsing, partial token accumulation, error retry, and abort on component unmount — all things you'd otherwise write by hand.
- Works correctly with Next.js App Router without the Server Action streaming caveats (see below).
- Claude provider is a first-class integration: `import { anthropic } from '@ai-sdk/anthropic'`.
- Server Actions stream HTML, not raw token streams. They work for progressive enhancement but not for the fine-grained partial rendering needed for the node tree animation (you need to know when each node's text is complete to trigger Framer Motion entrance).
- Server Actions don't return a structured stream you can parse per-token — they return the final result or a React form state mutation. They are the wrong primitive for this use case.
- More code, same result. You'd be reimplementing what Vercel AI SDK already provides. The only reason to bypass it is if you need features it doesn't support — you don't here.
## Framer Motion Tree/Graph Animation
### Layout animations for dynamic node insertion
### AnimatePresence for node entry/exit
### SVG path animations for branch connections
### What NOT to do with Framer Motion for this project
- Do not use `react-flow` or `reactflow` — it's a full graph editor library, heavily opinionated, and its zoom/pan/node editor paradigm conflicts with the fixed 5-deep linear branching structure Verse needs. The "incense smoke" aesthetic requires custom SVG paths, not reactflow's default edge rendering.
- Do not use `d3-hierarchy` for layout — D3's force simulation is overkill for a max-5-deep tree with 3 fixed-width branches. Manual CSS column layout is simpler and more controllable.
### Practical tree layout approach
## Tailwind CSS v3 vs v4
### Recommendation: Use Tailwind CSS v3.4.x
- Tailwind CSS v4 was released in early 2025. As of mid-2025, the ecosystem of third-party component libraries and PostCSS plugin integrations had not fully caught up.
- v4 changes the configuration model (from `tailwind.config.js` to CSS-first config with `@theme` directives). This is a meaningful DX change — documentation and Stack Overflow answers for v4 patterns were sparser as of mid-2025.
- For a hackathon with a tight deadline, using a stable, well-documented version with abundant examples is correct. Every debugging hour matters.
- Next.js 14 has first-class documentation and starter templates for Tailwind v3. v4 support in Next.js was in progress but not yet the default.
- `bg-[#8B1A1A]` arbitrary values for the exact lacquerware red/gold palette — this works identically in v3 and v4.
- `backdrop-blur`, `text-shadow` plugin (via `tailwindcss-textshadow`), and animation utilities are all stable in v3.
- `@apply` for the scroll/altar texture components works reliably.
## Key Findings
## What NOT to Use
| Technology | Why Not |
|------------|---------|
| `reactflow` / React Flow | Full graph editor library — wrong abstraction for a fixed 3-path, 5-deep tree. Adds 400KB+ and fights the custom aesthetic. |
| D3.js force simulation | Overkill for a static branching layout. CSS flexbox columns + SVG overlay achieves the same result with zero learning curve. |
| Tailwind CSS v4 | Ecosystem not fully settled for hackathon use. Config model change creates debugging risk under deadline pressure. |
| Server Actions for streaming | Streams HTML mutations, not token streams. Can't drive partial node appearance for animation triggers. |
| Raw `@anthropic-ai/sdk` streaming without AI SDK | Reimplements what Vercel AI SDK already provides. More code, same result, more bugs. |
| Any "AI chart reading" shortcut (asking Claude to place stars) | PROJECT.md explicitly requires algorithmically exact calculation. AI-approximated star placement is technically incorrect and undermines the product's core defensibility claim. |
| `moment.js` | Deprecated, large bundle. Use `date-fns` or native `Intl` for date handling. |
| Prisma / any DB ORM | No backend in V1. Any DB dependency is scope creep. |
## Confidence Assessment
| Area | Confidence | Notes |
|------|------------|-------|
| Claude API / Vercel AI SDK approach | MEDIUM-HIGH | Patterns stable as of mid-2025; verify current AI SDK version with `npm info ai` |
| Framer Motion v11 patterns | MEDIUM | Core animation API stable; verify `AnimatePresence mode="popLayout"` is current API |
| Tailwind v3 vs v4 recommendation | MEDIUM | v4 release timing confirmed; ecosystem readiness assessment needs current npm/GitHub check |
| Tử Vi library existence (none found) | LOW | Could not search npm/GitHub during this session. Verify with `npm search tuvi`, `npm search tu-vi`, `npm search amlich` before implementing from scratch |
| Lunar calendar library (`amlich`) | LOW | Known from training data but version/maintenance status unverified. Run `npm info amlich` |
## Pre-Implementation Verification Steps
# Check lunar calendar packages
# Check if any Tử Vi packages exist
# Verify current Vercel AI SDK version
# Verify Framer Motion current version
## Sources
- PROJECT.md (project constraints and requirements)
- Training knowledge (cutoff August 2025) — covers Vercel AI SDK 3.x, Framer Motion 11.x, Tailwind CSS v3/v4 release timeline, Next.js 14 App Router patterns
- Hồ Ngọc Đức Vietnamese Lunar Calendar Algorithm — widely referenced in Vietnamese developer community; original paper available at `www.informatik.uni-leipzig.de/~duc/amlich/`
- Vercel AI SDK official docs: `sdk.vercel.ai` (not fetched this session — verify current version)
- Framer Motion docs: `framer.com/motion` (not fetched this session — verify current API)
- Anthropic docs: `docs.anthropic.com` (not fetched this session — verify current model IDs)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
