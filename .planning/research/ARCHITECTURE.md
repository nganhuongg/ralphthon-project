# Architecture Research: Verse

**Domain:** Vietnamese Tử Vi astrology life path explorer
**Researched:** 2026-03-28
**Confidence:** MEDIUM-HIGH (Next.js/React patterns HIGH; Tử Vi algorithm specifics MEDIUM due to limited JS library ecosystem verification)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Browser (Client)                                │
│                                                                          │
│  ┌─────────────┐    ┌──────────────────┐    ┌────────────────────────┐  │
│  │  InputForm  │───▶│  TuViEngine      │───▶│  SessionStore          │  │
│  │  (birthday, │    │  (pure JS calc)  │    │  (Zustand + localStorage│  │
│  │   decision) │    └──────────────────┘    │   bridge)              │  │
│  └─────────────┘             │               └────────────┬───────────┘  │
│                               │ profile                    │              │
│                               ▼                            │              │
│                    ┌──────────────────┐                    │              │
│                    │  ChartDisplay    │                    │              │
│                    │  (12 palaces,    │                    │              │
│                    │   star summary)  │                    │              │
│                    └──────────────────┘                    │              │
│                               │ profile                    │              │
│                               ▼                            │              │
│                    ┌──────────────────┐                    │              │
│                    │ PsychProfile     │                    │              │
│                    │ (4 dimensions)   │                    │              │
│                    └──────────────────┘                    │              │
│                               │ profile + decision         │              │
│                               ▼                            │              │
│              ┌────────────────────────────────┐            │              │
│              │         PathForest              │◀───────────┘              │
│              │  (3 PathTree components)        │  grief context            │
│              │   ┌──────┐ ┌──────┐ ┌──────┐  │                           │
│              │   │ Duty │ │Desire│ │Trans.│  │                           │
│              │   │ Tree │ │ Tree │ │ Tree │  │                           │
│              │   └──────┘ └──────┘ └──────┘  │                           │
│              └────────────────────────────────┘                           │
│                               │ abandon signal                             │
│                               ▼                                            │
│                    ┌──────────────────┐                                    │
│                    │  GriefInterview  │                                    │
│                    │  (overlay, 3 Qs) │                                    │
│                    └──────────────────┘                                    │
│                               │ answers                                    │
│                               ▼                                            │
│                    ┌──────────────────┐                                    │
│                    │  GriefArchive    │                                    │
│                    │  (drawer/panel)  │                                    │
│                    └──────────────────┘                                    │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                               │ HTTP POST (streaming)
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              Next.js Route Handlers (app/api/)                           │
│                                                                          │
│  /api/generate-paths   — initial 3 path roots from profile               │
│  /api/generate-node    — next node in a given path                       │
│  /api/grief-interview  — stream grief interview question/response        │
└─────────────────────────────────────────────────────────────────────────┘
                               │ fetch (SSE stream)
                               ▼
                      Anthropic Claude API
                      (claude-sonnet-4-6)
```

---

## Component Map

### 1. TuViEngine (`lib/tuvi/`)

**Type:** Pure TypeScript module. No React. No side effects.

**Inputs:**
```typescript
interface BirthInput {
  solarDate: { year: number; month: number; day: number };
  hour: number;         // 0-23, derived from birthplace timezone
  gender: 'M' | 'F';   // needed for palace arrangement
}
```

**Outputs:**
```typescript
interface TuViChart {
  lunarDate: { year: number; month: number; day: number; isLeap: boolean };
  heavenlyStem: string;     // Can (甲)...Quy (癸)
  earthlyBranch: string;    // Ty (子)...Hoi (亥)
  destinyPalace: number;    // 1-12 index
  bodyPalace: number;
  palaces: Palace[12];      // each palace has assigned stars
  dominantStar: string;
  dominantPalace: PalaceName;
  riskStar: string | null;
  relationalPattern: string;
  ambitionStructure: string;
}

