# Pitfalls Research: Verse

**Domain:** Vietnamese Tử Vi astrology + Claude API streaming + Framer Motion node trees
**Researched:** 2026-03-28
**Overall confidence:** MEDIUM — web tools unavailable; findings from domain knowledge. Verification against current Anthropic docs and Next.js docs recommended before Phase 1.

---

## Tử Vi Calculation Risks

### Pitfall 1: Lunar-Solar Year Boundary Off-by-One

**What goes wrong:** The Vietnamese lunar new year (Tết) falls between late January and late February. A user born January 20, 1990 is in the lunar year of the Snake (1989), not the Horse (1990). Code that converts Gregorian year → can-chi directly without accounting for the lunar new year date will assign the wrong animal year to anyone born in January or early February.

**Why it happens:** Developers use `year % 12` mapping tables against the Gregorian year rather than the actual lunar year. The lunar year does not start January 1.

**Warning signs:** Test case: birthday January 25, 1985 should be lunar year Giáp Tý (1984 Rat cycle), not Ất Sửu (1985 Ox). If your code returns 1985's animal, the boundary check is broken.

**Prevention:**
- Use a verified lunar calendar lookup table or the `lunar-javascript` npm library (well-maintained for Vietnamese lunar calendar) rather than arithmetic shortcuts.
- The conversion algorithm must use the exact Tết date for each year, not a fixed February 1 approximation. Tết varies by up to 27 days.
- Write a unit test battery covering: Jan 1–Tết-date (wrong Gregorian year), Tết-date–Dec 31 (correct), and the exact Tết day itself.

**Phase to address:** Phase 1 (Tử Vi calculation engine). Test suite required before any UI layer touches date input.

---

### Pitfall 2: Leap Month (Tháng Nhuận) Misassignment

**What goes wrong:** The Vietnamese lunar calendar inserts a leap month (intercalary month) roughly every 2–3 years. A user born on what is labeled "Month 4" in a leap year may actually be in Leap Month 3 or Month 4 proper — and the distinction changes palace assignments and star placements in Tử Vi.

**Why it happens:** Most simplified implementations duplicate the preceding month's number for the leap month and don't track whether the birth month is the leap or regular instance. The leap month has different astrological weight.

**Warning signs:** Check year 2023: it had a leap Month 2 (tháng 2 nhuận). Any birth date in that doubled period where your code gives identical palace outputs for both the leap and regular month is broken.

**Prevention:**
- Represent lunar months as `{ month: number, isLeap: boolean }` tuples throughout the calculation pipeline.
- For the hackathon scope: if the exact leap month distinction is too complex, document the limitation explicitly and scope it out. "Algorithmically exact" is a strong claim — either implement leap month handling correctly or narrow the claim.
- The `lunar-javascript` library handles leap months. Trust it over hand-rolled arithmetic.

**Phase to address:** Phase 1. This is a correctness blocker; do not defer.

---

### Pitfall 3: Birth Hour (Giờ) Boundary — Midnight and Near-Midnight Births

**What goes wrong:** Tử Vi uses the 12 two-hour "Giờ" divisions (Tý, Sửu, ..., Hợi). The Tý hour (Rat hour) spans 11 PM – 1 AM, crossing midnight. A birth at 11:45 PM on December 31 is technically in the Tý hour of January 1. Code that rounds to the nearest hour or truncates by calendar date will assign the wrong Giờ for births near midnight.

**Why it happens:** Timezone conversion + Giờ calculation done in two separate steps without preserving the combined datetime. Birthplace → UTC → local time done correctly, but Giờ lookup uses only the local time component without the date context.

**Warning signs:** Test input: born 11:50 PM in Ho Chi Minh City. Does the system correctly assign Tý (Rat) hour even though the UTC time is the next calendar day?

**Prevention:**
- Keep timezone offset and local datetime together as a single object through the entire Giờ calculation.
- Explicitly test: births at 11:00 PM, 11:59 PM, 12:00 AM, 1:00 AM, 1:01 AM.
- Birthplace → timezone conversion: use a timezone offset lookup (e.g., `Intl.DateTimeFormat` with a Vietnamese locale or a simple UTC+7 hardcode for Vietnam) rather than relying on the browser's local timezone.

