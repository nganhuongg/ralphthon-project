# Phase 4: UI Polish + Demo Hardening - Research

**Researched:** 2026-03-28
**Domain:** Framer Motion (motion v12) SVG path animation, Tailwind v3 theming, Next.js 14 App Router URL param handling, fallback JSON pattern, demo hardening
**Confidence:** HIGH

---

## Summary

Phase 4 is a visual completion and reliability phase for a fully functional app. Phases 1–3 are complete: the Tử Vi engine, Claude streaming, grief interview, and grief archive are all wired. The current codebase has a minimal dark-lacquer base (bg `#1A0A00`, text `#F5ECD7`) with all Tailwind color tokens already defined (`verse-red`, `verse-gold`, `verse-ash`, etc.) but no paper texture, no SVG branch connectors, no path-length animations, and no demo hardening.

The key technical challenges are: (1) incense-smoke SVG path animation using `motion`'s `pathLength` prop — confirmed present in the installed `motion@12.38.0` bundle; (2) paper texture background applied globally via `globals.css` using a CSS noise/grain pattern or an inline SVG data URI; (3) `?reset` URL parameter handled in a Next.js 14 App Router `'use client'` page via `useSearchParams` from `next/navigation`; (4) API fallback using a static JSON file in `public/` that the client fetches when the API route errors or times out.

The aesthetic references — Vietnamese lacquerware — are red-on-black with gold accents, reinforced by the typography (Be Vietnam Pro, already loaded with Vietnamese subset), and a subtle noise/paper texture. The Tailwind tokens (`verse-red`, `verse-gold`, `verse-ash`) are already configured; this phase mostly applies them consistently and adds the missing visual layers.

**Primary recommendation:** Apply visual changes through Tailwind utility classes on existing components. Build the SVG connector overlay inside PathTreeView as a new `<PathConnectors />` subcomponent using `motion.path` with `pathLength` 0→1 animation. For demo hardening, use a static `public/fallback-demo.json` file and a `try/catch` timeout wrapper in PathTreeView's `handleExpand`.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-01 | Color palette: deep red (#8B1A1A), gold (#C9A84C), black — Vietnamese lacquerware | All tokens already in `tailwind.config.ts`; apply consistently across all components. |
| UI-02 | Paper texture background (CSS or image overlay) | CSS noise via SVG filter or `background-image: url("data:image/svg+xml,...")` in `globals.css`; no extra package needed. |
| UI-03 | Path tree renders as an altar scroll unrolling downward | `max-w-5xl` container + inner vertical scroll metaphor; PathTreeView top border styled as scroll header with gold rule. |
| UI-04 | Node branching animates like incense smoke splitting (Framer Motion) | `motion.path` with `pathLength` 0→1 confirmed available in motion@12.38.0; SVG overlay inside PathTreeView. |
| UI-05 | Abandoned paths fade to ash color; active chosen path remains gold | PathColumn already applies `opacity-40` on abandon; needs full color swap from `verse-gold` to `verse-ash` classes on abandoned state. |
| UI-06 | Typography uses Vietnamese diacritics and classical numeral styling | Be Vietnam Pro already loaded with `['latin', 'vietnamese']` subset; add `tabular-nums` Tailwind class for numerals. |
| UI-07 | UI tone is tender and grounded — not mystical, not gamified | Copy/tone pass on all button labels and placeholder text; currently "Reveal path" / "Go deeper" / "Abandon" — review and soften. |
| DEMO-01 | Pre-generated fallback JSON exists for a known demo birthday | Static JSON file in `public/fallback-demo.json`; PathTreeView catches API error and `fetch('/fallback-demo.json')`. |
| DEMO-02 | `?reset` clears session state and returns to input screen | Next.js 14 `useSearchParams` in `'use client'` page.tsx; detect `reset` param, call `useVerseStore.resetChart()`, replace URL. |
| DEMO-03 | App tested at 1280×800 resolution | Manual browser resize + DevTools device emulation; no code change, purely verification task. |
| DEMO-04 | Demo birthday vetted to produce compelling psychological profile | Calculate chart for a specific birthday, inspect profile output, iterate until profile has strong archetypal contrast. |
</phase_requirements>

