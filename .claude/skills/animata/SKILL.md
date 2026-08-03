---
name: animata
description: >-
  Use Animata (https://animata.design) — a free library of hand-crafted,
  copy-paste React/Tailwind interaction and animation patterns (animated cards,
  text effects, bento grids, skeuomorphic buttons, progress indicators, hover
  effects, background patterns). Use when the user wants reusable motion
  patterns, animated cards/text, interaction effects, or trendy UI patterns to
  drop into pages.
---

# Animata — reusable motion patterns

Animata is copy-paste-first: you browse a pattern, copy the component source,
and own the code. That fits this repo — everything gets vendored, adapted, and
kept.

## Fit with this repo

- Animata components are React + Tailwind, mostly dependency-free; some use
  framer-motion (`pnpm add motion` on first need) — check imports before
  copying.
- Vendor into `src/components/ui/` (primitives/effects) or
  `src/components/` (composed sections), as `.tsx` with typed props.
- Add the Animata source URL in a top-of-file comment.
- Some patterns assume Animata's tailwind config additions (custom keyframes/
  animations) — merge those into `tailwind.config.js` `theme.extend`, and
  dedupe against what `tailwindcss-animate` already provides.

## Workflow

1. **Pick the pattern by job, not novelty**: what should this element do —
   draw attention (CTA), explain (progress, steps), delight (success), or
   organize (bento grid)?
2. **Fetch the source** from animata.design (WebFetch the component page or
   its GitHub — `hkirat/animata` mirror) and read it fully before copying.
3. **Adapt**:
   - Theme tokens instead of hardcoded colors (`bg-primary`,
     `text-muted-foreground`, `border-border`).
   - Real content: roofing services, quote statuses, customer names —
     never leave lorem ipsum.
   - TypeScript props with sensible defaults; `cn()` from `@/lib/utils`
     for class merging.
4. **Systematize**: if a pattern will repeat (animated stat card, hover
   card), extract the variant knobs (color, direction, delay) into props so
   it's genuinely reusable — that's the point of the library.
5. Verify with `pnpm lint` and `pnpm build`.

## Rules

- Consistency beats variety: pick one hover language and one entrance
  language per app area and reuse them — don't ship five different card
  hover effects.
- Respect `prefers-reduced-motion` on anything that moves on its own.
- Keep vendored components self-contained; if two copied patterns share
  keyframes, hoist them to `tailwind.config.js` once.
- Business screens (invoices, quotes) get subtle patterns only; expressive
  effects live on marketing/landing surfaces.