interface Palace {
  name: PalaceName;         // Menh, Phu Mau, Phuc Duc...
  heavenlyStem: string;
  earthlyBranch: string;
  mainStars: Star[];        // subset of the 14 main stars
  minorStars: Star[];
  isDestinyPalace: boolean;
  isBodyPalace: boolean;
}
```

**Internal sub-modules:**
- `lib/tuvi/lunar-converter.ts` — solar→lunar calendar conversion (Vietnamese lunar rules, intercalary months)
- `lib/tuvi/palace-builder.ts` — assigns heavenly stems and earthly branches to 12 palaces
- `lib/tuvi/star-placer.ts` — places the 14 main stars (Tu Vi, Thien Co, Thai Duong, Vu Khuc, Thien Dong, Liem Trinh, Thien Phu, Thai Am, Tham Lang, Cu Mon, Thien Tuong, Thien Luong, That Sat, Pha Quan) and key minor stars
- `lib/tuvi/profile-extractor.ts` — reads placed chart, returns the 4-dimensional psychological profile

**Communicates with:** Nothing. Called once by the InputForm submit handler. Returns a pure data structure.

**Note on complexity:** The lunar calendar conversion is the hardest part. Vietnamese Tử Vi uses the Chinese lunisolar calendar with intercalary months. The palace/star placement rules are well-documented in traditional texts but require careful implementation. MEDIUM confidence on available JS libraries — may need to implement from scratch or adapt an existing Chinese lunar calendar library (like `lunar-javascript`).

---

### 2. ChartDisplay (`components/ChartDisplay.tsx`)

**Type:** Pure display component. Receives chart data, renders it.

**Inputs:** `TuViChart`

**Outputs:** Nothing (display only)

**Responsibility:** Show the 12-palace ring layout with star names. This is the "proof of work" that grounds the experience — judges and users need to see that a real chart was computed. Does not need to be interactive in V1.

**Communicates with:** Receives props from the session store consumer.

---

### 3. PsychProfile (`components/PsychProfile.tsx`)

**Type:** Display component.

**Inputs:** `TuViChart` (reads dominantPalace, dominantStar, riskStar, relationalPattern, ambitionStructure)

**Outputs:** Nothing (display only; prose-style)

**Responsibility:** Translate chart data into human-readable psychological framing. E.g. "Your Destiny Palace is in the sign of the Horse, ruled by Vu Khuc. You build by force of will, not patience." This prose does NOT call Claude — it is deterministic from the chart. Pre-written templates with star/palace substitutions.

**Communicates with:** Receives props. Emits nothing. Downstream consumers (PathForest) read from store, not from this component.

---

### 4. PathForest (`components/PathForest.tsx`)

**Type:** Orchestration component. Manages 3 PathTree instances and the grief influence context.

**Inputs from store:** `psychProfile`, `decision`, `griefContext` (accumulated grief from abandoned paths)

**Outputs to store:** Path abandonment signals

**Responsibility:**
- On mount, triggers `POST /api/generate-paths` with profile + decision → gets 3 path root nodes streamed back
- Renders 3 PathTree components side-by-side
- Passes grief context down to each tree as a narrative modifier (passed to API on subsequent node generation)
- When a path is abandoned, receives the signal, freezes that PathTree visually, triggers GriefInterview overlay

**Communicates with:** Route handler `/api/generate-paths`, store (read grief context, write abandonment state), GriefInterview (via store flag).

---

### 5. PathTree (`components/PathTree.tsx`)

**Type:** Interactive tree component.

**Inputs:** `pathId` (duty|desire|transformation), `rootNode`, `isAbandoned`, `grievedPaths` summary

**Outputs:** Node click events, abandon signal

**Responsibility:**
- Renders current revealed nodes in an incense-smoke branching layout (Framer Motion)
- Each node = a fortune-telling card with a 2-3 sentence prediction + year marker
- Clicking a node calls `POST /api/generate-node` → streams the next prediction
- A "release this path" button triggers the abandon flow
- Abandoned state: Framer Motion animates all nodes fading to ash

**Local state (within component):**
- `nodes: Node[]` — array of revealed nodes for this path
- `streamingText: string` — text being streamed for the currently-generating node
- `status: 'active' | 'generating' | 'abandoned'`

**Node shape:**
```typescript
interface PathNode {
  id: string;
  pathId: 'duty' | 'desire' | 'transformation';
  depth: number;          // 1-5
  yearMarker: string;     // e.g. "Year 3"
  prediction: string;     // 2-3 sentences
  isRevealed: boolean;
  isStreaming: boolean;
}
```

**Communicates with:** Route handler `/api/generate-node`, parent PathForest (abandon signal).

---

### 6. GriefInterview (`components/GriefInterview.tsx`)

**Type:** Modal overlay component. Full-screen, blocking.

**Inputs from store:** `abandonedPathId`, `abandonedPathSummary`

**Outputs to store:** `griefEntry` (answered interview), dismiss signal

**Responsibility:**
- Appears when a path is abandoned
- Presents 3 questions sequentially (generated by Claude, then typed answer accepted)
- First question is pre-seeded (fast UX), then user answers → Claude streams a brief acknowledgment → next question appears
- On completion, constructs a GriefEntry and writes it to the store (which persists to localStorage)

**Why Claude generates the questions:** The questions should feel personal to the specific path abandoned ("You were going to leave your family's business — what did you imagine your father would say?"). They cannot be generic.

**Communicates with:** Route handler `/api/grief-interview`, store (read abandoned path data, write grief entry).

---

### 7. GriefArchive (`components/GriefArchive.tsx`)

**Type:** Drawer/side panel component.

**Inputs from store:** `griefEntries[]`

**Outputs:** Nothing (display only)

**Responsibility:**
- Shows all abandoned paths from this session
- Each entry: path archetype name, the 3 questions and answers, timestamp
- Visual: faded, ash-grey aesthetic — the "museum of who you didn't become"
- Accessible via a persistent icon/button in the corner

**Communicates with:** Store (read only).

---

### 8. Route Handlers (`app/api/`)

Three route handlers. All are POST, all stream responses.

**`/api/generate-paths/route.ts`**
- Input: `{ profile: TuViChart, decision: string, griefContext: GriefSummary }`
- Output: Streaming JSON — 3 path root objects arriving as a stream
- Streams using `ReadableStream` + `TransformStream` wrapping the Anthropic SDK's async iterable

**`/api/generate-node/route.ts`**
- Input: `{ pathId, depth, pathHistory: Node[], profile: TuViChart, griefContext: GriefSummary }`
- Output: Streaming text — the next node prediction
- Streams raw text chunks using Server-Sent Events pattern

**`/api/grief-interview/route.ts`**
- Input: `{ abandonedPath: PathSummary, questionIndex: 0|1|2, previousAnswers: string[] }`
- Output: Streaming text — the question text (index 0) or acknowledgment + next question bridge

---

## Data Flow

```
User fills InputForm
  │
  ▼
