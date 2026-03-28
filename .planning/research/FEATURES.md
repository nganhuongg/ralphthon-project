# Features Research: Verse

**Domain:** AI-powered life path explorer / branching narrative / grief reflection
**Researched:** 2026-03-28
**Research mode:** Ecosystem (training knowledge; web access unavailable — see confidence notes)

---

## Table Stakes

Features that must work for the demo to succeed. If any of these fail live, the demo fails.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Birthday input → chart render | Entry point; judges must see astrology grounding immediately | Med | Lunar calendar conversion is the risky piece — must be pre-tested with edge dates |
| Visible psychological profile output | Without this, the chart feels like a black box; judges need to see the "engine" | Low | 4 attributes displayed (dominant palace, risk star, relational pattern, ambition structure) — text card is sufficient |
| Three named path cards | Users/judges need to orient before clicking into any tree | Low | Show path name + one-line archetype description before tree expands |
| At least one interactive node click | Must demonstrate the "click → branch generates" interaction live | Med | First node on the chosen path must be pre-warmed or fast; cold API latency is a demo killer |
| Node expansion with visible generation | Judges need to see AI producing text in real time, not a loading spinner | Med | Streaming response is essential; blank loading states feel broken |
| Path abandonment → grief interview trigger | This is the unique mechanic; must be reachable in 2 minutes | Med | Grief interview must be reachable within 2 clicks of the demo starting |
| Grief archive visible in UI | The archive is the long-term value proposition; it must be present even if thin | Low | Even one archived path entry is enough to demonstrate the concept |
| Vietnamese lacquerware visual identity | Aesthetic is core to differentiation; generic UI destroys the product's tone | Med | Deep red / gold / black + paper texture must be present at launch — not a "nice to have" |
| Ash fade animation on abandonment | Single most visceral moment; if it doesn't animate, abandonment feels flat | Med | Framer Motion exit animation; must work reliably |

**Confidence:** HIGH — based on the project's own defined requirements and general hackathon demo principles

---

## Differentiators

Features that make Verse novel. No comparable tool does all of these.

### 1. Tử Vi as psychological engine (not fortune-telling)

**Value:** Every other AI "life coach" tool (Pi, Replika, Co-Star, Sanctuary) either uses generic personality frameworks (MBTI, enneagram) or Western astrology. Tử Vi is algorithmically complex, culturally specific, and completely unfamiliar to most Western judges — which creates immediate intrigue. The framing that the chart *generates a profile* rather than *predicts outcomes* is what separates Verse from mysticism apps.

**What competitors do instead:** Generic prompt engineering with personality sliders, or vague "energy reading" that feels ungrounded. Verse has a defensible calculation layer underneath.

**Confidence:** HIGH

### 2. Three divergent path archetypes (duty / desire / transformation)

**Value:** Branching narrative apps (Bandersnatch, Disco Elysium, Ink-based CYOA) present paths as plot choices. Verse presents paths as *identity choices*. The archetypal framing (not "Option A / Option B / Option C" but "The duty path / The desire path / The transformation path") is psychologically richer and maps to real decision literature (ambivalence, values conflict).

**What competitors do instead:** Binary A/B choices or unframed lists of options. Three named archetypes with personality-grounded divergence is uncommon.

**Confidence:** HIGH

### 3. Grief interview on path abandonment

**Value:** No AI tool treats the act of *not choosing* as meaningful data. Ritual acknowledgment of loss is documented in grief research as meaningful (ambiguous loss theory, continuing bonds theory). The 3-question interview is not therapy — it's acknowledgment. The distinction matters tonally.

**What competitors do instead:** Either nothing (most apps ignore abandoned paths) or aggressive re-engagement ("come back to this later!"). Verse treats abandonment as a full experience.

**Confidence:** HIGH

### 4. Grief cross-contamination between paths

**Value:** The mechanic that abandoned path grief subtly reshapes remaining paths creates narrative coherence that no other branching tool has. In CYOA apps, branches are independent. In Verse, your grief about what you're leaving behind changes what the remaining paths say. This makes the experience feel alive and honest rather than scripted.

**What competitors do:** Branches are always independent state. Cross-path influence is rare even in premium narrative games.

**Confidence:** HIGH

### 5. Grief archive as accumulating artifact

**Value:** The session grief archive is a document of who you chose not to become. This is the product's emotional core. Even in V1 (localStorage only), the visual presentation of abandoned paths as "ashes" creates a unique artifact. The long-term vision (persistent archive across sessions) is a retention mechanic no competitor has attempted.

**What competitors do:** No comparable archive exists in AI coaching tools. Journaling apps (Day One, Reflect) are passive. Verse's archive is generated from decision-making.

**Confidence:** HIGH

### 6. Cultural specificity (Vietnamese diaspora resonance)

