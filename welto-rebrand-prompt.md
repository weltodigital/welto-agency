# WELTO Rebrand Implementation

You are rebranding the WELTO Digital website (a UK local SEO agency for trades businesses). This is a full visual and copy overhaul — not a tweak. The current site feels cheap and template-driven; the new direction is dark, confident, and considered.

Work through this in phases. After each phase, stop and summarise what you changed so I can review before you move on. Do not attempt all phases in a single pass.

---

## Brand foundations (apply throughout)

### Colour tokens
Set these as CSS custom properties on `:root` and use them everywhere. No raw hex values in component code.

```css
--ink: #0A0A0A;          /* Primary dark surface */
--ink-elevated: #1A1A18; /* Cards, elevated surfaces on dark */
--ink-border: #2A2A28;   /* Hairline borders on dark */
--bone: #F5F4F0;         /* Light surface, body text on ink */
--bone-muted: #C8C7C0;   /* Body text on dark backgrounds */
--mute: #888780;         /* Secondary/tertiary text */
--signal: #E8FF4D;       /* Accent — CTAs, highlights, logo dot */
```

**Critical discipline on Signal yellow:** it appears on the logo dot, primary CTA buttons, one highlighted word in the hero, and eyebrow labels above sections. Nowhere else. No yellow borders, no yellow icons, no yellow hover states on links. If you find yourself reaching for it a fifth time on a page, stop.

