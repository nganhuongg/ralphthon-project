# Phase 1: Foundation + Tử Vi Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 01-foundation-t-vi-engine
**Areas discussed:** Birth hour input, Chart display, Theme scope

---

## Birth Hour Input

| Option | Description | Selected |
|--------|-------------|----------|
| Required — must enter | User must provide birth hour, note shown if unknown | |
| Optional, noon default | Default to Giờ Ngọ with small caveat shown | |
| Optional, silent default | Default to noon, no caveat — simplicity over precision | ✓ |

**User's choice:** Optional, silent default
**Notes:** Simplicity wins. If user doesn't provide it, we silently default to Giờ Ngọ (noon). No caveat message.

---

## Chart Display

### Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Traditional 4×4 grid | Pixel-accurate to Vietnamese Tử Vi tradition | |
| Modern 4×4 grid | Same structure, styled with lacquerware aesthetic | ✓ |
| Simplified list | 12 palaces as vertical list | |

**User's choice:** Modern 4×4 grid

### Palace cell content

| Option | Description | Selected |
|--------|-------------|----------|
| Star names only | Just Vietnamese star names | |
| Stars + palace name | Star names plus palace label | |
| Stars + name + gloss | Palace name with short English gloss | ✓ |

**User's choice:** Stars + palace name + short English gloss (e.g. "Quan Lộc — career")

---

## Theme Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal placeholder | Bare Tailwind defaults, all aesthetic to Phase 4 | |
| Token foundation | Colors/fonts/texture in tailwind.config.js | |
| Token foundation + basic shell | Tokens + basic page shell (background, scroll container, altar layout) | ✓ |

**User's choice:** Token foundation + basic shell
**Notes:** Every phase builds into the right visual context from Phase 1 onward.

---

## Claude's Discretion

- Exact color hex values within lacquerware palette
- Loading/transition state on form submit
- Empty state for palace cells with no stars
- Zustand store slice boundaries

## Deferred Ideas

None — discussion stayed within phase scope.