---

## Standard Stack

### Core (already installed — no new packages required)

| Library | Installed Version | Purpose | Notes |
|---------|------------------|---------|-------|
| `motion` (Framer Motion) | 12.38.0 | SVG path animation, `AnimatePresence`, layout | `pathLength` confirmed in bundle |
| `next` | 14.2.35 | `useSearchParams`, App Router | `useSearchParams` requires `Suspense` boundary |
| `tailwindcss` | 3.4.17 | All styling — tokens already defined | No new config needed |
| `zustand` | 5.0.12 | `resetChart()` for `?reset` flow | Already has `resetChart` action |

### Supporting

| Library | Purpose | Notes |
|---------|---------|-------|
| None new required | — | All needed libraries already installed |

**Installation:**
No new packages needed. Phase 4 is entirely within the existing dependency set.

**Version verification (already installed, verified above):**
- `motion`: 12.38.0 (confirmed via `node_modules/motion/package.json`)
- `next`: 14.2.35
- `tailwindcss`: 3.4.17
- `zustand`: 5.0.12

---

## Architecture Patterns

### Recommended Structure (additions only — no new directories)

```
public/
└── fallback-demo.json       # Static fallback for DEMO-01

components/
├── PathTreeView.tsx          # Add <PathConnectors /> subcomponent, fallback fetch
├── PathColumn.tsx            # Ash-state styling, visual depth dots polish
├── GriefInterviewOverlay.tsx # Minor polish (already well-styled)
└── GriefArchiveSidebar.tsx   # Minor polish

app/
├── globals.css               # Add paper texture, scroll container CSS
├── layout.tsx                # Add paper texture class to body; altar scroll max-width
└── page.tsx                  # Add useSearchParams for ?reset
```

### Pattern 1: SVG Path Animation for Incense Smoke Branches

**What:** A `<PathConnectors />` subcomponent rendered inside PathTreeView, overlaid on the three columns using `position: absolute` + `pointer-events: none`. SVG `<path>` elements connect the root header to each column, animating `pathLength` from 0 to 1 when paths become active.

**When to use:** On initial mount when paths first appear; re-animate when a new node commits to the store.

**Example (motion v12 pathLength pattern):**
```tsx
// Source: motion@12.38.0 — pathLength is a first-class SVG prop
import { motion } from 'motion/react';

function BranchLine({ isActive }: { isActive: boolean }) {
  return (
    <motion.path
      d="M 150 0 Q 80 40 0 80"   // Cubic bezier "smoke" curve
      stroke="#C9A84C"
      strokeWidth={1}
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{
        pathLength: isActive ? 1 : 0,
        opacity: isActive ? 0.6 : 0,
      }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    />
  );
}
```

**Practical note:** The SVG must be absolutely positioned over the column grid. Use a `ref` on the grid wrapper to get its bounding box for SVG coordinate calculation — or use fixed aspect-ratio coordinates for the 3-column layout (columns are always equal-width within `max-w-5xl`).

### Pattern 2: Paper Texture Background (CSS only — no image file needed)

**What:** An SVG `feTurbulence` noise filter applied as a `background-image` data URI in `globals.css`, or a pseudo-element overlay with `opacity`.

**Simplest verified approach (HIGH confidence — pure CSS):**
```css
/* app/globals.css */
body {
  background-color: #1A0A00;
  /* Subtle grain using CSS background SVG — no file needed */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
}
```

**Alternative (if grain effect too subtle):** A CSS `::before` pseudo-element on `body` or the main `<main>` wrapper with `background: repeating-linear-gradient(...)` for a paper-like weave texture — no external images, no new packages.

