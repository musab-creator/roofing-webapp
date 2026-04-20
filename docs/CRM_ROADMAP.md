# Diversity Roofing CRM — Product Roadmap

> Traceability between the April 2026 holistic specification and the
> implementation PRs. Each spec section maps to one or more phases below,
> and each phase is scoped to a single PR unless it is too large to review
> in one, in which case it is split.

## Source specification

The source specification is the document prepared for Musab Alraddad,
Founder & CEO, in April 2026. It covers ten functional areas:

| § | Functional area |
| --- | --- |
| 4.1 | Lead Management & Intake |
| 4.2 | Sales Pipeline & Rep Productivity |
| 4.3 | Claims & Insurance Restoration |
| 4.4 | Job & Project Management |
| 4.5 | Communication Hub (Team & Homeowner) |
| 4.6 | Call Center Operations |
| 4.7 | Document & Photo Hub |
| 4.8 | Financials, Margin & Reporting |
| 4.9 | Team & Role Management |
| 4.10 | Marketing, Growth & Expansion |

Priorities use the four-tier scale from the spec: **Critical** (cannot
launch without), **High** (within 90 days of launch), **Medium** (within
6 months), **Nice** (useful but not blocking).

## Principles

1. **Domain model first.** We add tables and types before any UI so every
   subsequent PR has a stable shape to build against.
2. **Additive, not disruptive.** We do not refactor the existing customer
   / invoice / quote flows until a phase explicitly calls for it. Reps
   and Carolina keep using what works.
3. **Money in cents.** All monetary amounts are stored as `bigint` cents.
   `float8` is only kept on legacy tables we have not yet migrated.
4. **Leads are separate from customers.** A lead is a pre-customer
   record. It is promoted (not merged) when it becomes a sold job, so
   bad leads never pollute customer history.
5. **One lead → one claim → many supplements.** Claims hang off leads,
   not customers, because the claim is the anchor that survives the
   lead-to-customer promotion.

## Phase plan

### Phase 0 — Roadmap & issues (this doc)

Traceability document plus one GitHub epic issue per functional area.
Closed by this PR.

### Phase 1 — Domain model expansion

- SQL migration for every new table listed below
- TypeScript types mirroring those tables
- `db-tables.ts` constants extended

Covers the foundation for §4.1, §4.3, §4.4, §4.6, §4.8. No UI changes.

Tables introduced:

| Table | Supports |
| --- | --- |
| `lead_source` | §4.1 — Tony / SAM Delivery / call center / canvassing / referral payment models |
| `territory` | §4.1 — Jacksonville / Middleburg / St. Augustine / Ponte Vedra routing |
| `rep_profile` | §4.2, §4.9 — rep metadata, default commission share, overhead cap |
| `rep_territory` | §4.1, §4.9 — many-to-many rep ↔ territory |
| `bad_lead_reason` | §4.1 — structured reason codes for bad-lead audit |
| `lead_status` | §4.1 — pipeline stages (New → Closed) |
| `lead` | §4.1, §4.2 — pre-customer record |
| `lead_activity` | §4.2, §4.5 — unified activity log per lead |
| `carrier` | §4.3 — State Farm / Allstate / USAA / Manatee playbook |
| `claim` | §4.3 — one per lead |
| `supplement` | §4.3 — one or more per claim |
| `supplement_line_item` | §4.3 — Xactimate-compatible line items |
| `supplement_template` | §4.3 — reusable templates (O&P, I&W, drip edge, etc.) |
| `call_center_agent` | §4.6 — Jordan agents, pay model, timezone |
| `call_center_lead_submission` | §4.6 — per-lead payout calculation |
| `request` | §4.5 — replaces most rep-to-office text-message traffic |
| `commission` | §4.2, §4.8 — 50/50, 25/25/50, overhead cap automation |
| `job_pnl_snapshot` | §4.4, §4.8 — live P&L for margin outlier alerts |

Indexes: every foreign key gets a B-tree index; `lead` additionally
indexes `(street_address, city, state, zipcode)` for dedup and `(phone)`
for inbound-call lookup.

