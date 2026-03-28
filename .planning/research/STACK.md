# Stack Research: Verse

**Project:** Verse — Vietnamese Tử Vi astrology life path explorer
**Researched:** 2026-03-28
**Overall confidence:** MEDIUM
**Note on research limits:** WebSearch and WebFetch were unavailable during this session. All findings derive from training knowledge (cutoff August 2025). Specific npm package existence/version claims are LOW confidence and must be verified with `npm info <package>` before committing to them.

---

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

---

## Tử Vi Algorithm Approach

### Is there an existing JS/TS library?

**Confidence: LOW — verify before coding**

The Vietnamese open-source ecosystem has several small lunar calendar packages on npm, but dedicated Tử Vi star placement libraries are extremely rare in JavaScript/TypeScript. The known landscape as of mid-2025:

**Lunar calendar conversion (Gregorian → Lunar):**

- `amlich` — A small npm package implementing the Hồ Ngọc Đức algorithm, the standard Vietnamese lunar calendar conversion algorithm published in the 1990s. This is the most widely referenced algorithm in Vietnamese developer communities. Package existence and maintenance status need `npm info amlich` verification.
- `lunar-calendar` — A broader lunar calendar package with Chinese/Vietnamese support. Check `npm info lunar-calendar`.
- `@nghiavuive/lunar-date-vn` — A TypeScript-typed package specifically for Vietnamese âm lịch. LOW confidence on current state; search GitHub for forks.
- `vietnamese-lunar-calendar` — Another candidate; verify on npm.

**Recommendation on lunar calendar:** Implement the Hồ Ngọc Đức algorithm directly rather than depending on an unmaintained package. The algorithm is ~200 lines of math (Julian Day Number conversions, solar term calculations) and is well-documented in Vietnamese developer wikis. This gives you control over timezone handling (birthplace → UTC offset → correct birth hour, which matters for Tử Vi).

**Tử Vi star placement:**

No production-grade, actively maintained JavaScript/TypeScript Tử Vi library was known to exist as of mid-2025. The following open-source references exist but require verification:

- GitHub search `tuvi` or `tu-vi` in Vietnamese repos yields scattered implementations in PHP, Python, and C#, occasionally JavaScript. These are usable as algorithmic references.
- `tuvi-js` or similar named packages — not confirmed to exist on npm; verify before assuming.

**Recommendation: implement the algorithm yourself.** The core Tử Vi calculation is deterministic and finite:

1. Convert Gregorian birthdate + timezone to Vietnamese lunar date (year, month, day, hour in 12-branch system).
2. Determine Can/Chi (heavenly stem + earthly branch) for birth year using the 60-year cycle: `year_stem = (year - 4) % 10`, `year_branch = (year - 4) % 12`.
3. Place the 14 main stars (Tử Vi, Thiên Phủ, and the 12 auxiliary stars) across the 12 palaces using the standard placement tables. These tables are fixed lookup tables, not dynamic calculations.
4. Determine the starting palace (Mệnh palace) from birth month and hour branch.
5. Assign heavenly stems to palaces using the An Can algorithm.

The full algorithm fits in ~400–600 lines of TypeScript with lookup tables. Reference implementations to consult:

- **PHP:** `tuvi-php` repositories on GitHub (several exist; use as algorithmic reference).
- **Python:** `tuvi` packages on PyPI; algorithmically complete, translatable to TypeScript.
- **Vietnamese developer blogs:** "Lập lá số Tử Vi bằng code" articles exist and walk through the algorithm step-by-step. Blocked during this research session but accessible in browser.
- **The Hồ Ngọc Đức paper** on Vietnamese lunar calendar is the authoritative source for the calendar conversion step.

**Structure recommendation for the codebase:**

```
lib/
  tuvi/
    lunar-calendar.ts      ← Gregorian → Lunar (Hồ Ngọc Đức algorithm)
    stem-branch.ts         ← Can/Chi calculations
    star-placement.ts      ← 14 main stars + 12 palaces
    palace-analysis.ts     ← Extract psychological profile from chart
    index.ts               ← Public API: calculateChart(birthday, timezone)
```

The output of `calculateChart` should be a typed `TuViChart` object with all 12 palaces, each containing their assigned stars and Can/Chi values. Claude receives this as structured JSON in the system prompt — not raw numbers, but interpreted psychological descriptors (e.g. "Tử Vi in Mệnh palace: strong drive for authority and recognition").

---

## Claude API Integration