**Body text on dark backgrounds must be `--bone-muted` (#C8C7C0), never pure white.** Pure white on near-black vibrates and looks unprofessional.

### Typography
Use **Inter** from Google Fonts (`https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap`) or rsms.me/inter. Only load weights 400 and 500. Do not load 300, 600, 700, or italic variants.

Type scale:
- Display (hero h1): 52px / 1.02 / weight 500 / letter-spacing -0.035em
- H2: 36px / 1.1 / weight 500 / letter-spacing -0.03em
- H3: 24px / 1.25 / weight 500 / letter-spacing -0.02em
- Body large: 18px / 1.55 / weight 400
- Body: 16px / 1.6 / weight 400
- Small: 13px / 1.55 / weight 400
- Eyebrow: 11px / weight 500 / letter-spacing 0.14em / uppercase

**Sentence case for all headings.** Never Title Case. Never ALL CAPS except eyebrows.

### Spacing
Use an 8px base grid. Section vertical padding: 96px desktop, 64px tablet, 48px mobile. Container max-width: 1200px with 32px gutter.

### Buttons
- **Primary:** Signal yellow background, ink text, 14px/500, padding 14px 22px, border-radius 6px, trailing arrow "→". One per screen maximum.
- **Secondary:** Transparent background, bone text, 1px solid `--ink-border`, same padding and radius. No arrow.
- **Tertiary (inline link):** Bone text, 1px Signal yellow underline with 4px underline-offset. Trailing "↗" if external.

### Imagery
**Remove all existing icon PNGs** (`local seo icon.png`, `local seo icon 1.png`, `local seo icon copy.png`, etc.). Do not replace them with stock icons. The new visual system uses type, colour, and whitespace — not decorative icons. The only retained imagery is the results screenshot (`weltoresults.webp`) which goes in the case study section.

If a section feels visually empty after removing an icon, the answer is more whitespace, not a replacement graphic.

---

## Phase 1 — Foundations & shared components

1. Set up the colour tokens, typography, and spacing system in the global stylesheet.
2. Replace the existing logo with a new wordmark:
   - Text "WELTO" in Inter 500, letter-spacing -0.04em
   - A small Signal-yellow dot (4–8px depending on context) positioned to the right of the "O", vertically centred against the cap-height baseline
   - Provide light-mode and dark-mode variants
   - Delete the old `WELTO LOGO copy.png`
3. Build the button components (primary, secondary, tertiary) as reusable React components.
4. Build a shared `Section` wrapper component with the eyebrow + heading + body pattern (eyebrow optional).
5. Update the header navigation: simplify to logo + nav links + primary CTA. Add a hairline border-bottom on `--ink-border`. Remove the "Industries" anchor link from nav (it's a long page, not a section worth jumping to).

**Stop here and summarise.**

---

## Phase 2 — Homepage hero

Replace the entire current hero. The new hero is on `--ink` background.

**Eyebrow:** "Local SEO for UK trades"

**Headline:** "More booked jobs from `local search.`" — where "local search." has a Signal-yellow highlight background (padding 0 8px, border-radius 4px, ink text).

**Subhead:** "We help electricians, plumbers and roofers rank in the map pack and turn local searches into work. Month-to-month, no jargon."

**CTAs:** One primary button "Get your free audit →". Next to it, a small line of text: "or [see Mitchell Electrical's results]" where the bracketed text is a tertiary link to the case study section.

**Proof bar below CTAs** (separated by a hairline top border, 28px padding-top): three inline items in `--mute` colour:
- "**120+** trades businesses" (the number in `--bone` weight 500)
- "**£2M+** attributed revenue"
- "**Gas Safe**, NICEIC partners"

**Remove entirely:**
- The tick-mark bullet list ("Get More Emergency Calls" etc.)
- The duplicate "Schedule Consultation" button
- The "local seo icon.png" image

**Stop here and summarise.**

---

## Phase 3 — Services section

The current services section has ten near-identical cards. Cut it to **three** primary services. The other capabilities become bullet points within these three.

Eyebrow: "What we do"
Heading: "Three things, done properly."

Three cards on `--ink-elevated` background, 1px `--ink-border`, border-radius 12px, padding 32px:

1. **Get found locally** — Google Business Profile, map pack rankings, local citations, schema. (Was: "Local SEO Optimization" + "Reputation Management")
2. **Rank for the right searches** — Keyword strategy targeting commercial intent, competitor analysis, content for service and area pages. (Was: "Keyword Research" + "Content Marketing")
3. **Turn visits into jobs** — Site speed, mobile UX, conversion optimisation, call tracking and lead attribution. (Was: "Website Optimization" + "Analytics & Reporting")

Each card: H3 title, short paragraph (~2 sentences), then 3–4 short bullet points in `--mute` with a Signal-yellow `·` separator or small dot bullet.

**Stop here and summarise.**

---

## Phase 4 — Case study (replaces "Real Results" + guarantee section)

**Delete the entire "Guaranteed Rankings, or We'll Work for Free" section.** This is the single biggest trust-damaging element on the current site.

Build a named case study block on `--ink` background:

Eyebrow: "Case · Mitchell Electrical"
Heading: "From 4 leads a week to 18 in three months."

Three large stat tiles in a row (use the pattern from the brand pack — 36px numbers in `--bone` weight 500, letter-spacing -0.03em; 12px labels in `--mute`):
- "+312%" / "Organic clicks, 6 months"
- "4 → 18" / "Leads per week"
- "#1" / '"Electrician Portsmouth"'

Below the stats (separated by a hairline `--ink-border`, 24px padding):
- A pullquote in italic, 18px, `--bone-muted`: *"Within three months we'd doubled the bookings and stopped paying for Google Ads entirely."*
- Attribution: "Dave Mitchell · Mitchell Electrical, Portsmouth" — in `--mute`, 13px

Below that, place the existing `weltoresults.webp` screenshot with a small caption in `--mute`: "Search Console data, Mitchell Electrical · Mar–Sep 2025"

**IMPORTANT:** Mark Dave Mitchell / Mitchell Electrical as a placeholder. Add an HTML comment `<!-- PLACEHOLDER: Replace with real client name, real quote, and signed permission before publishing. -->` Ed needs to provide the real client details or remove this section before launch.

**Stop here and summarise.**

---

## Phase 5 — Industries section

Keep this section (it's important for SEO and matches the trades positioning) but redesign:

Eyebrow: "Who we work with"
Heading: "Specialist SEO for ten trades."

Replace the ten card grid with a tighter list layout: a 2-column grid (1-column on mobile), each item is just the trade name as a large link (24px, weight 500, `--bone`) with a small `→` arrow on hover, and a one-line description in `--mute` underneath. No card backgrounds, no quoted keyword examples, no decorative icons. Just type and whitespace.

Keep the existing URLs pointing to the individual `/seo-electrician/`, `/seo-plumber/` etc. pages.

**Stop here and summarise.**

---

## Phase 6 — Why WELTO section

Replace the current "Why Choose WELTO" section. Cut the four bullet points down to three and rewrite:

Eyebrow: "Why WELTO"
Heading: "Built for trades. Priced for trades."

Three short blocks (no cards, just type), each with a bold lead line and a short paragraph:

1. **We only work with trades.** Every strategy, every page template, every piece of content is built around how people actually search for electricians, plumbers and roofers. Generic SEO agencies miss this.

2. **Month-to-month.** No 12-month contracts, no setup fees, no exit penalties. If we're not earning our keep, you walk.

3. **Real numbers, not vanity metrics.** Monthly reports show leads, calls and attributed revenue — not just rankings and traffic.

**Delete the stat block** (5+ Years / 120+ Projects / £2M+ / 95%). These numbers now live in the proof bar under the hero and in the case study. Repeating them dilutes them.

**Stop here and summarise.**

---

## Phase 7 — Final CTA + footer

**Final CTA section** on `--ink` background:

Eyebrow: "Get started"
Heading: "Find out how much local business you're missing."
Body: "Free 30-minute audit. We'll show you exactly where you rank, where your competitors rank, and the three highest-leverage changes for the next 90 days."
Single primary CTA: "Book your audit →"
Below in `--mute`: "No sales pitch. No contracts. Email info@weltodigital.com if you'd rather not book."

**Footer:** Keep the existing footer link structure (Industries / Cities / Counties / Resources) — it's solid for SEO. Restyle to match the new system: `--ink` background, `--mute` link colour, `--bone` on hover, no underlines except on hover, 32px section gaps, hairline divider above the copyright line.

Update the footer logo to the new wordmark.

**Stop here and summarise.**

---

## Phase 8 — Copy audit pass

Run a final pass across every page and:

1. **Remove every instance of "dominate" / "dominating" / "dominate your market"** and rewrite the surrounding sentence. Current site uses these words 5+ times.
2. **Fix UK/US spelling inconsistencies.** All "optimization" → "optimisation", "Optimization" → "Optimisation". The codebase mixes both.
3. **Rename image files with spaces.** `WELTO LOGO copy.png` and `local seo icon copy.png` should not exist anywhere (they're being deleted anyway, but check for stragglers in `/public`).
4. **Sentence case all headings.** No Title Case anywhere.
5. **Check the meta title and description.** Current: "Local SEO Agency UK | WELTO - Expert Local Search Marketing for Trades". New: "WELTO · Local SEO for UK trades businesses". Meta description: "Local SEO for electricians, plumbers, roofers and other UK trades. Month-to-month, no jargon, real lead attribution. Free audit available."

**Stop here and summarise.**

---

## What "done" looks like

When you've finished all phases, the site should:
- Use only `--ink`, `--bone`, `--bone-muted`, `--mute`, `--ink-elevated`, `--ink-border`, and `--signal` as colours
- Use only Inter weights 400 and 500
- Have one primary CTA per screen
- Have zero decorative icon images
- Have zero instances of the word "dominate"
- Use sentence case throughout
- Have consistent UK English spelling
- Show one named case study with specific numbers high on the homepage
- Not contain any "work for free" or "guaranteed rankings" language

## What you should ask before starting

Before Phase 1, confirm with me:
1. The tech stack (I expect Next.js + Tailwind based on what I know — confirm and check `package.json`)
2. Whether the colour tokens go in `tailwind.config` (extend theme) or in a global CSS file
3. Whether there are existing component primitives (Button, Section) to extend rather than build from scratch
4. Whether the individual trade pages (`/seo-electrician/` etc.) should also be rebranded in this pass, or only the homepage

If anything in this brief is ambiguous or contradicts something you find in the codebase, stop and ask rather than guessing.
