---
name: 21st-dev
description: >-
  Build custom React components using 21st.dev — a registry of production-grade,
  shadcn-compatible React/Tailwind components (heroes, pricing tables, feature
  grids, testimonials, navbars, cards). Use when the user wants a polished custom
  component, a landing-page section, marketing UI, or says "make it look like a
  premium site" and a plain shadcn primitive isn't enough.
---

# 21st.dev — custom React components

21st.dev (https://21st.dev) is a community registry of copy-paste React
components built on the same stack as this repo: React + TypeScript + Tailwind +
Radix/shadcn conventions. Components install via the shadcn CLI or paste-in.

## Fit with this repo

- shadcn is configured (`components.json`): default style, zinc base, CSS
  variables, aliases `@/components` → `src/components`, `@/lib/utils` → `cn()`.
- Registry installs go through: `pnpm dlx shadcn@latest add "<registry-url>"`.
  21st.dev exposes per-component registry URLs (the "Install with shadcn" tab).
- Ad-hoc UI primitives live in `src/components/ui/`; composed feature components
  live in `src/components/`. Follow that split for anything you bring in.

## Workflow

1. **Search before building.** Browse/fetch 21st.dev for the component category
   (hero, pricing, bento grid, testimonial, navbar, footer, stats, CTA). Use
   WebFetch on the component page to read its source when the CLI isn't usable.
2. **Vet the source** before installing: check its dependencies (framer-motion
   is NOT installed here — add with `pnpm add framer-motion` only if the
   component needs it), confirm it uses `cn()` and CSS-variable colors, and
   strip any Next.js-isms (`next/image` → `<img>`, `next/link` → react-router
   `Link` from this repo's routing).
3. **Adapt, don't paste raw**:
   - Convert to `.tsx` with proper prop types.
   - Replace hardcoded colors with theme tokens (`bg-primary`,
     `text-muted-foreground`, …).
   - Swap demo copy for real roofing-business content (quotes, invoices,
     customers, leads).
   - Icons: use `lucide-react` (already installed).
4. **Compose** into a page under `src/pages/` and verify with
   `pnpm lint` + `pnpm build`; render it if a dev-server check is warranted.

## Rules

- Never bring in a second styling system (styled-components, CSS modules,
  emotion) — Tailwind only.
- Keep each vendored component self-contained in one file where possible;
  note its 21st.dev source URL in a comment at the top for future updates.
- If a component drags in >2 new dependencies, prefer rebuilding it lean with
  existing primitives.