### Pattern 3: `?reset` URL Parameter with `useSearchParams`

**What:** Next.js 14 App Router pattern — detect `?reset` on mount, call `resetChart()`, remove the param from URL.

**Critical note:** `useSearchParams()` in Next.js 14 App Router requires the component to be wrapped in a `<Suspense>` boundary, or Next.js will throw an error during static rendering. The `page.tsx` is already `'use client'` which avoids the server-side issue, but the component using `useSearchParams` must be a separate child component wrapped in `Suspense`.

**Pattern:**
```tsx
// app/page.tsx — wrap the reset handler in a Suspense boundary
import { Suspense } from 'react';

function ResetHandler() {
  'use client';
  const searchParams = useSearchParams();
  const router = useRouter();
  const resetChart = useVerseStore((s) => s.resetChart);

  useEffect(() => {
    if (searchParams.has('reset')) {
      resetChart();
      router.replace('/');  // strip ?reset from URL
    }
  }, [searchParams, resetChart, router]);

  return null;
}

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <ResetHandler />
      </Suspense>
      {/* ... rest of page */}
    </>
  );
}
```

### Pattern 4: Fallback JSON for API Failure (DEMO-01)

**What:** A static JSON file at `public/fallback-demo.json` containing pre-generated path node content. When `useCompletion` throws or times out, PathTreeView catches and loads from the static file.

**Fallback JSON shape** (mirrors what the streaming API returns per-call — one string per node, not all nodes at once):

The API streams a single text completion per call. The fallback needs all nodes pre-generated (up to 5 per path). The store receives them one by one via `setPathNode`. The fallback can inject all 3 root nodes immediately by calling `setPathNode` directly without streaming.

**Fallback JSON schema:**
```json
{
  "version": 1,
  "demoBirthday": "YYYY-MM-DD",
  "paths": {
    "duty": ["node 1 content", "node 2 content", "node 3 content", "node 4 content", "node 5 content"],
    "desire": ["node 1 content", ...],
    "transformation": ["node 1 content", ...]
  }
}
```

**Trigger condition:** In PathTreeView, wrap the `useCompletion.complete()` call in a `try/catch`. Also set a timeout (e.g., 8 seconds) — if the stream hasn't produced content within that window, fall back. The simplest approach: use `Promise.race` with a `setTimeout` reject.

**Fallback loading pattern in PathTreeView:**
```tsx
async function handleExpand(pathId: PathId) {
  const completion = completions[pathId];
  if (!completion) return;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 8000)
    );
    await Promise.race([
      completion.complete('', { body: buildBody(pathId) }),
      timeoutPromise,
    ]);
  } catch {
    // Load fallback for this path
    await loadFallbackNode(pathId);
  }
}
```

**Note:** `useCompletion.complete()` returns a `Promise<string>` (the full completion). The timeout race is safe here.

### Pattern 5: Ash-State Styling on Abandoned Paths

**What:** PathColumn currently applies `opacity-40` to the entire column when abandoned. Phase 4 requires the gold elements to visually shift to ash (`verse-ash`) rather than just dimming.

**Current state:** `className={\`flex flex-col \${pathState.isAbandoned ? 'opacity-40' : ''}\`}`

**Improved approach:** Use conditional Tailwind classes on individual elements:
- Column header text: `isAbandoned ? 'text-verse-ash/50' : 'text-verse-gold/70'`
- Depth dots: `isAbandoned ? 'text-verse-ash' : 'text-verse-gold'`
- Node border-left: `isAbandoned ? 'border-verse-ash/20' : 'border-verse-gold/30'`
- Animate the transition with `transition-colors duration-700` — the motion library handles this as a CSS transition, no need for `framer-motion` wrapper on the text.

### Pattern 6: Altar Scroll Layout

**What:** The `layout.tsx` `<main>` currently uses `max-w-5xl mx-auto px-4 py-8`. The altar scroll metaphor means the content should appear as a vertical scroll unrolling — a top decorative border (gold rule), a parchment-like container, and the content flowing downward.

