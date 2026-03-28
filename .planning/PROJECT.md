# Verse

## What This Is

Verse is a life path explorer for people at crossroads. Users input their birthday, birthplace, and one decision they're stuck on. The system calculates a real Tử Vi astrology chart (14 main stars, 12 palaces, heavenly stems and earthly branches), extracts a psychological profile from it, then uses Claude to generate three divergent future timelines as interactive branching node trees. When users abandon a path, a grief interview runs — and what was grieved subtly reshapes what remains. The tool is tender, not mystical. A mirror for conscious choice, not fortune-telling.

## Core Value

Turn the moment someone doesn't know what to do with their life into a documented map of who they chose not to become.

## Requirements

### Validated

- Abandoning a path triggers a 3-question grief interview (Validated in Phase 3: grief-system-archive)
- Grief from abandoned paths subtly influences narrative of remaining active paths (Validated in Phase 3: grief-system-archive)
- All abandoned paths are stored in a session grief archive (localStorage) (Validated in Phase 3: grief-system-archive)
- Grief archive view shows all abandoned paths this session (Validated in Phase 3: grief-system-archive)

### Active

- [ ] User can input birthday, birthplace, and one current life decision
- [ ] System calculates a real Tử Vi chart (14 main stars, 12 palaces, stem/branch placement, lunar calendar conversion)
- [ ] Chart produces a psychological profile: dominant palace, risk star, relational pattern, ambition structure
- [ ] Claude generates three divergent path timelines from the profile + decision, each representing an archetypal tension (duty, desire, transformation)
- [ ] Each path is an interactive node tree — clicking a node generates the next prediction, max 5 nodes deep
- [ ] UI: Vietnamese lacquerware aesthetic — deep red, gold, black, paper texture, altar scroll layout, incense smoke node branching, abandoned paths fade to ash, chosen path stays gold

### Out of Scope

- User accounts / cloud persistence — V1 is single-session localStorage only
- Mobile optimization — desktop first for hackathon demo
- Social sharing — deferred post-hackathon
- Multiple simultaneous decisions — one decision per session
- Real-time collaboration — solo experience

## Context

This is being built for **ralphthon** (a hackathon). The demo moment is critical: user types their birthday live, chart renders, three paths unfold, they click one node in front of judges. The judging criteria weigh live demo, creativity, and impact.

**Framing that matters:** Tử Vi as psychological engine, not fortune-telling. The chart doesn't predict — it generates a personality profile that makes Claude's branch generation feel grounded and personalized rather than generic AI output.

**Retention mechanic:** The grief archive is the product's core long-term value. In V1 it lives in localStorage (session only), but the vision is a persistent, accumulating record of decisions not taken — something no other tool can replicate.

**Cultural tone:** Everything Everywhere All At Once meets Vietnamese lacquerware. Tender, not mystical. Accessible to curious outsiders; resonant for Vietnamese diaspora.

**Lobster count note:** Claude generates all branches autonomously — the AI workload is high by design.

## Constraints

- **Stack**: Next.js 14, Tailwind CSS, Framer Motion, Claude API (`claude-sonnet-4-6`) — no backend
- **Auth**: None — localStorage only for grief archive
- **Timeline**: Hackathon deadline (V1 must be demoed live)
- **Tử Vi calc**: Algorithmically exact — real lunar calendar conversion, exact star placement by birth hour/day/month/year; birthplace used for timezone → birth hour accuracy only
- **Node depth**: Maximum 5 nodes deep per path
- **Grief interview**: 3 questions, conversational (not ceremonial), Claude-generated responses

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tử Vi calc is algorithmically exact, not AI-approximated | Grounds the experience in real tradition; makes psychological profile defensible | — Pending |
| Three paths defined by archetypal tensions (duty/desire/transformation) | More universally resonant than star-specific forking; maps to real decision psychology | — Pending |
| Grief feeds back into remaining paths | Creates narrative coherence and makes abandonment feel meaningful, not wasteful | — Pending |
| No backend, localStorage only for V1 | Hackathon speed; reduces demo failure points | — Pending |
| Birthplace = timezone only (not regional narrative flavor) | Simplifies scope; chart accuracy matters more than regional prose variation in V1 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-28 after Phase 3 completion*