[TuViEngine.calculate(input)]  ← pure sync function
  │
  └── chart: TuViChart ──▶ stored in sessionStore
                            │
                            ├──▶ ChartDisplay renders (display only)
                            │
                            └──▶ PsychProfile renders (display only)
                                  │
                                  ▼
                        PathForest mounts
                          │
                          ├── POST /api/generate-paths
                          │     └── streams 3 root nodes into store
                          │
                          └── renders 3 PathTree components
                                │
                                │ [user clicks node]
                                ▼
                          POST /api/generate-node
                            └── streams next node text
                                  │
                                  ▼
                            PathTree appends node (depth++)
                                  │
                                  │ [user abandons path]
                                  ▼
                            PathForest receives abandon signal
                              │
                              ├── freezes PathTree (ash animation)
                              ├── POST /api/grief-interview (q1)
                              │     └── streams first question
                              │           │
                              │           │ [user answers]
                              │           ▼
                              │     POST /api/grief-interview (q2, with answer)
                              │           └── streams bridge + q2... (repeat x3)
                              │
                              └── GriefEntry written to store
                                    │
                                    ├──▶ localStorage persisted
                                    │
                                    └──▶ griefContext updated
                                            │
                                            ▼
                                    remaining PathTrees receive
                                    updated griefContext on next
                                    node generation request
```

**Key data flow rule:** Grief influence on remaining paths flows through the API — not through React props. When generating the next node for an active path, the grief context is sent to the route handler as part of the request body, and Claude incorporates it into the narrative. The React tree does not need to know how grief reshapes predictions; it just passes accumulated grief entries to the API.

---

## State Management Recommendation

**Use Zustand.**

Rationale:

The state graph for Verse has three distinct layers:

1. **Chart layer** — computed once, read by many. A simple object. No mutations.
2. **Path layer** — 3 parallel trees, each growing independently. Each tree has its own node array and status. Trees are not nested inside each other — they are siblings.
3. **Grief layer** — an append-only log. New entries added, never modified.

Zustand fits this cleanly. Each concern can live as a named slice. The store is accessed from anywhere without prop drilling.

**Why not Jotai:**
Jotai's atom model is excellent for fine-grained reactivity in deeply nested hierarchies where different subtrees subscribe to different atoms. But the Verse path trees are not deeply nested — they are flat arrays of nodes. The 3×5 maximum node count (15 nodes total across all paths) does not benefit from atom-per-node granularity. Jotai would add complexity without payoff here.

**Why not React useState/useContext:**
The GriefInterview overlay needs to read from PathForest state and write to the archive. The archive needs to propagate grief context back up to PathForest. Prop drilling across this 5-level component tree would create fragile data plumbing. A store solves the cross-cutting concern cleanly.

**Store shape:**
```typescript
interface VerseStore {
  // Input
  birthInput: BirthInput | null;
  decision: string;