**Phase to address:** Phase 1. Add to the unit test suite before proceeding.

---

### Pitfall 4: Historical Calendar Divergence (Pre-1954 Dates)

**What goes wrong:** Vietnam used different calendar reform dates than China. The Vietnamese lunar calendar was officially reformed in 1967 to use the Indochina Time meridian (UTC+7) rather than Beijing Time (UTC+8) for determining month boundaries. Births before 1967, especially at month boundaries, may have different lunar dates under the Vietnamese vs. Chinese computation.

**Why it happens:** Most open-source lunar calendar libraries are written for the Chinese lunar calendar and use the Beijing meridian. They produce correct output for post-1967 dates but wrong output for pre-1967 Vietnamese births.

**Warning signs:** Test a birth date of January 30, 1930 — results should differ between a Chinese lunar library and a Vietnamese-specific implementation.

**Prevention:**
- For hackathon scope: declare "valid birth years: 1967–present" in the UI. This removes historical ambiguity without losing 95% of your user base (people born before 1967 are 59+ and unlikely to be your primary demo audience).
- If supporting pre-1967, use a Vietnamese-specific source (not a general Chinese lunar converter) and add a prominent confidence caveat in the UI.

**Phase to address:** Phase 1. Scope decision must be made before building the conversion function.

---

### Pitfall 5: The "Exact" Claim Creates a Credibility Trap

**What goes wrong:** The project description says "algorithmically exact." If a Vietnamese user (especially diaspora with family knowledge of Tử Vi) inputs their chart and sees a star in the wrong palace, they will dismiss the entire tool. The psychological profile built on a wrong chart invalidates the AI narrative layer. One incorrect chart destroys trust in the whole experience.

**Why it happens:** Overconfident implementation without validation against known-correct charts.

**Warning signs:** No validation against a trusted Tử Vi source during development.

**Prevention:**
- During development, take 3–5 real birth dates with known-correct Tử Vi charts (from a Vietnamese astrologer or validated app like Tử Vi Kinh Dịch) and verify your output matches.
- Consider adding a "verify your chart" escape hatch in the UI: show the star/palace grid so a knowledgeable user can spot-check. This turns "exact" into a feature rather than a liability.

**Phase to address:** Phase 1 validation gate. Do not proceed to AI narrative layer until chart output is verified against reference.

---

## Claude API Risks

### Pitfall 1: Vercel/Next.js Route Handler Timeout on Long Streaming Requests

**What goes wrong:** Vercel's Edge Runtime and Serverless Functions have execution time limits. Hobby tier: 10 seconds. Pro tier: 60 seconds. Edge runtime: no timeout, but has memory and cold-start constraints. A multi-paragraph narrative generation for three paths may stream for 30–90 seconds total (especially if paths are generated sequentially). The function times out mid-stream, leaving the UI in a broken partial state.

**Why it happens:** Next.js App Router API routes default to the Node.js runtime with a 60s max. Branch-on-branch generation (user clicks node → generate 3 children) compounds this if awaited synchronously.

**Warning signs:** Works locally (no timeout), breaks in Vercel preview deployment.

**Prevention:**
- Use `export const maxDuration = 60` (Pro) or switch to Edge Runtime with streaming for unbounded execution.
- For the hackathon: self-host on a local machine or use a Railway/Render deployment without Vercel's timeout constraints. Demo from localhost with an ngrok tunnel if needed — this is a legitimate demo-proofing strategy.
- Stream each path independently in parallel rather than sequentially. Three concurrent 15-second streams beat one 45-second sequential stream.
- Set `export const runtime = 'edge'` on the route handler for streaming routes — Edge Runtime has no execution timeout (just memory limits).

**Phase to address:** Phase 2 (Claude integration). Test with Vercel preview before demo day; do not discover this on demo day.

---

### Pitfall 2: Streaming Breaks in Next.js App Router Without Proper Headers

**What goes wrong:** Next.js API routes need explicit streaming configuration. Without `TransformStream` or the Vercel AI SDK's `StreamingTextResponse`, the response buffers and delivers all at once — defeating the animation effect entirely.

