---
name: magic-ui
description: >-
  Add polished animations using Magic UI (https://magicui.design) — 150+ free,
  open-source animated React/Tailwind/framer-motion components: shimmer buttons,
  animated gradient text, number tickers, marquees, border beams, blur-fade
  reveals, animated lists, confetti. Use when the user wants animations, motion,
  micro-interactions, animated hero/CTA elements, or to make the site feel alive
  and premium.
---

# Magic UI — animation components

Magic UI is a shadcn-compatible registry of animated components. It pairs with
this repo's stack (React + TS + Tailwind + shadcn conventions).

## Install pattern

- Registry: `pnpm dlx shadcn@latest add "https://magicui.design/r/<component>.json"`
  (e.g. `.../r/shimmer-button.json`, `.../r/number-ticker.json`,
  `.../r/blur-fade.json`, `.../r/marquee.json`, `.../r/border-beam.json`).
- Most Magic UI components need **framer-motion (`motion`)** — not installed
  here yet. Add on first use: `pnpm add motion` (or `framer-motion` if the
  component imports from there — match the component's import).
- Simpler ones run on pure CSS keyframes + `tailwindcss-animate` (already
  installed); prefer those when they suffice.
- Components land in `src/components/ui/`; keep the source URL in a top
  comment.

## Good uses in this app

- **Number ticker** on dashboard stat cards (revenue, open quotes) — subtle,
  high perceived quality.
- **Blur-fade / fade-in stagger** for page sections and card grids on mount.
- **Shimmer or pulsating CTA button** for the primary action on marketing pages.
- **Marquee** for testimonials or supplier/partner logos.
- **Border beam / magic card** to spotlight one featured plan or card.
- **Confetti** on a "quote accepted" or "invoice paid" success moment.

## Rules

- Motion must serve hierarchy: animate the one thing the user should notice,
  not everything. Max one ambient effect per viewport.
- Durations 150–400ms for micro-interactions; entrance staggers ≤ 80ms apart;
  never block interaction while animating.
- Respect `prefers-reduced-motion` — Magic UI components mostly handle this,
  but verify, and gate any custom keyframes with the media query.
- Dashboards stay calm: tickers and fades yes; beams, marquees, confetti are
  for marketing/success moments, not data screens.
- Strip Next.js-isms when vendoring (this is a Vite + react-router app).
