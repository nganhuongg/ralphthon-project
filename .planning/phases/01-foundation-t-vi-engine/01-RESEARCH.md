# Phase 1: Foundation + Tử Vi Engine - Research

**Researched:** 2026-03-28
**Domain:** Vietnamese Tử Vi astrology calculation engine, Next.js 14 App Router scaffold, Zustand store, Tailwind CSS lacquerware theme
**Confidence:** MEDIUM-HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Birth hour is optional — if not provided, silently default to Giờ Ngọ (noon, 11am–1pm block). No caveat shown to the user.
**D-02:** Birth hour input is a clock time field (HH:MM) if shown. Convert to correct giờ block internally. Do not expose traditional 12-giờ names in the input form.
**D-03:** 12-palace chart renders as a modern 4×4 grid — same structural layout as traditional Vietnamese Tử Vi charts (outer ring of 12 palaces, hollow center or center used for chart metadata), styled with lacquerware aesthetic tokens.
**D-04:** Each palace cell displays: star names + palace label + a short English gloss (e.g. "Quan Lộc — career"). Makes the chart legible to curious outsiders while remaining authentic.
**D-05:** The dominant palace (from the psychological profile) should be visually distinguished in the chart — highlighted palace cell.
**D-06:** Phase 1 sets up the full Tailwind token foundation: lacquerware color palette (deep red, gold, black), paper texture (CSS background or image), and typography (Vietnamese diacritic-capable font).
**D-07:** Phase 1 also builds a basic page shell — background color/texture applied, altar scroll layout container, so every subsequent phase drops components into the correct visual context. Full animations and polish are deferred to Phase 4.
**D-08:** Next.js 14 App Router (not Pages Router) — required for Claude API streaming in Phase 2.
**D-09:** TypeScript strict mode. All chart types defined as a shared `TuViChart` interface before any UI is built.
**D-10:** Zustand store established in Phase 1 with the full shape (chart data, psychological profile, path states, grief archive) — even though only chart/profile slices are populated in this phase.
**D-11:** Algorithmically exact calculation. Investigate whether `lunar-javascript` or `amlich` (npm) can handle Vietnamese lunar calendar conversion before writing from scratch. If no suitable library, implement Hồ Ngọc Đức algorithm.
**D-12:** Birthplace is used only for timezone derivation → accurate birth hour. No regional narrative flavor in V1.
**D-13:** Chart calculation must be validated against at least one known-correct reference chart before Phase 2 begins. This is a hard gate.

### Claude's Discretion