**Confidence: MEDIUM-HIGH** (Vercel AI SDK is well-documented; stream patterns confirmed in training data through mid-2025)

### Recommended: Vercel AI SDK v3/v4 with Route Handler

**Why Vercel AI SDK over raw `@anthropic-ai/sdk` streaming:**
- `useChat` hook handles SSE parsing, partial token accumulation, error retry, and abort on component unmount — all things you'd otherwise write by hand.
- Works correctly with Next.js App Router without the Server Action streaming caveats (see below).
- Claude provider is a first-class integration: `import { anthropic } from '@ai-sdk/anthropic'`.

**Pattern:**

```typescript
// app/api/generate-paths/route.ts
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { chart, decision } = await req.json();

  const result = await streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: buildSystemPrompt(chart),  // TuViChart → psychological context
    messages: [{ role: 'user', content: decision }],
    maxTokens: 2000,
  });

  return result.toDataStreamResponse();
}
```

```typescript
// Client component
import { useChat } from 'ai/react';

const { messages, append, isLoading } = useChat({
  api: '/api/generate-paths',
});
```

**Why NOT Server Actions for streaming:**
- Server Actions stream HTML, not raw token streams. They work for progressive enhancement but not for the fine-grained partial rendering needed for the node tree animation (you need to know when each node's text is complete to trigger Framer Motion entrance).
- Server Actions don't return a structured stream you can parse per-token — they return the final result or a React form state mutation. They are the wrong primitive for this use case.

**Why NOT raw `ReadableStream` + `@anthropic-ai/sdk` directly:**
- More code, same result. You'd be reimplementing what Vercel AI SDK already provides. The only reason to bypass it is if you need features it doesn't support — you don't here.

**Key packages:**
```bash
npm install ai @ai-sdk/anthropic
```

**Environment variable:** `ANTHROPIC_API_KEY` (in `.env.local`, never committed).

**Structured output for node trees:** Use `streamObject` from Vercel AI SDK with a Zod schema if you want typed JSON streaming (each node streamed as a partial object). For V1, `streamText` with a JSON-in-prose output format is simpler and sufficient. Upgrade to `streamObject` in a second pass if parse errors become a problem.

---

## Framer Motion Tree/Graph Animation

**Confidence: MEDIUM** (Framer Motion v11 patterns from training data; verify current docs)

**Framer Motion v11 is the right tool.** The key patterns for the incense-smoke branching node tree:

### Layout animations for dynamic node insertion

When a user clicks a node and a child node appears, use `layout` prop to animate surrounding nodes shifting:

```tsx
<motion.div layout layoutId={node.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: 'spring', stiffness: 200, damping: 25 }} />
```

### AnimatePresence for node entry/exit

Wrap the node tree in `<AnimatePresence mode="popLayout">` so abandoned nodes animate out before new ones animate in. `mode="popLayout"` is critical — it removes the exiting element from layout immediately, preventing layout thrash.

### SVG path animations for branch connections

The incense-smoke connection lines should be SVG `<path>` elements animated with Framer Motion's `pathLength` motionValue:

```tsx
<motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeOut' }} />
```

Calculate path coordinates from node positions using a `useRef` + `getBoundingClientRect` approach, or use a CSS-based tree layout (column flex) to avoid manual coordinate math.

### What NOT to do with Framer Motion for this project

- Do not use `react-flow` or `reactflow` — it's a full graph editor library, heavily opinionated, and its zoom/pan/node editor paradigm conflicts with the fixed 5-deep linear branching structure Verse needs. The "incense smoke" aesthetic requires custom SVG paths, not reactflow's default edge rendering.
- Do not use `d3-hierarchy` for layout — D3's force simulation is overkill for a max-5-deep tree with 3 fixed-width branches. Manual CSS column layout is simpler and more controllable.

### Practical tree layout approach

Structure: 3 columns (one per path), each column is a vertical list of nodes (max 5). Connection lines drawn in an SVG overlay positioned `absolute` over the column grid. This avoids coordinate math — you only need to connect adjacent nodes in the same column, which are always vertically adjacent.

---

## Tailwind CSS v3 vs v4

**Confidence: MEDIUM** (v4 release status known from training; ecosystem readiness requires current verification)

### Recommendation: Use Tailwind CSS v3.4.x

**Why not v4:**
- Tailwind CSS v4 was released in early 2025. As of mid-2025, the ecosystem of third-party component libraries and PostCSS plugin integrations had not fully caught up.
- v4 changes the configuration model (from `tailwind.config.js` to CSS-first config with `@theme` directives). This is a meaningful DX change — documentation and Stack Overflow answers for v4 patterns were sparser as of mid-2025.
- For a hackathon with a tight deadline, using a stable, well-documented version with abundant examples is correct. Every debugging hour matters.
- Next.js 14 has first-class documentation and starter templates for Tailwind v3. v4 support in Next.js was in progress but not yet the default.

**What v3 gives you that matters for Verse:**
- `bg-[#8B1A1A]` arbitrary values for the exact lacquerware red/gold palette — this works identically in v3 and v4.
- `backdrop-blur`, `text-shadow` plugin (via `tailwindcss-textshadow`), and animation utilities are all stable in v3.
- `@apply` for the scroll/altar texture components works reliably.

**Tailwind v3 install:**
```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

**If building post-hackathon (V2+):** Migrate to v4 then. The CSS-first config model is cleaner for a mature project.

---

## Key Findings

1. **No production-ready Tử Vi JS/TS library exists** — the algorithm must be implemented from scratch. The Hồ Ngọc Đức lunar calendar algorithm is the authoritative source for the calendar conversion step and is ~200 lines; the full chart placement is ~400-600 lines total. Budget one full implementation phase for this.

2. **Vercel AI SDK v3/v4 is the correct Claude streaming integration** — `useChat` + a Route Handler gives streaming tokens to the client with minimal boilerplate. Server Actions are the wrong primitive for streaming node tree content.

3. **Tailwind v3.4.x over v4** — for hackathon speed, v3 is safer. The ecosystem gaps in v4 create unnecessary debugging surface area when the deadline is fixed.

4. **Framer Motion's `AnimatePresence mode="popLayout"` + SVG `pathLength` animation** is the correct pattern for the incense-smoke branching tree. Do not reach for reactflow or D3 — they're the wrong abstraction for a fixed linear branching structure.

5. **The `TuViChart` typed object is the core data contract** — everything flows through it: chart calculation → psychological profile extraction → Claude system prompt → path generation → node tree rendering. Get this type right early; it's the API surface between the calculation engine, the AI layer, and the UI.

---

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

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Claude API / Vercel AI SDK approach | MEDIUM-HIGH | Patterns stable as of mid-2025; verify current AI SDK version with `npm info ai` |
| Framer Motion v11 patterns | MEDIUM | Core animation API stable; verify `AnimatePresence mode="popLayout"` is current API |
| Tailwind v3 vs v4 recommendation | MEDIUM | v4 release timing confirmed; ecosystem readiness assessment needs current npm/GitHub check |
| Tử Vi library existence (none found) | LOW | Could not search npm/GitHub during this session. Verify with `npm search tuvi`, `npm search tu-vi`, `npm search amlich` before implementing from scratch |
| Lunar calendar library (`amlich`) | LOW | Known from training data but version/maintenance status unverified. Run `npm info amlich` |

---

## Pre-Implementation Verification Steps

Before writing the first line of code, verify these LOW-confidence items:

```bash
# Check lunar calendar packages
npm info amlich
npm info lunar-calendar
npm info @nghiavuive/lunar-date-vn

# Check if any Tử Vi packages exist
npm search tuvi
npm search "tu vi"

# Verify current Vercel AI SDK version
npm info ai
npm info @ai-sdk/anthropic

# Verify Framer Motion current version
npm info framer-motion
```

If `amlich` or a similar package is actively maintained (last publish < 12 months, has TypeScript types), use it for the lunar calendar conversion step. If not, implement the Hồ Ngọc Đức algorithm directly — it's well-documented and ~200 lines.

---

## Sources

- PROJECT.md (project constraints and requirements)
- Training knowledge (cutoff August 2025) — covers Vercel AI SDK 3.x, Framer Motion 11.x, Tailwind CSS v3/v4 release timeline, Next.js 14 App Router patterns
- Hồ Ngọc Đức Vietnamese Lunar Calendar Algorithm — widely referenced in Vietnamese developer community; original paper available at `www.informatik.uni-leipzig.de/~duc/amlich/`
- Vercel AI SDK official docs: `sdk.vercel.ai` (not fetched this session — verify current version)
- Framer Motion docs: `framer.com/motion` (not fetched this session — verify current API)
- Anthropic docs: `docs.anthropic.com` (not fetched this session — verify current model IDs)