**Implementation:** CSS additions to `globals.css` for a `scroll-container` class, or direct Tailwind classes on `layout.tsx`. Key elements:
- Top border: a 1px gold line below the header
- Body: the paper texture (from Pattern 2)
- Container sides: subtle side borders or box-shadow in `verse-red/20`

### Anti-Patterns to Avoid

- **Do not use `reactflow` for SVG connectors:** Confirmed out of scope in STACK.md. Manual SVG with `motion.path` is correct.
- **Do not use `framer-motion` package:** Project uses the `motion` package (`motion/react` import). Confirmed in existing code.
- **Do not make `page.tsx` a server component:** It is already `'use client'`; adding `useSearchParams` requires keeping it client-side.
- **Do not put `useSearchParams` at the top level of a page exported component without Suspense:** This triggers a Next.js 14 build error. Use the separate child pattern (Pattern 3).
- **Do not try to animate `pathLength` on HTML elements:** `pathLength` only works on SVG `<path>` elements. The connector lines MUST be SVG.
- **Do not import from `framer-motion`:** The installed package is `motion`. All existing code uses `import { motion, AnimatePresence } from 'motion/react'`. Stay consistent.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG path drawing animation | Custom CSS animation with `stroke-dashoffset` | `motion.path` with `pathLength` prop | motion handles `pathLength` → `stroke-dasharray` normalization automatically |
| Paper texture | External image file / PNG sprite | CSS SVG data URI in `globals.css` | Zero network requests, no asset pipeline, works offline |
| URL param reset | Manual `window.location.search` parsing | `useSearchParams()` from `next/navigation` | Built into Next.js 14; handles SSR, hydration, and router state correctly |
| API fallback | A second API route that returns static data | Static JSON in `public/` fetched with `fetch()` | Zero server cost; works even if the whole server route crashes; simpler |
| Ash color animation | `framer-motion` animation of color values | Tailwind `transition-colors` CSS transition | CSS transitions handle color interpolation; no JS needed for this |

**Key insight:** This phase is 90% applying existing tokens and patterns. The only genuinely new technical surface is SVG `pathLength` animation and the `useSearchParams` + Suspense pattern.

---

## Runtime State Inventory

> Omitted — this is a UI polish and demo hardening phase, not a rename/refactor/migration phase. No runtime state renaming occurs.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `motion` npm package | UI-04 (SVG animation) | Yes | 12.38.0 | — |
| `next` App Router | DEMO-02 (?reset) | Yes | 14.2.35 | — |
| Browser DevTools (1280×800) | DEMO-03 | Yes | N/A (manual) | — |
| Claude API key (`.env.local`) | DEMO-01 fallback is the safety net | Assumed present | — | `public/fallback-demo.json` |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:**
- Claude API: if unavailable during demo, DEMO-01 fallback JSON is the mitigation.

---

## Common Pitfalls

### Pitfall 1: `useSearchParams` Without Suspense Boundary in Next.js 14

**What goes wrong:** Adding `useSearchParams()` directly to the `page.tsx` default export causes a Next.js build error: "useSearchParams() should be wrapped in a suspense boundary".
**Why it happens:** Next.js 14 App Router attempts to statically render pages at build time; `useSearchParams` opts out of static rendering, and Next.js requires the developer to explicitly scope that opt-out.
**How to avoid:** Extract the reset logic into a separate small `<ResetHandler />` component and wrap it in `<Suspense fallback={null}>` in the parent page.
**Warning signs:** Build error mentioning `useSearchParams` and suspense.

### Pitfall 2: SVG Coordinates Mismatched with DOM Layout