Row-level security: deferred to Phase 1.5. The schema is created with
RLS disabled; a follow-up PR will enable it per-role once rep accounts
exist.

### Phase 2 — Lead Management & Intake (§4.1 Critical)

- Inbound email parser for Tony Cisneros sheets (Supabase Edge Function
  + webhook)
- Inbound email parser for SAM Delivery
- Call-center lead submission form (low-permission role)
- Manual lead entry form (mobile-optimised)
- Territory auto-assignment (round-robin within territory)
- Pipeline Kanban for leads
- Bad-lead tagging + credit-request workflow
- Duplicate detection (address + phone)

### Phase 3 — Sales Pipeline + Commission engine (§4.2)

- Rep dashboard (Kanban + leaderboard)
- Activity log viewer (calls, texts, emails, notes, photos)
- Mobile rep app (PWA, offline-capable photo upload)
- Commission calculator: 50/50, 25/25/50, $1,800 overhead cap, per-deal
  overrides
- Automated follow-up cadences (24h contingency nudge)
- E-signature contingency via the three folder templates

### Phase 4 — Claims & Supplements (§4.3)

Split into two PRs:

- **4a — Claim record + carrier playbook.** Claim CRUD, adjuster
  contact, ACV/RCV/depreciation tracking, carrier knowledge base.
- **4b — Supplement builder.** Template library, Xactimate ESX import
  (needs sample `.esx` from Musab), supplement counter PDF export,
  photo-to-line-item linking.

### Phase 5 — Job P&L + Documents (§4.4, §4.7, §4.8 margin)

Split into two PRs:

- **5a — Job P&L.** Live roll-up of contract, ABC invoices, crew
  invoices, Home Depot misc, overhead, supplement fees. Margin outlier
  alerts when ABC+Crew > 60 % of contract.
- **5b — Documents.** Per-job vault with OCR full-text PDF search,
  template library (contingency, contract, inspection report,
  supplement letter), version control, e-sign on everything.

### Phase 6 — Communication Hub + Call Center Ops (§4.5, §4.6)

- Unified inbox per job (SMS + email + in-app)
- `@request` queue (permit pull, supplement draft, crew schedule,
  material order, cancel lead)
- Homeowner portal (read-only: claim status, install schedule, payments)
- Dialer integration (JustCall / RingCentral / Five9 — vendor TBD)
- Call recording + QA scorecard (Amireh scores, agent sees results)
- Training module tracking

### Phase 7 — Reporting, Team, Marketing (§4.8 reporting, §4.9, §4.10)

- Monthly P&L dashboard (revenue, COGS, overhead, net by rep /
  territory / source)
- Break-even tracker against the 2.2 / 4.88 / 20.3 jobs-per-month
  thresholds
- Role-based permissions (Owner, Office Manager, Sales Rep, Call
  Center Agent, Crew Foreman, Subcontractor)
- Onboarding checklists per role
- Lead-source ROI (spend vs. collected)
- Email marketing integration (former-customer nurture)
- Review management (Google, BBB, Yelp)

## Out of scope for this roadmap

- **Federal contracting (SAM.gov).** Tagged Nice in the spec, and the
  GC partnership has not activated. Revisit once Diversity Contracting
  LLC starts bidding.
- **Google Local Services Ads integration.** Nice tier. Revisit after
  lead-source ROI dashboard (Phase 7) ships and we know whether LSA is
  even a top-five channel.

## Open decisions that block future phases

1. **Telephony vendor** (Phase 6). JustCall, RingCentral, and Five9 all
   have REST APIs and call recording. Picking one requires Musab's
   input on budget and whether international SIP trunks to Jordan are a
   hard requirement.
2. **Xactimate ESX samples** (Phase 4b). Implementation needs a handful
   of real `.esx` files to validate the import path against the public
   Verisk schema.
3. **Lead-to-Customer promotion mechanics** (Phase 2). The lead record
   holds a `promoted_customer_id` FK. The promotion step should happen
   at "Contingency Signed" — confirmed with Musab before Phase 2 code.
