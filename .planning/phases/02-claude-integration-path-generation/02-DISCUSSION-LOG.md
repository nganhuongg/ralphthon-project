# Phase 2: Claude Integration + Path Generation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 02-claude-integration-path-generation
**Mode:** auto (Claude picks recommended defaults)
**Areas discussed:** API Route, Streaming Hook, Root Generation, Prompt Schema, Grief Plumbing, Path Layout, Node Interaction

---

## API Route Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Single `/api/generate-node` | One flexible endpoint for all node depths and paths | ✓ |
| Separate routes per concern | `/api/generate-root`, `/api/generate-next` etc. | |

**User's choice:** `[auto]` Single `/api/generate-node` (recommended default)
**Notes:** Simpler to maintain; depth is a request param not a route distinction.

---

## Streaming Hook Pattern

| Option | Description | Selected |
|--------|-------------|----------|
| `useCompletion` | One-shot text completion; `complete(prompt)` triggers streaming | ✓ |
| `useChat` | Conversational mode with message history; overkill for single-shot generation | |
| Custom fetch + ReadableStream | More control but reimplements what AI SDK provides | |

**User's choice:** `[auto]` `useCompletion` from `@ai-sdk/react` (recommended default)
**Notes:** Each path column gets its own `useCompletion` instance. Simple API matches one-shot node generation model.

---

## Root Node Generation

| Option | Description | Selected |
|--------|-------------|----------|
| Parallel streaming | All 3 `complete()` calls fire simultaneously | ✓ |
| Sequential | Root nodes stream one after another | |

**User's choice:** `[auto]` Parallel (recommended default)
**Notes:** Three futures streaming simultaneously is the core UX demo moment.

---

## Prompt Schema

| Option | Description | Selected |
|--------|-------------|----------|
| System = static profile + archetype, User = dynamic depth + nodes | Clean separation | ✓ |
| Everything in user prompt | Loses separation of concern | |
| Tool use / structured output | Overkill for 2–4 sentence predictions | |

**User's choice:** `[auto]` System/user split (recommended default)

---

## Grief Context Injection (PATH-05)

| Option | Description | Selected |
|--------|-------------|----------|
| Wire plumbing in Phase 2 | Optional `griefContext` accepted, injected as system prompt modifier | ✓ |
| Defer entirely to Phase 3 | Simpler but leaves PATH-05 requirement gap | |

**User's choice:** `[auto]` Wire plumbing in Phase 2 (recommended default)
**Notes:** Store already has `griefEntries`. Phase 2 passes them (empty); Phase 3 populates them.

---

## Path Card Layout

| Option | Description | Selected |
|--------|-------------|----------|
| 3-column grid | Side-by-side comparison | ✓ |
| 3 stacked sections | Vertical scroll | |
| Tabbed | One path visible at a time | |

**User's choice:** `[auto]` 3-column grid (recommended default)

---

## Node Tree Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Dot depth indicator + hidden expand at depth 5 | Clean, minimal | ✓ |
| Number badge + disabled button at depth 5 | More explicit | |

**User's choice:** `[auto]` Dot indicator, button hidden at max depth (recommended default)

---

## Claude's Discretion

- Exact system prompt wording and tone instructions
- Whether archetype summary line appears above first node
- Error handling UI for streaming failures
- Exact depth indicator visual

## Deferred Ideas

None.