**What goes wrong:** The SVG connector overlay uses hardcoded coordinates that don't match the actual pixel positions of the three columns at different viewport widths.
**Why it happens:** The SVG `viewBox` coordinate system is separate from the DOM layout. If the SVG doesn't use `preserveAspectRatio="none"` and match its `width`/`height` to the container, paths will appear offset.
**How to avoid:** Use `ref` + `getBoundingClientRect()` on the column headers to compute connector endpoints dynamically, OR constrain the connector SVG to a fixed aspect ratio that matches the grid's known proportions (three equal columns, `max-w-5xl` container). A simpler option: use CSS-only decorative lines (border-top + border-left with `border-verse-gold/20`) instead of SVG if coordinate complexity becomes a blocker.
**Warning signs:** Lines appear in wrong positions or outside the visible columns.

### Pitfall 3: `motion.path` Coordinate System

**What goes wrong:** Using pixel coordinates for SVG `d` attribute that assume a fixed screen size breaks on any viewport resize.
**Why it happens:** SVG `viewBox` and the `d` attribute path coordinates are in SVG units, not CSS pixels, unless the SVG element has explicit `width` and `height` that match its container.
**How to avoid:** Set SVG `width="100%"` and compute a fixed `height` for the connector region. Use percentage-based `d` values where possible, or use `viewBox="0 0 900 80"` (matching max-w-5xl approximate width) with `preserveAspectRatio="none"`.
**Warning signs:** Connectors look correct at one viewport width but break at others.

### Pitfall 4: Fallback JSON Bypasses Streaming State

**What goes wrong:** The fallback JSON injection calls `setPathNode` directly, but the streaming UI in PathColumn shows a streaming cursor and `isStreaming: true` state that never clears.
**Why it happens:** PathColumn reads `isStreaming` from the `useCompletion` hook state, not the Zustand store. If `useCompletion` errored and never set `isLoading: false` cleanly, the UI can get stuck showing a spinner.
**How to avoid:** After loading fallback nodes, explicitly call `useCompletion.stop()` or set a local `isFallback` flag in PathTreeView that short-circuits the `isStreaming` prop passed to PathColumn.
**Warning signs:** Streaming cursor still visible after fallback nodes have been injected.

### Pitfall 5: `?reset` Removes All State Including Grief Archive

**What goes wrong:** `resetChart()` in the Zustand store clears `chart`, `paths`, `activeInterview`, and `birthInput` — but NOT `griefEntries` (which is persisted to localStorage separately). This is correct behavior, but if the demo expects a fully clean slate (no grief archive visible from a previous run), the presenter must also clear localStorage or call `clearGriefArchive()`.
**Why it happens:** `partialize` only persists `griefEntries`; `resetChart()` intentionally does not clear it (by design from Phase 1 store architecture).
**How to avoid:** Add an optional full-reset variant that ALSO calls `clearGriefArchive()` — triggered by `?reset=full` vs. `?reset` alone, or a `?hardreset` param. Alternatively, `?reset` clears everything including grief archive for demo simplicity.
**Warning signs:** Opening `?reset` during a demo leaves grief archive entries visible from a prior session — visible to the audience.

### Pitfall 6: Demo Birthday Produces Weak Profile

**What goes wrong:** The selected demo birthday has a Tử Vi chart where the dominant palace and risk star produce generic or uninspiring profile prose, making the three archetypal paths feel indistinct.
**Why it happens:** The profile extractor uses fixed lookup tables keyed by the primary star in Mệnh and Quan Lộc palaces. Some star combinations produce short, less evocative prose.
**How to avoid:** Calculate charts for multiple candidate birthdays (e.g., someone born in 1985, 1990, 1992) and inspect `profile.relationalPattern`, `profile.ambitionStructure`, and `profile.riskStarName`. Choose the birthday where these fields have maximal contrast and emotional resonance. The profile-extractor lookup table shows which star names produce the richest text (e.g., `Phá Quân`, `Tham Lang`, `Cự Môn` have more evocative prose than `Thiên Đồng`).
**Warning signs:** Profile text is one of the fallback defaults ("A complex interior life shapes...") rather than a named star's specific pattern.

---

## Code Examples

