---
name: vercel-v0
description: >-
  Build interactive dashboards and data-rich UI the way Vercel v0 does — generate
  complete, stateful dashboard screens (stat cards, charts, tables, filters,
  detail drawers) from a description. Use when the user asks for a dashboard,
  analytics view, admin screen, reporting page, KPI overview, or an interactive
  data page for quotes, invoices, customers, or leads.
---

# Vercel v0 — interactive dashboards

v0.dev generates full interactive screens, not lone components. Emulate that
output quality here: a working page with real data wiring, not a static mock.

## Dashboard stack already in this repo

- **Charts**: `@tremor/react` (AreaChart, BarChart, DonutChart, etc.)
- **Tables**: `@tanstack/react-table` — see `src/components/data-table.tsx`
  and `data-table-filter-card.tsx` for the established pattern.
- **Stat cards**: `src/components/count-stat-card.tsx` exists — extend it
  rather than inventing a parallel one.
- **Data**: Supabase via `@supabase/supabase-js`, fetched through
  `@tanstack/react-query` hooks in `src/hooks/` and services in `src/services/`.
- **Forms/filters**: react-hook-form + zod (`src/validations/`), shadcn inputs.

## Workflow

1. **Define the screen contract**: which entities (quotes, invoices, customers,
   leads), which KPIs, which time ranges, what the primary user question is
   ("what's overdue?", "how's this month vs last?").
2. **Sketch the layout v0-style**: KPI row (3–4 stat cards) → main chart +
   secondary chart → filterable table → row-click detail (drawer/dialog).
   Responsive: cards wrap 2-up on tablet, stack on mobile; charts full-width.
3. **Wire real data first.** Build the react-query hook against Supabase
   (respect existing service patterns in `src/services/`), then render. Only
   fall back to typed mock data in `src/data/` if the schema doesn't exist yet
   — and say so.
4. **Make it interactive**: time-range selector drives every widget; table
   sorting/filtering/pagination via tanstack; loading skeletons and
   `empty-state-card.tsx` for zero states; toasts for errors.
5. **Iterate like v0**: show the first pass, then refine on feedback rather
   than gold-plating up front.

## Rules

- Reuse `data-table.tsx` for any table — don't fork the pattern.
- Every number formats through a shared helper (currency, dates) — check
  `src/lib/` before writing a new formatter.
- Charts and stat colors come from the theme tokens; if a `dataviz` skill is
  available, load it before styling any chart.
- A dashboard without loading/empty/error states is not done.