  // Chart (computed once)
  chart: TuViChart | null;

  // Paths (3 trees)
  paths: {
    duty: PathState;
    desire: PathState;
    transformation: PathState;
  };

  // Active UI state
  activeInterview: {
    pathId: PathId | null;
    abandonedPathSummary: string;
    questionIndex: number;
    answers: string[];
  };

  // Grief archive
  griefEntries: GriefEntry[];

  // Derived: grief context sent to API
  // Computed from griefEntries — not stored separately
  // griefContext(): GriefSummary

  // Actions
  setChart: (chart: TuViChart) => void;
  appendNode: (pathId: PathId, node: PathNode) => void;
  setPathStreaming: (pathId: PathId, text: string) => void;
  abandonPath: (pathId: PathId) => void;
  submitGriefAnswer: (answer: string) => void;
  completeInterview: () => void;
  archiveGriefEntry: (entry: GriefEntry) => void;
}

interface PathState {
  nodes: PathNode[];
  status: 'idle' | 'generating-root' | 'active' | 'generating-node' | 'abandoned';
  streamingText: string;
  rootPrompt: string;   // the archetypal tension framing
}
```

**localStorage sync:** Use Zustand's `persist` middleware with a custom `partialState` selector. Only the `griefEntries` array needs persistence — chart and path trees are session-ephemeral (re-entering your birthday is acceptable per V1 scope).

---

## localStorage Schema

```typescript
// Key: "verse-grief-archive"
interface GriefArchiveStorage {
  version: 1;
  sessionId: string;    // nanoid(), generated on first load
  entries: GriefEntry[];
}

interface GriefEntry {
  id: string;           // nanoid()
  timestamp: number;    // Date.now()
  pathArchetype: 'duty' | 'desire' | 'transformation';
  pathLabel: string;    // human label from the generated root node
  nodesRevealed: number; // how deep they went before abandoning
  nodesSummary: string;  // last revealed node's prediction text
  interview: {
    questions: string[];    // [q1, q2, q3]
    answers: string[];      // [a1, a2, a3]
  };
  birthYear: number;     // for context (not full birth date — minimal PII)
  decision: string;      // the decision they were exploring
}
```

**Size budget:** Each entry is approximately 2-4KB of text. 10 entries = 40KB. Well under the ~5MB localStorage limit. No pruning needed for V1.

**Versioning:** The `version: 1` field allows future migrations if the schema changes. On load, check version — if mismatched, show a "starting fresh" message and clear.

**What is NOT stored in localStorage:**
- The computed TuViChart (recomputable from birthday)
- Active path nodes (session-only per V1 spec)
- API keys (never — these stay server-side in route handlers)

---

## Claude API Streaming: Route Handlers vs Server Actions

**Use Route Handlers (not Server Actions) for all Claude streaming.**

Rationale:

Server Actions in Next.js 14 are designed for form mutations. They return a result after completion. While you can technically stream from a Server Action using `experimental_useFormState` + generators, the pattern is awkward and poorly suited to long-running LLM streams. Server Actions also have a 10-second timeout limit on many hosting platforms.

Route Handlers with `ReadableStream` are the correct primitive:

```typescript
// app/api/generate-node/route.ts
export const runtime = 'edge'; // optional — faster cold starts