**Why it happens:** Using `res.write()` (Pages Router pattern) in App Router, or returning a `Response` object without correct `Content-Type: text/event-stream` and `Cache-Control: no-cache` headers.

**Warning signs:** Stream arrives in one chunk in the browser even though the API route uses streaming internally. Network tab shows a single large response rather than chunked delivery.

**Prevention:**
- Use the Vercel AI SDK (`ai` package) with `StreamingTextResponse` — it handles headers, encoding, and cross-runtime compatibility correctly.
- Alternatively: return `new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } })`.
- Test with the browser's network tab on the "EventStream" view, not just by watching the UI animate.

**Phase to address:** Phase 2. First integration task; verify streaming works before adding any narrative complexity.

---

### Pitfall 3: Token Cost Explosion from Branching Generation

**What goes wrong:** The tree is 5 nodes deep, 3 paths. Each node click generates 3 children. Worst case (user clicks all branches): 3 paths × nodes at each level = the tree fans out combinatorially. If each generation request includes the full prior narrative for context (to maintain coherence), token input costs grow quadratically with depth.

**Why it happens:** Naive implementation passes the entire conversation history with each generation request to maintain coherence.

**Prevention:**
- Pass only the path spine (current branch ancestry, not sibling branches) as context.
- Cap context per request: system prompt + chart profile (≤500 tokens) + direct ancestor chain (≤300 tokens per node × depth). This bounds each request to ~2000 input tokens at maximum depth.
- Use `max_tokens` cap on output: narrative nodes do not need to be novels. 150–250 tokens per node is sufficient for the demo.
- For hackathon: add a hard `MAX_NODES_GENERATED = 15` guard per session. Display a "session limit reached" message rather than silently failing.

**Phase to address:** Phase 2. Token budget design before writing any prompts.

---

### Pitfall 4: Rate Limits During Live Demo

**What goes wrong:** During a live demo, the judge asks to see the app again or a second person tests it. Multiple simultaneous generation requests hit the API rate limit (requests per minute). The second request receives a 429 error and the UI shows a blank or broken state.

**Why it happens:** Claude API rate limits on lower tiers can be as low as 5 requests per minute (Tier 1) for Sonnet models. A branching demo with 3 simultaneous path generations is already 3 RPM per user action.

**Warning signs:** Rate limit errors appear in the Vercel function logs or browser console but not visibly in the UI.