Verified patterns from installed versions:

### motion v12 pathLength SVG animation (confirmed in bundle)
```tsx
// Source: motion@12.38.0 motion.dev.js — pathLength is natively supported
import { motion } from 'motion/react';

// SVG branch connector animating from 0 to 1 on mount
<svg width="100%" height="80" viewBox="0 0 900 80" preserveAspectRatio="none">
  <motion.path
    d="M 300 0 C 300 40, 150 40, 0 80"
    stroke="#C9A84C"
    strokeWidth="1"
    fill="none"
    strokeOpacity="0.4"
    strokeLinecap="round"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
  />
</svg>
```

### useSearchParams + Suspense in Next.js 14 App Router (HIGH confidence)
```tsx
// app/page.tsx
'use client';
import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useVerseStore } from '@/lib/store';

function ResetHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resetChart = useVerseStore((s) => s.resetChart);
  const clearGriefArchive = useVerseStore((s) => s.clearGriefArchive);

  useEffect(() => {
    if (searchParams.has('reset')) {
      resetChart();
      clearGriefArchive(); // full clean slate for demo
      router.replace('/');
    }
  }, [searchParams, resetChart, clearGriefArchive, router]);

  return null;
}

// In the Home component JSX:
// <Suspense fallback={null}><ResetHandler /></Suspense>
```

### Zustand store `resetChart` (already implemented — reference only)
```ts
// lib/store.ts — resetChart() already exists
resetChart: () =>
  set({
    birthInput: null, chart: null, profile: null, isCalculating: false,
    paths: { duty: idlePathState('duty'), desire: idlePathState('desire'),
              transformation: idlePathState('transformation') },
    activeInterview: { pathId: null, questionIndex: 0, answers: [] },
  }),
// Note: does NOT clear griefEntries — add clearGriefArchive() call separately
```

