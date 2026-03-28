# Requirements: Verse

**Defined:** 2026-03-28
**Core Value:** Turn the moment someone doesn't know what to do with their life into a documented map of who they chose not to become.

## v1 Requirements

### Input

- [ ] **INPUT-01**: User can enter date of birth (day, month, year)
- [ ] **INPUT-02**: User can enter birthplace (city/region, used for timezone → birth hour derivation)
- [ ] **INPUT-03**: User can enter one life decision they are currently stuck on (free text)
- [ ] **INPUT-04**: Form validates inputs before chart calculation begins

### Chart Calculation

- [ ] **CHART-01**: System converts Gregorian birthday to Vietnamese lunar calendar date (algorithmically exact — Hồ Ngọc Đức algorithm or equivalent)
- [ ] **CHART-02**: System derives Can Chi (heavenly stem + earthly branch) for year, month, day, and hour of birth
- [ ] **CHART-03**: System places all 14 main stars (Tử Vi, Thiên Phủ, and the 12 satellite stars) across 12 palaces
- [ ] **CHART-04**: Chart output is a typed data structure (TuViChart) used as input to profile extraction and Claude

### Psychological Profile

- [ ] **PROF-01**: System extracts dominant palace from the chart (palace with highest-weight star cluster)
- [ ] **PROF-02**: System identifies risk star (primary challenging star in the chart)
- [ ] **PROF-03**: System derives relational pattern (how the chart describes interpersonal tendencies)
- [ ] **PROF-04**: System derives ambition structure (how the chart describes drive and career orientation)
- [ ] **PROF-05**: Psychological profile is displayed to user before paths are generated

### Path Generation

- [ ] **PATH-01**: Claude generates 3 divergent life path timelines from the psychological profile + life decision
- [ ] **PATH-02**: Each path is labeled with an archetypal tension: Duty, Desire, or Transformation
- [ ] **PATH-03**: Each path begins with a root prediction node (1-3 sentence foreshadowing)
- [ ] **PATH-04**: Path generation uses Claude streaming (user sees text appear progressively)
- [ ] **PATH-05**: Grief context from previously abandoned paths is passed to Claude when generating subsequent nodes on remaining paths

### Node Tree Interaction

- [ ] **NODE-01**: User can click a node to generate the next prediction on that path
- [ ] **NODE-02**: Node generation streams from Claude (progressive text reveal)
- [ ] **NODE-03**: Each path supports a maximum of 5 nodes deep
- [ ] **NODE-04**: User can see which node they are currently on (visual depth indicator)
- [ ] **NODE-05**: User can abandon a path at any node depth

### Grief System

- [ ] **GRIEF-01**: Abandoning a path triggers a grief interview overlay
- [ ] **GRIEF-02**: Grief interview asks exactly 3 questions (Claude-generated, conversational register — not therapeutic)
- [ ] **GRIEF-03**: Grief interview questions are: what are you letting go of, what does that cost you, what do you now know
- [ ] **GRIEF-04**: User answers are stored with the abandoned path in localStorage
- [ ] **GRIEF-05**: Abandoned path visually fades to ash (animation)
- [ ] **GRIEF-06**: Grief responses are passed as context to future node generations on remaining active paths

### Grief Archive

- [ ] **ARCH-01**: Grief archive view is accessible during the session
- [ ] **ARCH-02**: Archive displays all abandoned paths with their grief interview answers
- [ ] **ARCH-03**: Archive data persists in localStorage across page refreshes within the session
- [ ] **ARCH-04**: localStorage schema is versioned (version: 1) for future compatibility

### UI & Aesthetic