export async function POST(req: Request) {
  const { pathId, depth, pathHistory, profile, griefContext } = await req.json();

  const anthropicStream = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    stream: true,
    messages: [{ role: 'user', content: buildNodePrompt(pathId, depth, pathHistory, profile, griefContext) }],
    system: buildSystemPrompt(),
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const event of anthropicStream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(new TextEncoder().encode(event.delta.text));
        }
        if (event.type === 'message_stop') {
          controller.close();
        }
      }
    },
  });

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
```

**Client-side consumption:**
```typescript
// In PathTree component
const response = await fetch('/api/generate-node', { method: 'POST', body: JSON.stringify(payload) });
const reader = response.body!.getReader();
const decoder = new TextDecoder();
let accumulated = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  accumulated += decoder.decode(value, { stream: true });
  store.setPathStreaming(pathId, accumulated); // updates UI as text arrives
}
store.appendNode(pathId, buildNode(accumulated, depth));
```

**Note on Vercel AI SDK:** The Next.js docs reference the Vercel AI SDK (`ai` package) for streaming. It is a valid option that simplifies the streaming boilerplate. However, it adds a dependency and abstracts the streaming protocol in ways that may complicate the custom grief-influence logic. Using the raw ReadableStream approach keeps the prompt engineering fully under control, which matters here given the complexity of the grief feedback loop.

---

## Tử Vi Calculation Engine Structure

The calculation engine must be a **pure, synchronous TypeScript module** with no external calls. This is critical for demo reliability — if the chart fails to calculate, the entire demo fails.

**Recommended module structure:**
```
lib/tuvi/
  index.ts              — public API: calculateChart(input) → TuViChart
  lunar-converter.ts    — solar to Vietnamese lunar calendar
  palace-builder.ts     — 12 palace stem/branch assignment
  star-placer.ts        — 14 main star placement rules
  minor-star-placer.ts  — auxiliary stars (optional for V1)
  profile-extractor.ts  — derive psychological profile from chart
  constants.ts          — star names, palace names, stem/branch arrays
  types.ts              — all TypeScript interfaces
```

**Lunar converter dependency:** Pure algorithmic conversion. The core algorithm is the Vietnamese adaptation of the Chinese lunisolar calendar. No library needed — the Astronomical Algorithms by Jean Meeus provides the Julian Day Number math. The conversion to Vietnamese lunar months follows specific New Moon calculation rules.

Alternatively, the `lunar-javascript` library (Chinese lunar calendar, NPM) covers most of the math and handles intercalary months. It would need a thin adapter to map Chinese lunar terminology to Vietnamese Tử Vi conventions (the stars and palaces use Vietnamese names, but the underlying calendar math is identical). Confidence: MEDIUM — should be verified that `lunar-javascript` output is compatible before committing.

**Profile extraction:** This is deterministic template logic, not AI. The 4 psychological dimensions (dominant palace, risk star pattern, relational pattern, ambition structure) map directly from chart data via lookup tables and conditional rules. This creates the "grounded" feel the project requires.

---

## Component Decomposition (Full Tree)

```
app/
  page.tsx                          — session orchestrator, phase state machine
  layout.tsx                        — root layout, Vietnamese aesthetic globals

components/
  InputForm.tsx                     — birthday + decision input
  ChartDisplay/
    ChartDisplay.tsx                — outer container
    PalaceRing.tsx                  — SVG 12-palace ring
    StarList.tsx                    — star names per palace
  PsychProfile.tsx                  — rendered profile prose
  PathForest/
    PathForest.tsx                  — 3-tree orchestrator
    PathTree.tsx                    — single path tree (reused ×3)
    PathNode.tsx                    — single node card
    NodeConnector.tsx               — animated incense smoke line
    AbandonButton.tsx               — "release this path"
  GriefInterview/
    GriefInterview.tsx              — modal overlay
    GriefQuestion.tsx               — single question + answer input
    GriefAcknowledgment.tsx         — streamed Claude response between questions
  GriefArchive/
    GriefArchive.tsx                — drawer container
    GriefEntryCard.tsx              — one abandoned path entry

lib/
  tuvi/                             — pure calculation engine (see above)
  prompt-builders.ts                — all Claude prompt construction
  storage.ts                        — localStorage read/write helpers
  store.ts                          — Zustand store definition

app/api/
  generate-paths/route.ts
  generate-node/route.ts
  grief-interview/route.ts