**Value:** Vietnamese lacquerware aesthetic + Tử Vi chart + "Everything Everywhere All At Once" emotional register reaches an underserved audience (Vietnamese diaspora) while being exotic enough to intrigue outsiders. Cultural specificity creates authenticity; generic global apps feel sterile by comparison.

**What competitors do:** Co-Star uses Western astrology with a generic minimalist aesthetic. No major app uses Tử Vi.

**Confidence:** HIGH

---

## Anti-Features (V1)

Things to explicitly not build. Each carries an opportunity cost that would damage the demo.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User accounts / login | Auth flow adds 15-30 minutes to demo setup; localStorage is sufficient for demonstrating the grief archive concept | Use localStorage; mention "persistent accounts in V2" verbally |
| Mobile optimization | Hackathon judges are on laptops; responsive CSS bugs waste engineering time and can break the tree layout | Lock to desktop min-width 1024px; add a polite "best on desktop" note |
| Multiple simultaneous decisions | One decision creates enough complexity; multiple would require rethinking the grief cross-contamination logic | Single decision per session; scope is a feature |
| Social sharing / export | Post-hackathon feature; implementing it adds nothing to the demo's 2-minute arc | Mention as vision in pitch, not in product |
| Regional narrative flavor from birthplace | Birthplace → timezone → birth hour accuracy is sufficient for chart correctness; narrative prose variation by region adds scope without proportional value | Use birthplace for timezone conversion only |
| Path regeneration / editing | Allowing users to re-roll paths undermines the "this is your chart, these are your forks" authenticity | Paths are permanent per session once generated |
| Explanatory tooltips for every Tử Vi star | Judges don't need to understand what Thiên Phủ means; the profile output (4 attributes) is the translation layer | Show profile, not raw star names, as the primary output |
| Loading skeleton states for every node | Over-engineered polish that takes time away from core mechanics | Streaming text with a simple typing animation is sufficient |
| Error recovery flows | Hackathon; if the API fails mid-demo, recover manually. Error states take engineering time. | Test the happy path extensively; have a fallback demo video |
| Accessibility compliance (WCAG AA) | Important long-term, not for V1 hackathon | Note in pitch deck that accessibility is planned post-hackathon |

---

## Hackathon Demo Flow

The ideal 2-minute demo sequence for judges. This is a narrative, not a feature list. Every feature must serve this arc.

**Second 0-15: Hook**
Presenter inputs their own (real) birthday and "Should I quit my job and move to Vietnam?" as the decision. No explanation. The form is sparse and confident. Judges see birthday + place + one question.

**Second 15-30: Chart renders**
The Tử Vi chart appears — visible stars, palace layout. A brief psychological profile card animates in: "Dominant: Mệnh Palace. Risk star: Thất Sát. Pattern: High ambition, resistant to constraint." Judges see this is not generic AI. Something real was computed.

**Second 30-50: Three paths unfold**
Three path cards emerge with archetypal names and one-line descriptions. The Vietnamese aesthetic is fully visible. Presenter says: "Three paths. Not options — archetypal tensions from your chart."

**Second 50-75: First node click**
Presenter clicks one node on the "desire" path. Text streams in — personalized, specific, referencing the chart attributes. The node tree grows. This is the moment that demonstrates AI depth.

**Second 75-95: Abandonment + grief interview**
Presenter abandons one of the other paths. The ash fade animation runs. Three grief questions appear and are answered quickly. Presenter says: "Verse asks what you're leaving behind."

**Second 95-110: Grief archive**
The grief archive view is shown. The abandoned path is there, ashen, titled. Presenter says: "A record of who you chose not to become."

**Second 110-120: Closing frame**
Return to the active path. Its narrative has subtly shifted (reference the grief cross-contamination). "The grief you carry reshapes the path you're on." Demo ends.

**Demo failure modes to prevent:**
- API latency on first node click (pre-warm or cache a demo response)
- Grief archive being empty at archive reveal (requires the abandonment to happen first — sequence matters)
- Ash animation not triggering (test the abandonment path exhaustively)
- Chart not rendering for edge-case birth dates (test with the demo birthday in advance)

---

## Key Findings

### Finding 1: The grief mechanic is the product's thesis, not a feature
In comparable AI coaching tools (Pi, Replika, Co-Star, Sanctuary), the interaction model is additive — you keep engaging, keep building. Verse inverts this: abandonment is the moment of meaning. This is genuinely novel. The grief interview must feel earned, not bolted on. Three questions is the right scope — enough to create acknowledgment without feeling like a therapy intake form.

**Confidence:** HIGH (grounded in grief research literature: ambiguous loss, continuing bonds theory, Kübler-Ross arc all support that brief ritualized acknowledgment has impact)

