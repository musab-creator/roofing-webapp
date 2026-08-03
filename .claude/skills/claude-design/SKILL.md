---
name: claude-design
description: >-
  Generate a complete design system from a text prompt — color palette, typography
  scale, spacing, radii, shadows, and component tokens — and wire it into this
  repo's Tailwind + shadcn CSS-variable theme. Use when the user asks for a design
  system, brand refresh, new theme, landing-page look, color palette, dark mode
  tuning, or says the site looks generic and wants a "high-end" or "$5k website"
  feel.
---

# Claude Design — prompt-to-design-system

Turn a short brief ("modern roofing contractor, trustworthy, bold, storm-season energy")
into a full design system and apply it to this codebase.

## Where the theme lives in this repo

- **CSS variables**: `src/index.css` — shadcn-style HSL tokens (`--background`,
  `--foreground`, `--primary`, `--card`, `--border`, `--radius`, …) with a
  `.dark` block. This is the single source of truth for color.
- **Tailwind config**: `tailwind.config.js` — maps those variables into the
  Tailwind palette. Extend here for fonts, extra radii, shadows, and keyframes.
- **shadcn config**: `components.json` — default style, `zinc` base, CSS variables on.

Never hardcode hex values in components; always route new colors through the
variable layer so light/dark stay in sync.

## Workflow

1. **Interview the brief.** Ask (or infer from context) three things: brand
   personality (3 adjectives), one anchor color (or industry default — roofing
   trades well with deep slate/navy + safety-orange or amber accent), and
   density (marketing-airy vs. dashboard-compact).
2. **Produce the system as a spec first**, before touching files:
   - Palette: primary, accent, background/surface pair, semantic
     (success/warning/destructive), and neutrals — each as HSL, with light and
     dark values side by side.
   - Type scale: display/heading/body/caption sizes with weights and tracking.
   - Spacing & radius: pick one radius personality (sharp 0.25rem = technical,
     0.5rem = default, 0.75rem+ = friendly) and apply it via `--radius`.
   - Shadows: 3-step elevation (card, popover, modal).
   Present the spec briefly so the user can veto before the diff.
3. **Check contrast.** Every foreground/background pair must hit WCAG AA
   (4.5:1 body, 3:1 large text) in both modes. Adjust lightness, not hue.
4. **Apply**: edit the `:root` and `.dark` blocks in `src/index.css`, then any
   `tailwind.config.js` extensions (fonts via `@fontsource` or a `<link>` in
   `index.html`). Keep variable names — shadcn components depend on them.
5. **Show it.** Offer to render a theme-preview page or screenshot key pages
   (dashboard, quotes, invoices) so the user sees the system on real screens.

## Rules

- One accent, used sparingly — high-end sites are mostly neutrals.
- Dark mode is designed, not inverted: lift surfaces with lighter grays, drop
  saturation slightly, never pure black on pure white.
- Charts: this repo uses Tremor — keep chart colors in the same family
  (see the `dataviz` skill if present before styling charts).
- When creating a fresh alternative look, propose it as a second theme class
  rather than destroying the current one, so it's easy to A/B.