```

---

## Build Order

Dependencies constrain build order. Each phase depends on the components below it being stable.

**Phase 1 — Foundation (no dependencies)**
1. TypeScript interfaces and types (`lib/tuvi/types.ts`, `lib/store.ts` types)
2. Zustand store scaffolding (actions defined, state shape set)
3. localStorage persistence middleware (`lib/storage.ts`)
4. Vietnamese lacquerware CSS/Tailwind theme (layout, typography, color tokens)
5. Root `page.tsx` phase state machine (empty shell: input → chart → paths)

**Phase 2 — Tử Vi Engine (no external dependencies)**
1. `lunar-converter.ts` — most algorithmically complex, needs thorough testing
2. `palace-builder.ts` — depends on lunar converter output
3. `star-placer.ts` — depends on palace builder
4. `profile-extractor.ts` — depends on star placer
5. `InputForm.tsx` + integration test: input → chart → inspect output
6. `ChartDisplay.tsx` — proof that the chart is real (demo credibility)

**Phase 3 — Claude Integration (depends on Phase 2 types)**
1. Route handler `/api/generate-paths` — first Claude touchpoint
2. `prompt-builders.ts` — all prompts defined here, tested manually
3. `PathForest.tsx` + `PathTree.tsx` — wire streaming into store
4. `PathNode.tsx` + `NodeConnector.tsx` — Framer Motion animations
5. Route handler `/api/generate-node`

**Phase 4 — Grief System (depends on Phase 3 path state)**
1. Route handler `/api/grief-interview`
2. `GriefInterview.tsx` overlay
3. Grief context injection into path generation prompts
4. `GriefArchive.tsx` drawer
5. localStorage persistence of grief entries

**Phase 5 — Polish (depends on all above)**
1. Framer Motion: ash fade animation for abandoned paths
2. Framer Motion: gold glow for active path
3. Incense smoke node connectors
4. Altar scroll layout refinements
5. Demo-flow rehearsal: birthday → chart → 3 paths → click → abandon → grief → archive

**Critical path for hackathon demo:**
Phases 1→2→3 must be complete for a working demo. Phase 4 (grief) is the differentiating mechanic but can be shown partially. Phase 5 polish matters for visual judges.

---

## Key Findings

1. **Route Handlers are the right streaming primitive.** Server Actions cannot reliably stream long LLM responses. Route Handlers with `ReadableStream` give direct control over the stream and work cleanly with the Anthropic SDK's async iterator. Confidence: HIGH (verified against current Next.js docs).

2. **Zustand over Jotai for this tree structure.** The path tree is shallow (max 5 nodes, 3 paths) and the grief-to-path feedback loop is a cross-cutting concern. Zustand's single store with slices handles this without atom composition complexity. Confidence: HIGH (well-established pattern).

3. **TuViEngine must be pure and synchronous.** Any async dependency in the calculation layer creates a demo failure surface. The lunar calendar math is self-contained. Test this component extensively before Phase 3 — a wrong chart silently undermines the entire psychological profile narrative.

4. **Grief feedback flows through the API, not React state.** When generating the next node for a remaining active path, the grief entries are serialized and sent to the route handler as part of the request body. Claude receives the grief context in its prompt and shapes the narrative. React components do not need to know how grief modifies predictions — they just pass accumulated entries to fetch calls. This keeps the React tree clean and the grief influence logic in one place (prompt builders).

5. **Three route handlers, minimal surface area.** The "no backend" constraint means all compute happens in Next.js route handlers (server-side, serverless). The API key is never exposed to the client. Three focused route handlers (paths, node, grief) with clear input/output contracts are easier to debug under hackathon pressure than a single monolithic handler.

6. **localStorage schema versioned from day one.** Even in V1, include a version field. The grief archive is the long-term product vision — preventing schema corruption during development is worth 5 minutes of setup.

7. **TuViEngine library risk.** JavaScript libraries for Vietnamese Tử Vi calculation are sparse. Chinese lunar calendar libraries (`lunar-javascript`, `tyme4ts`) cover the calendar math but require adaptation. Budget time to either adapt an existing library or implement the astronomical algorithms from first principles. This is the highest-risk technical component. Flag for deeper research before Phase 2 begins.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Next.js 14 Route Handler streaming | HIGH | Verified against current Next.js docs (v16.2.1 as of 2026-03-25) |
| Zustand state management pattern | HIGH | Stable API, well-documented patterns |
| Claude API streaming via async iterator | HIGH | Standard Anthropic SDK pattern, verified in training |
| localStorage schema design | HIGH | Standard browser API, no external dependencies |
| Tử Vi algorithm correctness | MEDIUM | Algorithm is well-documented in Vietnamese astrology texts; JS implementation requires research or from-scratch work |
| Available JS libraries for Tử Vi | LOW | Could not verify current NPM ecosystem due to search restrictions — flag for manual investigation |

---

*Sources: Next.js official documentation (nextjs.org/docs, verified 2026-03-25). Anthropic SDK and Claude API patterns based on training knowledge (August 2025 cutoff). Zustand and Jotai patterns based on training knowledge.*