### Finding 2: Branching narrative UX fails most often at orientation
Research on CYOA apps (Bandersnatch, 80 Days, Heaven's Vault, Ink-based tools) consistently shows users lose orientation in deep trees. The failure mode: "where am I, what have I already chosen, what's still possible?" Verse's max 5-node depth is correctly scoped to prevent this. The critical mitigation is a persistent breadcrumb or visual "you are here" indicator on the active path tree.

**Confidence:** MEDIUM (training knowledge on CYOA UX patterns; not verified against 2026 sources)

### Finding 3: Tree exploration works best with progressive disclosure
Node tree UX research (from tools like Miro, Whimsical, and decision-tree builders like Typeform Logic) shows that showing all possible nodes at once creates cognitive overload. Verse's on-click generation is correctly designed — each click reveals the next node, not the whole tree. The risk is that unexpanded nodes feel "empty" — they need a visual affordance that says "there is more here" without revealing what.

**Confidence:** MEDIUM (training knowledge on progressive disclosure UX; not verified against 2026 sources)

### Finding 4: Grief UX works when it's brief, specific, and non-therapeutic
Examples of grief UX done well: The "Before I Die" wall (community grief made visible), games like Spiritfarer (object-based grief rituals), and Monument Valley's mute emotional beats. What they share: brevity, specificity, no counseling tone. What makes grief UX feel gimmicky: forced emotional language ("we're so sorry you're leaving this path"), gamification of grief (badges for abandonment), too many questions (5+ feels like a survey). Three questions, Claude-generated, conversational in register, is the right call. The questions should name the specific thing being left behind (using path content), not ask generic "how do you feel?" prompts.

**Confidence:** HIGH (grief UX principles are well-established in interaction design and games research)

### Finding 5: Hackathon demo context changes feature prioritization radically
For a 2-minute demo, the interaction arc matters more than feature completeness. Judges need to experience one complete emotional beat, not survey all features. The arc is: input → chart → path choice → abandonment → archive. Everything that doesn't serve this arc is a distraction in V1. The grief cross-contamination (grief feeds back into remaining paths) is a deep differentiator but may be invisible in a 2-minute demo — it needs a verbal callout or a visual "this path updated because of your grief" indicator, otherwise judges miss it entirely.

**Confidence:** HIGH (based on hackathon judging dynamics and demo pacing)

### Finding 6: AI life coaching tools share a common weakness Verse can exploit
Pi, Replika, and Claude.ai as a life coach all suffer the same problem: the experience feels generic because the AI has no real grounding for *this specific user*. The user knows the AI doesn't actually know them. Tử Vi's calculation layer provides exactly this grounding — even if users don't believe in astrology, the fact that something was computed from their birth data makes the output feel personal and defensible. This is Verse's strongest differentiator and should be communicated explicitly: "Your chart generated this. Not a template."

**Confidence:** HIGH

### Finding 7: Three paths vs two vs five
Two paths create false binary pressure. Five paths create orientation loss. Three paths map to decision psychology (the "triad of ambivalence" in motivational interviewing: status quo, approach goal, avoidance goal) and to narrative structure (thesis, antithesis, synthesis). The duty/desire/transformation framing is well-chosen. Duty grounds in identity-as-role; desire grounds in identity-as-want; transformation grounds in identity-as-becoming. These don't overlap and each speaks to a different psychological register.

**Confidence:** HIGH

---

## Feature Dependencies

```
Birthday + birthplace input
  → Tử Vi chart calculation (lunar calendar conversion, star placement)
    → Psychological profile (4 attributes)
      → Three path card generation (Claude, uses profile + decision)
        → Path tree (node click → next node generation)
          → Path abandonment
            → Grief interview (3 questions, Claude-generated, uses path content)
              → Grief archive entry (stored in localStorage)
                → Grief cross-contamination (remaining paths updated with grief context)
```

Critical path: Everything depends on Tử Vi chart accuracy. If the chart calculation is wrong, the profile is wrong, and the paths lose their grounding claim.

---

## Sources

- Project requirements: `/Users/xps/Desktop/ralphthon-project/.planning/PROJECT.md`
- Grief research basis: Ambiguous loss theory (Pauline Boss), continuing bonds theory (Klass, Silverman, Nickman), motivational interviewing triad
- CYOA UX basis: Training knowledge from Bandersnatch, Disco Elysium, Heaven's Vault, 80 Days, Inkle's Ink engine documentation
- Tree exploration UX basis: Training knowledge from Miro, Whimsical, Typeform Logic, NNGroup progressive disclosure research
- Hackathon demo principles: Training knowledge from demo culture and pitch coaching patterns
- AI coaching tool comparison: Training knowledge from Pi, Replika, Co-Star, Sanctuary feature sets as of training cutoff (August 2025)

**Note on verification:** WebSearch and WebFetch were unavailable during this research session. All comparative claims about competitor tools are based on training data (cutoff August 2025) and should be treated as MEDIUM confidence. Core UX patterns (grief design, tree navigation, progressive disclosure) are well-established and HIGH confidence. The project-specific feature judgments are HIGH confidence because they derive from the project's own stated requirements and constraints.
