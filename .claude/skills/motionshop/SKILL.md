---
name: motionshop
description: >-
  Add 3D motion effects to the site — interactive 3D scenes, product/hero
  visuals, parallax depth, tilt cards, and scroll-driven 3D transforms, in the
  spirit of Motionshop-style 3D content. Use when the user wants 3D elements,
  a 3D hero section, depth/parallax effects, an interactive 3D model (e.g. a
  house/roof), or "wow-factor" visuals beyond flat animation.
---

# Motionshop — 3D motion effects

Bring 3D depth to the site with the lightest tool that achieves the effect.
Escalate only as needed:

## Ladder of 3D (cheapest first)

1. **CSS 3D transforms** — no dependencies. `perspective`, `rotateX/Y`,
   `translateZ` via Tailwind arbitrary values. Covers: tilt-on-hover cards,
   flip cards, layered parallax heroes. Default choice.
2. **Scroll-driven depth** — parallax layers moving at different rates
   (CSS `transform` on scroll via a small hook, or framer-motion's
   `useScroll`/`useTransform` if `motion` is installed). Covers: hero
   sections with floating layered imagery (e.g. roof layers exploding apart
   as you scroll — great fit for explaining a roofing system).
3. **Spline embed** (https://spline.design) — design a scene in Spline's
   editor, embed with `@splinetool/react-spline`. Covers: interactive 3D
   hero objects without writing WebGL. Keep scenes < 2MB.
4. **React Three Fiber** (`three` + `@react-three/fiber` + `@react-three/drei`)
   — full control. Covers: loading a real `.glb` model (a 3D house/roof),
   orbit controls, lighting, scroll-linked camera moves. Heaviest option;
   only when 1–3 can't do it.

None of these are installed yet — add per level:
`pnpm add motion` / `pnpm add @splinetool/react-spline` /
`pnpm add three @react-three/fiber @react-three/drei @types/three`.

## Workflow

1. Pin down the effect and where it lives (usually one hero or one feature
   section — 3D is a spotlight, not wallpaper).
2. Pick the lowest rung on the ladder that delivers it; say which and why.
3. Build it as an isolated component in `src/components/` with a static
   fallback (poster image) for `prefers-reduced-motion` and load failures.
4. **Lazy-load anything heavy**: `React.lazy` + `Suspense` around Spline/R3F
   so the 3D bundle never blocks first paint. Check bundle impact with
   `pnpm build` and report the size delta.
5. Verify 60fps on the composited properties only (`transform`, `opacity`) —
   never animate layout properties.

## Rules

- One 3D moment per page maximum.
- Mobile: reduce or replace — heavy scenes become static renders below `md:`.
- 3D must reinforce the product story (roofs, houses, materials, weather),
  not be a random floating blob.