- [ ] **UI-01**: Color palette: deep red (#8B1A1A or similar), gold (#C9A84C or similar), black — Vietnamese lacquerware
- [ ] **UI-02**: Paper texture background (CSS or image overlay)
- [ ] **UI-03**: Path tree renders as an altar scroll unrolling downward
- [ ] **UI-04**: Node branching animates like incense smoke splitting (Framer Motion)
- [ ] **UI-05**: Abandoned paths fade to ash color; active chosen path remains gold
- [ ] **UI-06**: Typography uses Vietnamese diacritics and classical numeral styling
- [ ] **UI-07**: UI tone is tender and grounded — not mystical, not gamified

### Demo Hardening

- [ ] **DEMO-01**: Pre-generated fallback JSON exists for a known "demo birthday" (loads silently if Claude API fails)
- [ ] **DEMO-02**: `?reset` URL parameter clears session state and returns to input screen
- [ ] **DEMO-03**: App is tested and verified at 1280×800 resolution (projector standard)
- [ ] **DEMO-04**: Demo birthday is selected and vetted to produce a compelling psychological profile

## v2 Requirements

### Persistence

- **PERS-01**: Cloud-synced grief archive across sessions (requires auth)
- **PERS-02**: Month 3 grief archive view showing decisions not taken over time

### Auth

- **AUTH-01**: User accounts with persistent session history

### Sharing

- **SHARE-01**: User can share a path or grief entry as an image card

### Mobile

- **MOB-01**: Mobile-optimized layout and touch interactions

### Multi-decision

- **MULTI-01**: User can run multiple simultaneous decision explorations

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts | V1 is single-session; auth adds infra complexity for no demo value |
| Cloud persistence | localStorage sufficient for hackathon; cloud is post-hackathon product |
| Mobile optimization | Desktop-first for demo; projector display is the primary target |
| Social sharing | Post-hackathon feature |
| Multiple simultaneous decisions | One decision per session keeps scope and UX focused |
| Regional narrative flavor from birthplace | Birthplace = timezone only in V1; reduces scope without losing chart accuracy |
| OAuth / SSO | No auth in V1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INPUT-01 | Phase 1 | Pending |
| INPUT-02 | Phase 1 | Pending |
| INPUT-03 | Phase 1 | Pending |
| INPUT-04 | Phase 1 | Pending |
| CHART-01 | Phase 1 | Pending |
| CHART-02 | Phase 1 | Pending |
| CHART-03 | Phase 1 | Pending |
| CHART-04 | Phase 1 | Pending |
| PROF-01 | Phase 1 | Pending |
| PROF-02 | Phase 1 | Pending |
| PROF-03 | Phase 1 | Pending |
| PROF-04 | Phase 1 | Pending |
| PROF-05 | Phase 1 | Pending |
| PATH-01 | Phase 2 | Pending |
| PATH-02 | Phase 2 | Pending |
| PATH-03 | Phase 2 | Pending |
| PATH-04 | Phase 2 | Pending |
| PATH-05 | Phase 2 | Pending |
| NODE-01 | Phase 2 | Pending |
| NODE-02 | Phase 2 | Pending |
| NODE-03 | Phase 2 | Pending |
| NODE-04 | Phase 2 | Pending |
| NODE-05 | Phase 2 | Pending |
| GRIEF-01 | Phase 3 | Pending |
| GRIEF-02 | Phase 3 | Pending |
| GRIEF-03 | Phase 3 | Pending |
| GRIEF-04 | Phase 3 | Pending |
| GRIEF-05 | Phase 3 | Pending |
| GRIEF-06 | Phase 3 | Pending |
| ARCH-01 | Phase 3 | Pending |
| ARCH-02 | Phase 3 | Pending |
| ARCH-03 | Phase 3 | Pending |
| ARCH-04 | Phase 3 | Pending |
| UI-01 | Phase 4 | Pending |
| UI-02 | Phase 4 | Pending |
| UI-03 | Phase 4 | Pending |
| UI-04 | Phase 4 | Pending |
| UI-05 | Phase 4 | Pending |
| UI-06 | Phase 4 | Pending |
| UI-07 | Phase 4 | Pending |
| DEMO-01 | Phase 4 | Pending |
| DEMO-02 | Phase 4 | Pending |
| DEMO-03 | Phase 4 | Pending |
| DEMO-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after roadmap creation*