### Tailwind ash-state conditional classes
```tsx
// PathColumn.tsx — replace flat opacity-40 with targeted color shifts
const isAbandoned = pathState.isAbandoned;

<h2 className={`text-xs font-light tracking-[0.4em] uppercase mb-4 transition-colors duration-700
  ${isAbandoned ? 'text-verse-ash/50' : 'text-verse-gold/70'}`}>
  {label}
</h2>

<span className={`transition-colors duration-500
  ${i < currentDepth
    ? (isAbandoned ? 'text-verse-ash/60' : 'text-verse-gold')
    : 'text-verse-paper/30'}`}>
  {i < currentDepth ? '●' : '○'}
</span>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package import | `motion` package (`motion/react`) | Framer Motion v11→v12 rebrand | All imports use `from 'motion/react'` — already correct in codebase |
| `useSearchParams` without Suspense | Wrapped in `<Suspense fallback={null}>` | Next.js 13.4+ (App Router) | Required to avoid build error; well-documented |
| `pathLength` requires special setup | Native first-class SVG prop in `motion` | Always (since Framer Motion v4+) | Use directly on `motion.path`, no manual `stroke-dasharray` math needed |

**Deprecated/outdated:**
- `AnimateSharedLayout`: Replaced by `LayoutGroup` in motion v10+. Not needed for this phase.
- `framer-motion` package name: Rebranded to `motion`. Already correct in codebase.

---

## Open Questions

1. **Exact SVG connector curve geometry**
   - What we know: Three equal columns in a `grid-cols-3` layout inside `max-w-5xl` (960px). Each column is ~300px wide. The connector should originate from a center point above the grid and curve to each column header.
   - What's unclear: Whether to use a `ref`-based dynamic calculation or hardcoded `viewBox` coordinates for the connectors.
   - Recommendation: Use hardcoded `viewBox="0 0 960 60"` with the three endpoint x-values at `160`, `480`, `800` (center of each third). This is safe for the fixed demo viewport (1280×800) and sidesteps the ref complexity.

2. **Optimal demo birthday for strong profile**
   - What we know: The profile extractor maps Mệnh palace star → relational pattern, Quan Lộc palace star → ambition structure. Stars like `Phá Quân` and `Tham Lang` produce more evocative text.
   - What's unclear: Which specific birthday (day/month/year + gender) produces the best combination.
   - Recommendation: DEMO-04 is a verification task. The plan should include a dedicated task to run the calculateChart function against several candidate birthdays and select the one with the strongest profile. Suggested candidates: 1985-09-15 (M), 1990-03-21 (F), 1988-07-07 (M) — to be verified during execution.

3. **`useCompletion.complete()` return type for timeout race**
   - What we know: `useCompletion` is from `@ai-sdk/react`. The `complete()` method returns a `Promise<string>`.
   - What's unclear: Whether `Promise.race` with a `setTimeout` reject properly interrupts an in-flight streaming connection or just races the Promise resolution.
   - Recommendation: `Promise.race` with timeout is sufficient for the demo fallback — the timeout rejects the awaited promise and triggers the catch block. The underlying stream may continue but the UI has already loaded the fallback. Use `completion.stop()` after timeout to clean up the streaming state.

---

## Validation Architecture

> Skipped — `workflow.nyquist_validation` is `false` in `.planning/config.json`.

---

## Project Constraints (from CLAUDE.md)

The following directives from `CLAUDE.md` apply to this phase:

- **Stack locked:** Next.js 14, Tailwind CSS v3, Framer Motion (`motion` package v12), Claude API `claude-sonnet-4-6` — no backend
- **No auth, no backend:** localStorage only. Demo hardening must not introduce any server-side state.
- **No reactflow / no D3:** Confirmed in STACK.md. SVG connectors are manual with `motion.path`.
- **No Tailwind v4:** v3.4.x confirmed installed and in use.
- **No moment.js:** Not applicable to this phase; `date-fns` already in use.
- **No Prisma / DB ORM:** Not applicable to this phase.
- **`motion` package, NOT `framer-motion`:** All existing code uses `from 'motion/react'`. Phase 4 must maintain this import pattern.
- **Tử Vi calculation is algorithmically exact:** DEMO-04 (demo birthday selection) must not compromise this — the demo birthday must be calculated through the real engine, not stubbed.
- **GSD workflow:** All edits made through GSD workflow, not direct repo edits.

---

## Sources

### Primary (HIGH confidence)
- `node_modules/motion/dist/motion.dev.js` — verified `pathLength` SVG prop support confirmed in installed bundle (12.38.0)
- `node_modules/motion/react` exports — verified `useMotionValue`, `useAnimate`, `motion`, `AnimatePresence` all present
- `lib/store.ts` — `resetChart()` already implemented, `clearGriefArchive()` already present
- `tailwind.config.ts` — all `verse-*` color tokens already defined
- `app/layout.tsx` — Be Vietnam Pro font with Vietnamese subset already loaded
- `components/PathColumn.tsx` — current abandoned-state styling (flat `opacity-40`) identified for improvement
- `package.json` — dependency versions all verified

### Secondary (MEDIUM confidence)
- Next.js 14 App Router documentation pattern for `useSearchParams` + Suspense — well-established since Next.js 13.4; confirmed by Next.js 14.2.35 being installed
- CSS SVG data URI noise texture pattern — standard technique, widely documented, no library required

### Tertiary (LOW confidence)
- Demo birthday selection candidates (1985-09-15, 1990-03-21, 1988-07-07) — suggestions from reasoning about lunar calendar distribution; must be verified by actually running the chart calculation during execution

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed, versions verified directly from node_modules
- Architecture patterns: HIGH — SVG pathLength confirmed in bundle, useSearchParams pattern is Next.js 14 official
- Pitfalls: HIGH — most identified directly from reading existing codebase code and known Next.js 14 behaviors
- Demo birthday selection: LOW — requires runtime verification during execution

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable libraries; motion and Next.js APIs are stable)
