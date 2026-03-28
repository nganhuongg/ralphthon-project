# Phase 3: Grief System + Archive - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 03-grief-system-archive
**Areas discussed:** Interview question phrasing, Abandonment overlay flow, Archive view placement, Ash fade timing

---

## Interview Question Phrasing

| Option | Description | Selected |
|--------|-------------|----------|
| Static phrasing | Three fixed questions; no API call — instant, reliable | ✓ |
| Claude-generated wording | Claude personalizes each question; separate API call per question; ~1-2s latency | |
| Claude generates all 3 upfront | One API call at interview start; generates all 3 then shows one by one | |

**User's choice:** Static phrasing (Recommended)
**Notes:** Exact wording left to Claude's discretion during implementation — must match tender, grounded, not mystical tone.

---

## Abandonment Overlay Flow

### Q1: How should the 3 questions present?

| Option | Description | Selected |
|--------|-------------|----------|
| One at a time | Q1 → answer → Q2 → answer → Q3 → answer. More ritual-like. Matches store's `advanceInterview` action. | ✓ |
| All three visible at once | All 3 shown simultaneously; user fills in any order and submits | |

**User's choice:** One at a time (Recommended)

### Q2: What happens if user tries to dismiss without completing?

| Option | Description | Selected |
|--------|-------------|----------|
| Must complete to proceed | No close/dismiss button. Path stays pending-abandonment until interview finishes. | ✓ |
| Can dismiss — abandon without grief entry | Escape/X closes; path still marked abandoned but no grief entry | |
| Can dismiss — unabandons the path | Dismissing cancels abandonment entirely; path returns to active | |

**User's choice:** Must complete to proceed (Recommended)
**Notes:** The ritual is non-negotiable — abandonment requires committing to the interview.

---

## Archive View Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Persistent sidebar | Collapsible panel on the right side, always present alongside path columns | ✓ |
| Bottom drawer | Slides up from bottom, hides paths while open | |
| Floating toggle button | Small button opens modal overlay | |

**User's choice:** Persistent sidebar (Recommended)
**Notes:** Good for demo — judges can see archived paths alongside active paths simultaneously.

---

## Ash Fade Timing

| Option | Description | Selected |
|--------|-------------|----------|
| After interview completes | Column fades once all 3 answers submitted and grief entry saved | ✓ |
| Immediately on Abandon click | Column starts fading before interview, overlay appears on fading column | |
| During interview progressively | Column fades slowly across all 3 questions | |

**User's choice:** After interview completes (Recommended)
**Notes:** The ash fade is the ritual's conclusion, not its initiation — this ordering is intentional and meaningful.

---

## Claude's Discretion

- Exact static question wording for each of the 3 questions
- Ash fade animation specifics (color, duration, easing)
- Archive sidebar open/closed default state
- Answer input: textarea vs single-line input per question