**Prevention:**
- Implement exponential backoff with retry (max 3 retries) in the API call layer.
- For the demo: pre-generate one complete tree on a known "demo birthday" (a specific date you've verified produces a compelling chart). Store the pre-generated result in a JSON file. If the API fails, fall back to the pre-generated content. Judges don't know the difference.
- Display a graceful "generating..." state that doesn't look like an error if the first attempt is delayed.
- Upgrade API tier before the hackathon if possible.

**Phase to address:** Phase 2 (API integration) + Phase 4 (demo hardening). The fallback JSON is a Phase 4 task.

---

### Pitfall 5: Grief Feedback Loop Increases Prompt Complexity to Failure Point

**What goes wrong:** The grief interview responses are supposed to "subtly reshape" remaining active paths. This requires the remaining path generation to receive grief data as context. If grief context is naively concatenated into prompts, prompts become long, incoherent, and the model's narrative becomes noticeably different (not subtle) — or the model starts producing generic trauma-processing language rather than path-specific narrative.

**Why it happens:** Unstructured grief injection ("The user felt X and Y and Z about the abandoned path") doesn't give the model a clear behavioral instruction.

**Prevention:**
- Pass grief as structured influence signals, not raw text: `{ abandoned_path: "duty", grief_themes: ["safety", "expectation"], inflection: "softer on security, bolder on risk" }`.
- Write grief integration as a system prompt modifier, not a user message addition. Keep it to ≤100 tokens.
- Test grief injection specifically: generate a path without grief data, then with grief data, and verify the output differs in tone but not structure.

**Phase to address:** Phase 3 (grief mechanic). Design the grief data schema before implementing the interview.

---

## Animation/Performance Risks

### Pitfall 1: Framer Motion Re-Renders the Entire Tree on Each Node Expansion

**What goes wrong:** When a user clicks a node and 3 children animate in, React re-renders the parent component. If the node tree is stored as a nested object in component state and Framer Motion's `AnimatePresence` is applied at the root level, every existing node gets a re-render and potentially re-triggers its entry animation.

**Why it happens:** Unstable `key` props on animated nodes, or `AnimatePresence` placed too high in the component tree.

**Warning signs:** Previously rendered nodes flicker or re-animate when new nodes appear. CPU usage spikes noticeably on node expansion.

**Prevention:**
- Give each node a stable, immutable `key` derived from its path position (e.g., `path-0-node-2-3`), never from array index.
- Use `AnimatePresence mode="popLayout"` only around the children container, not the entire tree.
- Memoize individual node components with `React.memo` so they don't re-render when siblings update.
- Keep the tree state as a flat map (`{ [nodeId]: NodeData }`) with parent-child references rather than nested objects. This makes React's reconciliation more predictable.

**Phase to address:** Phase 2/3 (node tree implementation). Establish the component architecture before adding Framer Motion.

---

### Pitfall 2: SVG Line Connections Between Nodes Are Not Animated Correctly

**What goes wrong:** Verse's "incense smoke node branching" aesthetic implies animated connector lines between nodes. SVG path animations in Framer Motion require the SVG paths to have the same number of points for morphing, and `pathLength` animations require `stroke-dasharray`/`stroke-dashoffset` setup. Naive implementation produces janky line drawing or incorrect path shapes.

**Why it happens:** Using `initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}` without properly setting `stroke-dasharray: "1"` and `stroke-dashoffset: "1"` via CSS (or the Framer Motion `style` prop).

**Warning signs:** Lines appear instantly rather than drawing, or the drawing animation jumps/stutters.

**Prevention:**
- Use `<motion.path>` with `initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}`.
- Apply `style={{ pathLength }}` where `pathLength` is a `useMotionValue` for imperative control if lines need to respond to interaction.
- For smoke-like organic lines, consider a CSS clip-path reveal on a semi-transparent `<div>` rather than SVG path animation — it's simpler and more reliable for hackathon speed.
- Fallback: simple CSS `scaleX` transition on a line element is enough to convey connection drawing without SVG complexity.

**Phase to address:** Phase 2/3. Decide on the connector line approach early; SVG animation is a rabbit hole at hackathon speed.

---

### Pitfall 3: `layout` Prop Causes Layout Thrash on Deep Trees

**What goes wrong:** Framer Motion's `layout` prop enables automatic layout animations (nodes shift position smoothly when siblings appear). On a tree with 15+ nodes, `layout` triggers a FLIP animation on every visible node whenever any node is added. This causes a measurable frame rate drop on mid-range hardware.

**Why it happens:** `layout` forces a synchronous layout measurement for every animated element before each frame.

**Warning signs:** Demo machine shows smooth animation; judge's laptop stutters. 60 FPS drops to 20 FPS when the tree has more than 10 nodes visible.

**Prevention:**
- Use `layout` sparingly — only on the immediate container of new children, not on individual node components.
- For nodes that don't need to shift (because children appear below/beside without displacing parents), omit `layout` entirely.
- Test on a less powerful machine than your dev machine before demo day.
- If performance is marginal, add a `prefers-reduced-motion` CSS media query that disables Framer Motion animations entirely — this is also good accessibility practice.

**Phase to address:** Phase 3 (tree visualization). Add a performance budget check (Chrome DevTools performance tab, 15 nodes expanded) before finalizing animation approach.

---

### Pitfall 4: Abandoned Path "Fade to Ash" Animation Leaks Memory

**What goes wrong:** When a path is abandoned, the nodes animate to a desaturated/faded state and are added to the grief archive. If the animated components are not unmounted (just visually hidden via opacity: 0), their Framer Motion springs and timers continue to run in memory. After 2–3 abandoned paths, the page accumulates dozens of active animation subscriptions.

**Why it happens:** Using `opacity: 0` / `scale: 0.9` via `animate` to hide rather than `AnimatePresence` exit animations followed by unmounting.

**Warning signs:** Memory usage in Chrome DevTools grows each time a path is abandoned. `getAnimations()` in the console returns a large and growing list.

**Prevention:**
- Use `AnimatePresence` with an exit animation for abandoned path nodes — let them animate out, then unmount.
- Move abandoned path data to the localStorage grief archive immediately, and render the grief archive view from localStorage (not from retained tree state) to keep the live component tree small.

**Phase to address:** Phase 3. Design the abandoned-path state management before implementing the grief mechanic.

---

## Hackathon Demo Risks

### Pitfall 1: Live Birthday Input Produces a Boring Chart

**What goes wrong:** The demo involves typing a birthday live. If the judge's birthday (or the demo birthday you type) happens to produce a Tử Vi chart with unremarkable star placements, the psychological profile is generic and the three paths feel interchangeable. The "magic moment" — when the chart feels uncannily accurate — does not land.

**Why it happens:** Tử Vi chart output quality (for narrative purposes) varies significantly by birth data. Some charts are "richer" for storytelling than others.

**Warning signs:** You demo with your own birthday and the profile feels flat. You haven't pre-vetted which birthdays produce compelling outputs.

**Prevention:**
- Before the hackathon, identify 3 "high-drama" birthdays that produce compelling profiles (interesting palace dominance, strong risk stars, clear tension). Memorize these dates.
- Have a "demo birthday" ready that you know produces a great output. Use it confidently; judges do not know it's pre-selected.
- Prepare a brief spoken framing: "Let's use a specific date that shows the full range of the system..." This is honest and removes the risk of a weak live chart.

**Phase to address:** Phase 4 (demo hardening). Dedicate a session to "birthday archaeology" — testing 10–20 birth dates for chart richness.

---

### Pitfall 2: API Call Fails Silently During Demo

**What goes wrong:** The Claude API call fails (rate limit, timeout, network issue). The UI shows a blank/spinning state. Demo grinds to a halt. Silence is worse than a graceful error message.

**Why it happens:** Error states not designed for the demo context. Developers design happy paths; demo failures are assumed to be "just bad luck."

**Prevention:**
- Implement a pre-generated fallback. Before the hackathon day, generate a complete tree for the "demo birthday" and save it as `public/demo-fallback.json`. If the API returns an error, load the fallback transparently.
- Add a keyboard shortcut (e.g., `Cmd+Shift+D`) that instantly loads the pre-generated demo state. Tell no one. Use it if anything breaks.
- The fallback should be indistinguishable from a live generation — same animation sequence, same timing, same text. Implement the fallback as "replay of a recorded generation."
- Show a visible, aesthetically consistent "composing your path..." loading state so any delay reads as intentional, not broken.

**Phase to address:** Phase 4. Non-negotiable before demo day.

---

### Pitfall 3: The Grief Interview Interrupts Demo Flow at the Wrong Moment

**What goes wrong:** Demos work best with a single continuous forward arc. The grief interview (3 questions after abandoning a path) adds an unexpected conversational detour. If a judge triggers it accidentally or the demo presenter abandons a path to show the feature, the interview breaks the visual momentum and can feel like an error state.

**Why it happens:** Grief interview is a secondary feature that requires deliberate setup to demo well, but its trigger (abandoning a path) is easy to hit accidentally.

**Prevention:**
- Practice the demo script explicitly: know exactly which moment you choose to abandon a path, what you say during the interview, and how you return to the main tree. The transition must feel smooth, not jarring.
- Make the grief interview dismissible (ESC key, or a visible "continue" option) so if a judge accidentally triggers it, you can exit gracefully.
- Consider having the grief interview fire only after a confirmation step during the demo (tap once to select abandon, tap twice to confirm) — reduces accidental triggers without changing the intended UX.

**Phase to address:** Phase 3 (grief mechanic design) + Phase 4 (demo rehearsal).

---

### Pitfall 4: localStorage State Corruption Persists Between Demo Sessions

**What goes wrong:** You demo the app once. The localStorage grief archive has entries from the first demo run. The second demo (for a different judge group) starts with a "pre-grieved" state — paths are already influenced by grief from a session the judges never saw. The experience is confusing and feels broken.

**Why it happens:** localStorage persists across page refreshes and isn't cleared between sessions.

**Prevention:**
- Add a "New Session" or "Reset" button that clears localStorage and reinitializes the app. Position it prominently in the UI during the demo (can be de-emphasized post-hackathon).
- Better: add a `?reset` URL parameter that clears all state on load. Navigating to `localhost:3000?reset` before each demo is a reliable reset ritual.
- Test the reset flow explicitly. "Works on first load" and "works after reset" are different code paths.

**Phase to address:** Phase 2 (localStorage implementation). Build reset from day one.

---

### Pitfall 5: Desktop-Only Layout Breaks on Demo Projector Resolution

**What goes wrong:** The app is built and tested on a 2560×1440 display. The demo projector outputs 1024×768 or 1920×1080. The node tree overflows horizontally. The Vietnamese lacquerware aesthetic depends on proportions that break at unexpected viewport sizes.

**Why it happens:** Desktop-first development without a fixed viewport target.

**Prevention:**
- Choose a canonical demo resolution: 1440×900 (13-inch MacBook standard). Build and test primarily at this size.
- Test at 1280×800 (minimum projector scenario) before demo day. Fix layout breaks at this size.
- For the node tree: use `overflow-x: scroll` with a horizontal scroll indicator rather than letting nodes overflow invisibly.

**Phase to address:** Phase 3/4. Add a pre-demo resolution check to the QA checklist.

---

## AI Narrative Quality Risks

### Pitfall 1: Generic AI Prose Destroys the "Mirror" Effect

**What goes wrong:** Claude generates paths that sound like a horoscope app or a self-help book. "In the Path of Duty, you will find yourself drawn to sacrifice for others, discovering that true fulfillment comes from giving..." This is hollow. The "tender mirror" effect requires the language to feel specific to this person, not universally applicable to anyone.

**Why it happens:** Underconstrained prompts. The psychological profile from the chart is passed as data but the model isn't instructed to anchor its prose in specific, concrete imagery from that profile.

**Warning signs:** You can swap the chart data in the prompt and the output barely changes. The three paths feel like three flavors of the same sentiment.

**Prevention:**
- Prompt engineering requirement: the system prompt must instruct Claude to ground every sentence in the specific stars and palaces from the chart. "The Mệnh palace under Tham Lang means..." must produce concrete, specific language, not generic psychological vocabulary.
- Use a "prove it" prompt test: generate two paths with completely different chart profiles and verify the prose is meaningfully different in texture, not just in the archetype label.
- Avoid the word "journey" in all prompts and outputs. Prohibit self-help clichés at the system prompt level: "Do not use: journey, path (as metaphor), fulfillment, purpose, authentic, transform, discover yourself."
- Structure the prompt to produce specific life scenarios, not abstract psychological observations. "At 34, you are offered a position in Hanoi..." beats "You may face opportunities for growth in your career."

**Phase to address:** Phase 2 (first prompt drafts). Run the "prove it" test before any UI work depends on the narrative layer.

---

### Pitfall 2: Three Paths Feel Symmetric and Interchangeable

**What goes wrong:** Duty, Desire, Transformation are the three archetypal tensions. If the prompts for all three follow the same structural template (intro → mid-life inflection → outcome), the three paths feel like color swaps rather than genuinely divergent futures. The choice between them feels arbitrary.

**Why it happens:** Consistent template is comfortable to implement but produces sameness.

**Prevention:**
- Give each archetype a distinct narrative texture, not just a different theme:
  - Duty: third-person-adjacent, institutional framing, timelines anchored to external milestones (family ages, company events)
  - Desire: sensory, spatial, present-tense moments
  - Transformation: discontinuous structure — a before and after with a gap the user must imagine crossing
- Vary sentence rhythm and length by archetype. Duty = longer, denser sentences. Desire = short, vivid. Transformation = fragmented then expansive.
- Instruct Claude to make the three paths incompatible in concrete ways (not just different in spirit): specific place names, specific relationships, specific trade-offs that are mutually exclusive.

**Phase to address:** Phase 2. This is a prompt architecture decision, not a late-stage polish decision.

---

### Pitfall 3: Grief Interview Produces Therapy-Adjacent Language

**What goes wrong:** The grief interview is designed to be tender and conversational. But Claude defaults to supportive, therapeutic language when responding to emotional content: "That sounds really hard. It makes sense that you'd feel that way." This reads as generic chatbot empathy, not as a meaningful ritual of letting go.

**Why it happens:** Claude's training heavily weights empathetic, non-judgmental responses for emotionally coded inputs. Without explicit counter-instruction, the default register is supportive counselor.

**Warning signs:** Grief interview responses contain: "It makes sense," "That sounds hard," "You should be proud," "Take care of yourself."

**Prevention:**
- System prompt for grief interview: "You are not a therapist. You are a witness. You do not validate or comfort. You observe and record. Respond in the voice of a quiet archivist who is noting what is being laid down, not consoling the person laying it down."
- Test: Does the grief response mention what the user actually said? Does it name specific things being abandoned? If it's generic, the prompt is underspecified.
- The grief archive entry (stored in localStorage) should be a compression of what was grieved, not a validation of the user's feelings. Keep the archive entries poetic and spare, not therapeutic.

**Phase to address:** Phase 3 (grief mechanic). Prompt for grief interview is a separate prompt engineering task from path generation.

---

### Pitfall 4: Grief Influence Is Either Invisible or Heavy-Handed

**What goes wrong:** When grief from an abandoned path "subtly reshapes" remaining paths, the subtlety is hard to calibrate. Either the influence is so subtle no one notices it (feature doesn't land), or the model interprets the grief injection as license to dramatically alter the narrative (suddenly the remaining paths are all about loss).

**Why it happens:** "Subtle" is not an instruction. The model needs a behavioral specification, not a tone directive.

**Prevention:**
- Define grief influence as lexical bleeding, not narrative restructuring: if the abandoned Duty path's grief themes were "safety" and "family expectation," the remaining paths should have slightly more frequent imagery from those semantic fields — but should not reorganize around them.
- Implement grief influence as a ≤50-token addition to the system prompt: `[Grief context: a path of {duty/desire/transformation} was abandoned; the user named {theme A} and {theme B} as what was lost. Let these themes appear as occasional echoes in remaining paths — a word choice, an image — but do not alter the arc.]`
- Test grief influence by diffing outputs with and without grief injection. The difference should be detectable but not the first thing you notice.

**Phase to address:** Phase 3. Define the grief influence schema before writing the grief interview.

---

### Pitfall 5: The Tử Vi Profile Becomes a Zodiac Disclaimer

**What goes wrong:** The psychological profile extracted from the chart is supposed to ground the AI generation. But if the profile text is displayed to the user as a list of star names and palace descriptions ("Your Mệnh palace is governed by Tham Lang, indicating..."), it reads like a generic astrology translation. The "Tử Vi as psychological engine" framing collapses into "here's your horoscope."

**Why it happens:** Displaying raw chart data rather than a synthesized psychological interpretation. The psychological layer is skipped.

**Prevention:**
- Never display raw star names or palace terms in the UI without a synthesized English interpretation.
- The profile passed to Claude must be a psychological synthesis, not a translation: "Dominant risk-taking pattern, relational ambivalence, strong ambition structure in tension with loyalty obligations" — not "Tham Lang in Mệnh, Thất Sát in Phúc Đức."
- However: show the chart grid visually (palace/star layout) as a separate "source" artifact. This creates credibility without requiring users to decode it. "Here's the chart. Here's what it means about you."
- The synthesis step (chart → profile) is a Claude call, not a lookup table. Prompt Claude with the raw star placements and ask for a 3-sentence psychological synthesis in plain English. This becomes the foundation for path generation.

**Phase to address:** Phase 1/2 boundary. The chart → profile synthesis is the bridge between the calculation engine and the AI narrative layer.

---

## Phase-Specific Warning Summary

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|----------------|------------|
| Phase 1 | Lunar calendar conversion | Year boundary off-by-one for Jan/Feb births | Unit test with Tết-boundary dates before any UI |
| Phase 1 | Leap month handling | Duplicate month number assigned incorrectly | Use `{ month, isLeap }` tuples; validate with reference charts |
| Phase 1 | Birth hour calculation | Midnight boundary in Giờ assignment | Test 11 PM, 12 AM, 1 AM edge cases explicitly |
| Phase 1 | Historical dates | Pre-1967 calendar divergence | Scope to 1967-present or use Vietnamese-specific library |
| Phase 1 | "Exact" credibility | Wrong chart destroys user trust | Validate against 3–5 known-correct reference charts |
| Phase 2 | Streaming in Next.js | Vercel timeout on long generation | Use Edge Runtime or self-host; test on Vercel preview early |
| Phase 2 | Streaming headers | Response buffers instead of streams | Use Vercel AI SDK `StreamingTextResponse` |
| Phase 2 | Token costs | Quadratic context growth with branching | Cap context to spine-only; set `max_tokens`; add session guard |
| Phase 2 | Rate limits at demo | 429 errors during live demo | Pre-generate demo fallback JSON; implement retry backoff |
| Phase 2 | Narrative quality | Generic AI prose | "Prove it" test: swap chart data, verify output changes meaningfully |
| Phase 2 | Path differentiation | Three paths feel symmetric | Different structural templates per archetype, not just different themes |
| Phase 3 | Tree re-renders | Framer Motion re-animates entire tree | Stable `key` props; `React.memo` on nodes; flat state map |
| Phase 3 | SVG connector lines | Path animation doesn't draw correctly | Use `pathLength` with dasharray; fallback to CSS scaleX |
| Phase 3 | Layout animation perf | `layout` prop causes frame drops at 15+ nodes | Scope `layout` to children containers only; test on slower hardware |
| Phase 3 | Memory leak on abandon | Hidden animated nodes retain subscriptions | Unmount via `AnimatePresence` exit; read grief archive from localStorage |
| Phase 3 | Grief interview register | Therapy-adjacent language | "Witness not therapist" prompt instruction |
| Phase 3 | Grief influence calibration | Too subtle or too heavy | Define as lexical bleeding, not narrative restructuring; diff test |
| Phase 3 | Chart display | Raw star names read as horoscope | Synthesize to plain-English psychological profile via Claude |
| Phase 4 | Demo birthday | Live chart is uncompelling | Pre-identify 3 "high-drama" birthdays; use one confidently |
| Phase 4 | API failure during demo | Silent blank state | Pre-generated fallback JSON + hidden keyboard shortcut to load it |
| Phase 4 | Grief interview demo | Accidental trigger interrupts flow | Two-tap confirm; dismissible with ESC; rehearse the script |
| Phase 4 | localStorage pollution | Prior session state bleeds into new demo | `?reset` URL parameter; "New Session" button |
| Phase 4 | Projector resolution | Layout breaks at 1280×800 | Test at 1280×800 explicitly; fix horizontal overflow |

---

## Sources

**Confidence notes:**
- Tử Vi calculation: MEDIUM confidence. Based on knowledge of Vietnamese lunar calendar algorithms, the `lunar-javascript` library behavior, and general calendar conversion literature. Verification against the library's documentation and 2–3 known-correct charts recommended.
- Claude API streaming: MEDIUM confidence. Based on knowledge of Vercel runtime limits and Anthropic streaming patterns as of early 2025. Verify current Vercel timeout limits and Anthropic rate limits (both change with tier adjustments) against current official docs before Phase 2.
- Framer Motion: HIGH confidence. Animation performance pitfalls are stable and well-documented in the Framer Motion GitHub issues and community.
- Hackathon demo risks: HIGH confidence. These are observed patterns across hackathon demos, not speculative.
- AI narrative quality: HIGH confidence. Prompt engineering failure modes are consistent across use cases and directly applicable here.

**Recommended verification before Phase 1:**
- Anthropic API rate limits (current tier): https://docs.anthropic.com/en/api/rate-limits
- Vercel function timeouts by plan: https://vercel.com/docs/functions/runtimes
- `lunar-javascript` npm package documentation and Vietnamese calendar support
- Framer Motion `layout` performance: https://www.framer.com/motion/layout-animations/