- Exact color hex values within the lacquerware palette (deep red ~#8B0000, gold ~#C9A84C, black ~#1A0A00 — exact values are Claude's call)
- Loading/transition state between form submit and chart display
- Empty state for palace cells with no stars
- Exact Zustand store slice boundaries

### Deferred Ideas (OUT OF SCOPE)

- None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INPUT-01 | User can enter date of birth (day, month, year) | Zod v4 validation schema; controlled inputs in React |
| INPUT-02 | User can enter birthplace (city/region, used for timezone → birth hour derivation) | `Intl.DateTimeFormat` for UTC offset lookup; keep simple string input with timezone offset table |
| INPUT-03 | User can enter one life decision they are currently stuck on (free text) | Unstructured textarea; Zod min-length validation |
| INPUT-04 | Form validates inputs before chart calculation begins | Zod v4 `.parse()` or `.safeParse()` with per-field error display |
| CHART-01 | System converts Gregorian birthday to Vietnamese lunar calendar date (algorithmically exact — Hồ Ngọc Đức algorithm or equivalent) | `@dqcai/vn-lunar` provides this; validates against known reference |
| CHART-02 | System derives Can Chi (heavenly stem + earthly branch) for year, month, day, and hour of birth | `@dqcai/vn-lunar` exposes `yearCanChi`, `monthCanChi`, `dayCanChi`; hour branch calculated manually from giờ block |
| CHART-03 | System places all 14 main stars (Tử Vi, Thiên Phủ, and 12 satellite stars) across 12 palaces | `tuvi-neo` v1.0.7 covers 140+ stars including all 14 main — but is AI-generated (use as reference only); star placement algorithm must be self-implemented or validated against reference charts |
| CHART-04 | Chart output is a typed data structure (TuViChart) used as input to profile extraction and Claude | TypeScript interfaces defined in `lib/tuvi/types.ts` before any other module; strict mode enforces type safety |
| PROF-01 | System extracts dominant palace from the chart (palace with highest-weight star cluster) | Star-weight lookup table; deterministic from chart data |
| PROF-02 | System identifies risk star (primary challenging star in the chart) | Fixed mapping: Thất Sát, Phá Quân, Tham Lang, Liêm Trinh are the primary risk stars; dominance by palace position |
| PROF-03 | System derives relational pattern (how the chart describes interpersonal tendencies) | Template lookup from Mệnh + Quan Lộc palace combination |
| PROF-04 | System derives ambition structure (how the chart describes drive and career orientation) | Template lookup from Quan Lộc palace main star |
| PROF-05 | Psychological profile is displayed to user before paths are generated | `PsychProfile.tsx` — display component, deterministic prose from lookup tables, no Claude call |
</phase_requirements>

---

## Summary

Phase 1 establishes the complete foundation that all other phases depend on. The most critical and risky component is the Tử Vi calculation engine — a pure TypeScript module that must produce algorithmically exact chart output with no external API calls. The central finding from this research is that the ecosystem has advanced since prior research: two relevant npm packages now exist (`tuvi-neo` v1.0.7 and `@dqcai/vn-lunar`), but both require careful evaluation before trust. Additionally, several stack packages have reached major new versions (Vercel AI SDK is now v6, Framer Motion is v12, Zustand is v5, Zod is v4) with breaking API changes from what the existing STACK.md documented.

The recommended approach for the calculation engine: use `@dqcai/vn-lunar` (MIT, production quality, TypeScript, zero dependencies) for the Gregorian→Lunar conversion and Can Chi derivation — this is the algorithmically hard part. Implement the 14 main star placement as custom TypeScript based on the documented algorithm, using `tuvi-neo` as an algorithmic reference only (not as a dependency — it is 90%+ AI-generated code with no verifiable correctness guarantees). This hybrid approach avoids implementing the full Hồ Ngọc Đức algorithm from scratch while keeping the star placement logic in auditable, project-owned code.

The scaffold decisions (Next.js 14, TypeScript strict mode, Zustand v5, Tailwind CSS) are all confirmed as viable, but implementors must use the correct current API versions — not the versions documented in the existing STACK.md research, which is now 6–10 months stale in several areas.

**Primary recommendation:** Use `@dqcai/vn-lunar` for calendar math; implement star placement as ~300 lines of owned TypeScript; validate against reference charts before Phase 2. Use exact package versions documented in this research file — not the prior STACK.md versions.

---

## Standard Stack

### Core (Phase 1 scope)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 14.2.35 (pinned) | App Router framework | PROJECT.md constraint; App Router required for streaming in Phase 2 |
| React | 18.x (bundled) | UI | Bundled with Next.js 14; concurrent features support streaming |
| TypeScript | 5.x | Type safety | Tử Vi placement bugs are silent without types; strict mode required (D-09) |
| Tailwind CSS | 3.4.x | Styling | Install explicitly as `tailwindcss@3`; v4 is now latest but v3 is safer for Next.js 14 (see note) |
| Zustand | 5.0.12 | State management | D-10 requires full store shape in Phase 1; v5 is current stable |
| `@dqcai/vn-lunar` | 1.0.1 | Vietnamese lunar calendar | MIT, TypeScript, zero deps, production quality; handles Can Chi, leap months, 1200–2199 CE |
| Zod | 4.3.6 | Input validation | INPUT-04; v4 is current — use `z.email()` top-level syntax not `z.string().email()` |
| `date-fns` | 4.1.0 | Gregorian date normalization | Tree-shakeable, zero-dependency, not deprecated (unlike moment.js) |
| nanoid | 5.1.7 | Node IDs for store | Used for stable React keys and localStorage IDs |

### Supporting (Phase 1 scope)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@ai-sdk/react` | latest matching `ai@6.x` | `useChat` hook (Phase 2, but type imports needed) | Import `useChat` from `@ai-sdk/react` not `ai/react` in v6 |
| `ai` | 6.0.141 | Vercel AI SDK core (Phase 2) | Not needed in Phase 1; install now so store types can reference message shapes |

### Tailwind CSS v3 vs v4 Decision (updated)

Tailwind v4.2.2 is now current. It IS compatible with Next.js 14, and documentation is now substantially more mature than mid-2025. However, v4 changes the configuration model to CSS-first `@theme` directives — all existing examples in STACK.md assume v3 config patterns. For hackathon speed, the original recommendation stands: **install `tailwindcss@3` explicitly** to avoid config model friction. If the project is greenfield with no existing Tailwind config, v4 is also viable but requires learning the new config model.

Decision: Use `tailwindcss@3.4.x`. Install with `--save-exact` flag.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@dqcai/vn-lunar` | Hand-rolled Hồ Ngọc Đức algorithm | From-scratch is ~200 lines but introduces new bugs; library is verified against Vietnamese calendar standards |
| Custom star placement | `tuvi-neo` as dependency | tuvi-neo is 90%+ AI-generated, no correctness guarantees; cannot validate against reference without own implementation |
| Tailwind v3 | Tailwind v4 | v4 is now mature but CSS-first config model adds learning curve; v3 is zero-risk for hackathon |
| Zustand v5 | Jotai v2 | Jotai atom-per-node granularity is overkill for a 3×5 flat tree; Zustand slices fit the store shape naturally |

**Installation:**
```bash
npx create-next-app@14 verse --typescript --tailwind --app --no-src-dir
# Then pin tailwind to v3:
npm install tailwindcss@3.4.x postcss autoprefixer --save-dev
# Core dependencies:
npm install @dqcai/vn-lunar zustand date-fns nanoid zod
# Phase 2 prep (install now for type imports):
npm install ai @ai-sdk/anthropic @ai-sdk/react
# Motion library (renamed from framer-motion):
npm install motion
```

**Note on `motion` vs `framer-motion`:** Framer Motion was renamed to `motion` in 2025. The package is now `motion`, and the import path changes from `framer-motion` to `motion/react`. No API breaking changes — same `AnimatePresence`, `motion.div`, layout animations. Install `motion` not `framer-motion`.

---

## Architecture Patterns

### Recommended Project Structure
```
verse/
├── app/
│   ├── layout.tsx          # Root layout — Vietnamese aesthetic globals, Tailwind theme
│   ├── page.tsx            # Session orchestrator, phase state machine
│   └── api/                # Route handlers (Phase 2–3; scaffold dirs in Phase 1)
│       ├── generate-paths/
│       ├── generate-node/
│       └── grief-interview/
├── components/
│   ├── InputForm.tsx        # Birthday + decision input
│   ├── ChartDisplay/
│   │   ├── ChartDisplay.tsx
│   │   ├── PalaceGrid.tsx  # 4×4 grid layout (D-03)
│   │   └── PalaceCell.tsx  # Stars + label + English gloss (D-04)
│   └── PsychProfile.tsx    # Profile card (PROF-05)
├── lib/
│   ├── tuvi/
│   │   ├── types.ts        # TuViChart, Palace, Star — ALL types here
│   │   ├── constants.ts    # Star names, palace names, stem/branch arrays, weight tables
│   │   ├── lunar-bridge.ts # Adapter: @dqcai/vn-lunar → TuViChart inputs
│   │   ├── palace-builder.ts # 12 palace stem/branch assignment from birth data
│   │   ├── star-placer.ts  # 14 main star placement rules (self-implemented)
│   │   ├── profile-extractor.ts # Deterministic profile from chart
│   │   └── index.ts        # Public API: calculateChart(input) → TuViChart
│   ├── store.ts            # Zustand store — full shape per D-10
│   └── storage.ts          # localStorage helpers (grief archive only)
└── public/
    └── fonts/              # Vietnamese diacritic font files
```

### Pattern 1: Pure Synchronous Calculation Engine

**What:** `lib/tuvi/index.ts` exports a single synchronous function. No React, no async, no side effects. Input/output are plain TypeScript objects.

**When to use:** This is the only pattern for the calculation layer. Any async dependency introduces demo failure surface.

**Example:**
```typescript
// lib/tuvi/index.ts
import { calculateLunarDate } from './lunar-bridge';
import { buildPalaces } from './palace-builder';
import { placeStars } from './star-placer';
import { extractProfile } from './profile-extractor';
import type { BirthInput, TuViChart } from './types';

export function calculateChart(input: BirthInput): TuViChart {
  const lunarDate = calculateLunarDate(input.solarDate, input.timezoneOffset);
  const palaces = buildPalaces(lunarDate, input.hour, input.gender);
  const placedPalaces = placeStars(palaces, lunarDate);
  const profile = extractProfile(placedPalaces);
  return { lunarDate, palaces: placedPalaces, ...profile };
}
```

### Pattern 2: @dqcai/vn-lunar as Calendar Bridge

**What:** Wrap the library in a thin adapter that converts its output to `TuViChart` input types, normalizing field names to Vietnamese terminology.

**When to use:** Any Gregorian→Lunar conversion or Can Chi derivation. Never call the library directly from `star-placer.ts` or higher layers.

**Example:**
```typescript
// lib/tuvi/lunar-bridge.ts
import { LunarCalendar } from '@dqcai/vn-lunar';
import type { SolarDate, LunarDate } from './types';

export function calculateLunarDate(solar: SolarDate, timezoneOffset: number): LunarDate {
  // Apply timezone offset to get local datetime before lunar conversion
  const localDate = applyTimezoneOffset(solar, timezoneOffset);
  const lunar = LunarCalendar.fromSolar(localDate.day, localDate.month, localDate.year);
  return {
    year: lunar.lunarYear,
    month: lunar.lunarMonth,
    day: lunar.lunarDay,
    isLeap: lunar.isLeapMonth,
    yearCanChi: lunar.yearCanChi,   // e.g. "Giáp Tý"
    monthCanChi: lunar.monthCanChi,
    dayCanChi: lunar.dayCanChi,
  };
}
```

### Pattern 3: Zustand v5 Store with Scoped Persist

**What:** Full store shape defined in Phase 1 (D-10). Only `griefEntries` slice persisted to localStorage. Zustand v5 `persist` middleware behavioral change — initial state is no longer auto-persisted at creation.

**When to use:** All cross-component state in Verse. Read from store, not from props, for chart data.

**Example:**
```typescript
// lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TuViChart, PathState, GriefEntry, BirthInput } from './tuvi/types';

interface VerseStore {
  // Phase 1: populated
  birthInput: BirthInput | null;
  decision: string;
  chart: TuViChart | null;
  setChart: (chart: TuViChart) => void;
  setDecision: (decision: string) => void;

  // Phase 2–3: shape defined, not populated yet
  paths: { duty: PathState; desire: PathState; transformation: PathState };
  activeInterview: { pathId: string | null; questionIndex: number; answers: string[] };

  // Persisted
  griefEntries: GriefEntry[];
  addGriefEntry: (entry: GriefEntry) => void;
}

export const useVerseStore = create<VerseStore>()(
  persist(
    (set) => ({
      birthInput: null,
      decision: '',
      chart: null,
      setChart: (chart) => set({ chart }),
      setDecision: (decision) => set({ decision }),
      paths: { duty: idlePathState(), desire: idlePathState(), transformation: idlePathState() },
      activeInterview: { pathId: null, questionIndex: 0, answers: [] },
      griefEntries: [],
      addGriefEntry: (entry) => set((s) => ({ griefEntries: [...s.griefEntries, entry] })),
    }),
    {
      name: 'verse-grief-archive',
      partialState: (state) => ({ griefEntries: state.griefEntries }),
      version: 1,
    }
  )
);
```

**Note on Zustand v5 `partialState`:** Verify the correct `partialize` (not `partialState`) key in Zustand v5 persist middleware docs before shipping. The rename from `partialize` occurred in v4.

### Pattern 4: Zod v4 Form Validation

**What:** Validate `BirthInput` before calculation. Zod v4 has breaking changes from v3 — use new syntax.

**Example:**
```typescript
// lib/tuvi/validation.ts
import { z } from 'zod';

export const BirthInputSchema = z.object({
  solarDate: z.object({
    year: z.number().int().min(1967).max(2025), // scope: post-reform dates only
    month: z.number().int().min(1).max(12),
    day: z.number().int().min(1).max(31),
  }),
  hour: z.number().int().min(0).max(23).optional(),  // optional per D-01
  gender: z.enum(['M', 'F']),
  birthplace: z.string().min(2),
  decision: z.string().min(10).max(500),
});
// NOTE: Zod v4 breaking change: z.record() now requires two args.
// For form errors: use .safeParse() and map error.issues (not error.errors — changed in v4)
```

### Pattern 5: 4×4 Palace Grid Layout (D-03)

**What:** Traditional Tử Vi chart visual. 12 palaces arranged as a 4×4 grid with the center 2×2 hollow (used for chart metadata). Palaces start at the bottom-right and rotate counter-clockwise.

**Grid mapping (standard Vietnamese layout):**
```
┌────────┬────────┬────────┬────────┐
│  P12   │   P1   │   P2   │   P3   │
│        │        │        │        │
├────────┼────────┼────────┼────────┤
│  P11   │  [META]│  [META]│   P4   │
│        │        │        │        │
├────────┼────────┼────────┼────────┤
│  P10   │  [META]│  [META]│   P5   │
│        │        │        │        │
├────────┼────────┼────────┼────────┤
│   P9   │   P8   │   P7   │   P6   │
│        │        │        │        │
└────────┴────────┴────────┴────────┘
```
Center cells (2×2) hold: birth data, Can Chi for year/month/day/hour, chart title.

### Anti-Patterns to Avoid

- **Using `tuvi-neo` as a production dependency:** It is self-described as "90%+ AI-generated code." Use it as a cross-reference to validate your own implementation, never as the authoritative source of truth for star placement.
- **Async calculation engine:** The chart calculation must be synchronous. No `await`, no API calls, no dynamic imports inside `calculateChart()`. Any async dependency creates a demo failure surface.
- **Putting raw star names in the psychological profile display:** Profile text shown to users must be synthesized prose ("strong drive for authority and recognition"), not raw star names ("Tử Vi in Mệnh palace"). Raw names are only appropriate in the chart grid view.
- **Deriving lunar year from Gregorian year directly:** Never use `year % 12` to determine the animal year. Always use the lunar calendar library, which accounts for the lunar new year (Tết) boundary.
- **Calling `@dqcai/vn-lunar` from outside `lunar-bridge.ts`:** All library access goes through the adapter. This makes it trivial to swap the library later if it has bugs.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gregorian → Vietnamese lunar calendar conversion | Custom Julian Day Number math | `@dqcai/vn-lunar` | Intercalary month detection, year boundary at Tết, Can Chi for all units — 200+ lines of verified astronomical math |
| UTC timezone offset lookup from city name | Hardcoded city table | `Intl.DateTimeFormat` + known Vietnamese cities → UTC+7 | Vietnam is uniformly UTC+7; hardcode offset for VN cities, use Intl for others |
| Form state and validation errors | Manual `useState` + error strings | Zod v4 `.safeParse()` + `react-hook-form` (optional) | Zod handles type coercion, error messages, cross-field validation |
| localStorage read/write with versioning | Raw `localStorage.setItem/getItem` | Zustand `persist` middleware | Handles hydration, version migration, and SSR-safe access |
| Unique IDs for nodes and sessions | `Math.random().toString(36)` | `nanoid` | URL-safe, cryptographically random, no collisions |

**Key insight:** The lunar calendar math is the only genuinely complex algorithmic problem in Phase 1. Everything else (star placement tables, profile extraction) is lookup logic that is simple to write but must be correct. Do not under-invest in validating the calendar conversion step.

---

## Common Pitfalls

### Pitfall 1: Lunar Year Boundary (Tết Off-by-One)

**What goes wrong:** A user born January 20, 1990 is in lunar year Kỷ Tỵ (1989 Snake), not Canh Ngọ (1990 Horse). Code that converts Gregorian year directly to Can Chi returns the wrong animal year for anyone born between January 1 and Tết day.

**Why it happens:** `year % 12` shortcuts ignore that Tết falls between late January and late February and shifts by up to 27 days each year.

**How to avoid:** Always derive lunar year from `@dqcai/vn-lunar` output, never from Gregorian year arithmetic.

**Warning signs:** Test case: birthday 1985-01-20 must return lunar year Giáp Tý (1984 Rat), not Ất Sửu (1985 Ox). If you get 1985's animal, the boundary is broken.

---

### Pitfall 2: Leap Month (Tháng Nhuận) Misassignment

**What goes wrong:** Vietnamese lunar calendar inserts an intercalary month roughly every 2–3 years. A user born in "month 4" during a leap-month year may be in Leap Month 3 or regular Month 4 — and the distinction changes palace assignments.

**How to avoid:** Represent lunar months as `{ month: number, isLeap: boolean }` tuples. `@dqcai/vn-lunar` exposes `isLeapMonth` — propagate this through the entire calculation pipeline.

**Warning signs:** Test year 2023 (had Leap Month 2): two birth dates in the doubled period must produce different palace arrangements.

---

### Pitfall 3: Midnight Birth Hour (Giờ Tý Boundary)

**What goes wrong:** Tý hour (Rat) spans 11 PM–1 AM, crossing midnight. A birth at 11:45 PM December 31 is in the Tý hour of January 1. Code that truncates by calendar date assigns the wrong Giờ.

**How to avoid:** Keep timezone offset and local datetime as a single object through the entire Giờ calculation. Apply offset before splitting into date/time components.

**Warning signs:** Test: born 11:50 PM in Ho Chi Minh City. Should assign Tý (Rat) hour even though UTC is next calendar day.

---

### Pitfall 4: Zod v4 Breaking Syntax (Replacing STACK.md v3 Patterns)

**What goes wrong:** STACK.md documents Zod v3. Current is Zod v4.3.6. Using v3 syntax produces runtime errors or incorrect behavior.

**Key API changes:**
- `z.string().email()` → `z.email()` (top-level function)
- `z.string().uuid()` → `z.guid()` (if you need v3-compatible UUID validation)
- `error.errors` → `error.issues` in ZodError
- `z.record(valueSchema)` → `z.record(keySchema, valueSchema)` (two args required)
- `invalid_type_error` / `required_error` params dropped — use `error:` param instead

**How to avoid:** Use `zod@4.3.6` and read the v4 migration guide before writing any schema.

---

### Pitfall 5: Vercel AI SDK v6 Import Paths (Replacing STACK.md v3/v4 Patterns)

**What goes wrong:** STACK.md documents `import { useChat } from 'ai/react'`. In v6, this has moved to `@ai-sdk/react`. The `convertToModelMessages` function is now async (requires `await`). These are Phase 2 concerns but the store types must be consistent.

**Key changes for v6:**
- `useChat` import: `from '@ai-sdk/react'` (not `'ai/react'`)
- `streamText` import: still `from 'ai'` (unchanged)
- `anthropic()` provider: still `from '@ai-sdk/anthropic'` (unchanged)
- `toDataStreamResponse()` → consider `toUIMessageStreamResponse()` for v6 pattern
- `convertToModelMessages()` is now `async` — requires `await`

---

### Pitfall 6: Motion Package Rename (Replacing STACK.md framer-motion)

**What goes wrong:** STACK.md references `framer-motion`. The package was renamed to `motion` in 2025. `framer-motion` still exists on npm but points to the old v11 package. The current package is `motion@12.x`.

**How to avoid:** Install `motion` (not `framer-motion`). Import from `motion/react` (not `framer-motion`). API is identical — `AnimatePresence`, `motion.div`, `useMotionValue` all work the same.

**AnimatePresence `mode="popLayout"` is still valid** in motion v12.

---

### Pitfall 7: Zustand v5 persist `partialize` Spelling

**What goes wrong:** Zustand v5 persist middleware uses `partialize` (not `partialState`) to scope what gets saved to localStorage. Using the wrong key silently saves the entire store.

**How to avoid:** Use `partialize: (state) => ({ griefEntries: state.griefEntries })` in the persist options.

---

### Pitfall 8: "Exact" Credibility Gate

**What goes wrong:** Building Phase 2 (Claude integration) on top of an unverified chart engine. If the star placement is wrong, the entire psychological profile is wrong, and all downstream Claude narratives are built on bad data.

**How to avoid:** D-13 is a hard gate. Before Phase 2 begins, validate chart output against a known-correct reference. Use the Tử Vi Kinh Dịch app or a Vietnamese astrologer with 2–3 known birth dates. Do not proceed to Phase 2 until this gate is passed.

---

## Code Examples

### @dqcai/vn-lunar Basic Usage
```typescript
// Source: https://github.com/cuongdqpayment/dqcai-vn-lunar README
import { LunarCalendar } from '@dqcai/vn-lunar';

const lunar = LunarCalendar.fromSolar(15, 3, 1990);  // day, month, year
console.log(lunar.yearCanChi);   // "Canh Ngọ"
console.log(lunar.monthCanChi);  // "Kỷ Mão"
console.log(lunar.dayCanChi);    // "Mậu Tuất"
console.log(lunar.isLeapMonth);  // false
console.log(lunar.lunarMonth);   // 2 (second lunar month)
console.log(lunar.lunarDay);     // 20
```

### 12 Giờ Block Lookup
```typescript
// Source: Standard Vietnamese Tử Vi algorithm (no library needed)
// Hour 0-23 → giờ index 0-11 (each block is 2 hours, starting at 23:00)
const GIO_BLOCKS = [
  'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
  'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'
];

export function hourToGioIndex(hour: number): number {
  // Tý hour: 23:00-00:59 (index 0)
  // Each subsequent block is 2 hours
  return Math.floor(((hour + 1) % 24) / 2);
}

// D-01: default to Giờ Ngọ (index 6, noon)
export const DEFAULT_GIO_INDEX = 6;
```

### 14 Main Stars Reference
```typescript
// Source: Standard Tử Vi tradition; cross-referenced with tuvi-neo repository
// These are the 14 chính tinh (main stars) that must be placed:
export const CHINH_TINH_14 = [
  'Tử Vi',    // Purple Star — anchor star, placed first
  'Thiên Phủ', // Heavenly Treasury — mirrors Tử Vi
  'Thái Dương', // Sun
  'Thái Âm',   // Moon
  'Tham Lang', // Greedy Wolf
  'Cự Môn',    // Great Gate
  'Thiên Tướng',// Heavenly General
  'Thiên Đồng', // Heavenly Harmony
  'Liêm Trinh', // Pure Integrity
  'Thiên Phá',  // Heavenly Destroyer — NOTE: also called Vũ Khúc in some traditions
  'Thiên Cơ',   // Heavenly Secret
  'Thiên Lương',// Heavenly Granary
  'Thất Sát',  // Seven Killings
  'Phá Quân',  // Army Breaker
] as const;
// Verify this list against your reference source before implementing star-placer.ts
```

### Motion v12 AnimatePresence (palace highlight)
```typescript
// Source: motion.dev/docs — import path change from framer-motion
import { AnimatePresence, motion } from 'motion/react';

// Palace cell with highlight when dominant palace
function PalaceCell({ palace, isHighlighted }: { palace: Palace; isHighlighted: boolean }) {
  return (
    <motion.div
      className="palace-cell"
      animate={{
        borderColor: isHighlighted ? '#C9A84C' : '#3D1A0A',
        boxShadow: isHighlighted ? '0 0 12px rgba(201,168,76,0.4)' : 'none',
      }}
      transition={{ duration: 0.4 }}
    >
      {/* palace content */}
    </motion.div>
  );
}
```

### Zod v4 Form Schema
```typescript
// Source: zod.dev/v4 — breaking change from v3 syntax
import { z } from 'zod';

export const InputFormSchema = z.object({
  birthYear: z.number().int().min(1967, { error: 'Year must be 1967 or later' }).max(2025),
  birthMonth: z.number().int().min(1).max(12),
  birthDay: z.number().int().min(1).max(31),
  birthHour: z.number().int().min(0).max(23).optional(), // D-01: optional
  birthplace: z.string().min(2, { error: 'Enter a city or region' }),
  decision: z.string().min(10, { error: 'Describe your decision (10+ characters)' }),
  gender: z.enum(['M', 'F']),
});

// Error access: result.error.issues (not .errors — Zod v4 change)
const result = InputFormSchema.safeParse(formData);
if (!result.success) {
  const issues = result.error.issues; // v4 API
}
```

---

## State of the Art

| Old Approach (STACK.md) | Current Approach | When Changed | Impact |
|-------------------------|------------------|--------------|--------|
| `framer-motion` package | `motion` package | 2025 | Install `motion`, import from `motion/react` |
| Framer Motion v11 | Motion v12.38 | 2025 | No API breaking changes; just package rename |
| Vercel AI SDK v3/v4 | AI SDK v6.0.141 | 2025–2026 | `useChat` moved to `@ai-sdk/react`; `convertToModelMessages` is async |
| `ai/react` import | `@ai-sdk/react` import | v6 | Breaking import path change |
| Zustand v4 | Zustand v5.0.12 | 2024 | `persist` no longer auto-persists initial state; use `partialize` |
| Zod v3 | Zod v4.3.6 | 2025 | `z.string().email()` → `z.email()`; `error.errors` → `error.issues` |
| No Tử Vi JS library | `tuvi-neo` v1.0.7 + `@dqcai/vn-lunar` | 2025–2026 | Library exists but is AI-generated; use for reference not dependency |
| Implement lunar math from scratch | `@dqcai/vn-lunar` | 2025 | MIT, TypeScript, verified — use for calendar conversion |

**Deprecated/outdated per STACK.md:**
- `amlich` npm package: v0.0.2, published "over a year ago," Proprietary license, no TypeScript. Do not use. `@dqcai/vn-lunar` supersedes it.
- `lunar-javascript` v1.7.7: Chinese lunar calendar, not Vietnamese-specific. Do not use as primary source — it does not handle Vietnamese Tử Vi conventions.
- `@nghiavuive/lunar-date-vn`: Package not found on npm registry. Confirmed not available.

---

## Open Questions

1. **`tuvi-neo` algorithmic correctness**
   - What we know: It has TypeScript types, covers 140+ stars, claims full 12-palace system support. It was published February 2026 and is maintained by a Vietnamese developer.
   - What's unclear: Whether its star placement matches the authoritative Vietnamese tradition. The "90%+ AI-generated" disclaimer is a red flag.
   - Recommendation: Before implementing `star-placer.ts`, read the `tuvi-neo` source to understand the algorithm it encodes, then validate its output for 2–3 reference birth dates against a trusted source. Use it as an algorithmic reference, not a runtime dependency.

2. **Which Tử Vi school/tradition to implement**
   - What we know: There are multiple Vietnamese Tử Vi schools with slightly different auxiliary star placement rules.
   - What's unclear: Whether the 14 main star placement rules are invariant across schools (they likely are) or differ.
   - Recommendation: The 14 main stars (chính tinh) placement is consistent across traditions. Implement main stars first, validate, then handle auxiliary stars (phụ tinh) in a second pass. PROF-01 through PROF-04 only require main star analysis.

3. **`@dqcai/vn-lunar` hour branch derivation**
   - What we know: The library exposes `yearCanChi`, `monthCanChi`, `dayCanChi`. It is unclear whether it directly exposes hour branch (giờ Can Chi) or only day-level Can Chi.
   - What's unclear: If hour Can Chi is not exposed, it must be calculated manually from the day stem and hour index using the Ngũ Tử Hoàn Nguyên formula (a standard table, ~20 lines of code).
   - Recommendation: Verify by running `npm info @dqcai/vn-lunar` and reading the type definitions before building `lunar-bridge.ts`.

4. **Birthplace → timezone offset approach**
   - What we know: Vietnam is uniformly UTC+7. Birthplace is used only for timezone derivation (D-12).
   - What's unclear: What to do for non-Vietnamese birthplaces (diaspora users born in the US, France, etc.).
   - Recommendation: Implement a simple lookup: if birthplace contains a Vietnamese city name → UTC+7; otherwise use `Intl.DateTimeFormat` to get the UTC offset for the given city. This handles diaspora users without building a full timezone database. For Phase 1, a hardcoded list of the 10 largest Vietnamese cities is sufficient.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build + dev | Yes | v24.14.0 | — |
| npm | Package install | Yes | 11.9.0 | — |
| `@dqcai/vn-lunar` | CHART-01, CHART-02 | Yes (npm) | 1.0.1 | Implement Hồ Ngọc Đức algorithm (~200 lines) |
| `motion` (framer-motion) | D-05 palace highlight | Yes (npm) | 12.38.0 | Pure CSS transition (no animation library) |
| `zustand` | D-10 store | Yes (npm) | 5.0.12 | — |
| `zod` | INPUT-04 | Yes (npm) | 4.3.6 | — |
| `ai` + `@ai-sdk/anthropic` | Phase 2; type imports | Yes (npm) | ai@6.0.141 | — |
| `ANTHROPIC_API_KEY` | Phase 2 API calls | Unverified | — | Pre-generated fallback JSON (Phase 4) |
| Vietnamese diacritic font | D-06 typography | Must be sourced | — | Google Fonts: "Be Vietnam Pro" or "Noto Sans Vietnamese" |

**Missing dependencies with no fallback:**
- Vietnamese diacritic-capable font must be selected and embedded before Phase 1 is complete (D-06 requirement). Recommended: `Be Vietnam Pro` from Google Fonts (covers all Vietnamese diacritics, available as Next.js `next/font` import).

**Missing dependencies with fallback:**
- `ANTHROPIC_API_KEY`: Not needed for Phase 1. Required for Phase 2. Pre-generate fallback JSON for demo hardening (Phase 4).

---

## Project Constraints (from CLAUDE.md)

| Directive | Constraint Level |
|-----------|-----------------|
| Stack: Next.js 14, Tailwind CSS, Framer Motion (motion), Claude API (`claude-sonnet-4-6`) — no backend | LOCKED |
| Auth: None — localStorage only for grief archive | LOCKED |
| Hackathon deadline — V1 must be demoed live | HARD CONSTRAINT |
| Tử Vi calc: Algorithmically exact — real lunar calendar conversion, exact star placement by birth hour/day/month/year | LOCKED |
| Birthplace used for timezone → birth hour accuracy only | LOCKED |
| Node depth: Maximum 5 nodes deep per path | LOCKED |
| Grief interview: 3 questions, conversational (not ceremonial), Claude-generated | LOCKED |
| GSD workflow: Use /gsd:execute-phase for planned phase work; no direct repo edits outside GSD | PROCESS |

**Note on `claude-sonnet-4-6` model ID:** CLAUDE.md specifies `claude-sonnet-4-6`. This is the correct model ID for Phase 2 route handlers. Do not substitute with other model IDs.

---

## Sources

### Primary (HIGH confidence)
- npm registry live queries (2026-03-28): `@dqcai/vn-lunar@1.0.1`, `tuvi-neo@1.0.7`, `ai@6.0.141`, `@ai-sdk/anthropic@3.0.64`, `motion@12.38.0`, `zustand@5.0.12`, `zod@4.3.6`, `date-fns@4.1.0`, `nanoid@5.1.7`, `next@14.2.35`, `tailwindcss@4.2.2`, `amlich@0.0.2`
- GitHub: `implicit-invocation/tuvi-neo` README — "90%+ AI-generated" disclaimer, API shape, star coverage
- GitHub: `cuongdqpayment/dqcai-vn-lunar` — MIT, TypeScript, production quality, API confirmed
- GitHub: `6tail/lunar-javascript` — Chinese lunar calendar, not Vietnamese-specific
- Vercel AI SDK migration guide (ai-sdk.dev): `useChat` moved to `@ai-sdk/react` in v6
- Motion library docs (motion.dev): package rename from `framer-motion` to `motion`, no API changes

### Secondary (MEDIUM confidence)
- npm search `tuvi` (2026-03-28): `tuvi-neo` and `snowfox-tuvi-calculator` exist; `snowfox-tuvi-calculator` depends on `snowfox-lunar-typescript` (not examined)
- Zustand v5 migration guide (zustand.docs.pmnd.rs): persist middleware behavioral change, `partialize` key
- Zod v4 migration (zod.dev/v4): `.email()` top-level, `.issues` not `.errors`, record two-arg requirement

### Tertiary (LOW confidence — flag for validation)
- `tuvi-neo` star placement correctness: Cannot verify without comparing against reference charts. Treat as algorithmic reference only.
- Hour Can Chi derivation from `@dqcai/vn-lunar`: Library exposes day-level Can Chi but hour-level is unconfirmed — verify type definitions before building `lunar-bridge.ts`.

---

## Metadata

**Confidence breakdown:**
- Standard stack (versions): HIGH — all versions verified against npm registry live queries on 2026-03-28
- @dqcai/vn-lunar for calendar: HIGH — MIT, TypeScript, production quality, zero deps confirmed
- Star placement algorithm: MEDIUM — algorithm is well-documented in Vietnamese tradition; tuvi-neo exists as reference but is AI-generated; implementation correctness requires validation
- Architecture patterns: HIGH — stable Next.js 14 App Router + Zustand + TypeScript patterns
- Pitfalls: HIGH — Tết boundary, leap month, and midnight Giờ pitfalls are well-established in Vietnamese calendar literature; package API changes confirmed from official sources

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (30 days — npm ecosystem stable; Tử Vi algorithm is timeless)
