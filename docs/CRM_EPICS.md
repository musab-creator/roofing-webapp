# CRM Epics — Checklist by Functional Area

GitHub Issues are disabled on this repository, so this document stands
in as the per-epic tracker. It mirrors what would have been one GitHub
epic per functional area of the April 2026 holistic specification.

Each epic is grouped by priority (Critical / High / Medium / Nice) and
linked to the implementation phase from `docs/CRM_ROADMAP.md`.

When an item ships in a PR, tick the box and link the PR in parens
after the item.

---

## Epic 4.1 — Lead Management & Intake

Roadmap phase: **Phase 2**.
Why: leads enter from five channels into Gmail today and get triaged by
searching subject lines. Single biggest time sink in the business.

### Critical
- [ ] Automated lead intake from Tony Cisneros daily email sheets (name, phone, address, appointment, roof age, story count, home value)
- [ ] Automated lead intake from SAM Delivery emails
- [ ] Manual lead entry (mobile-optimised) for canvassing, walk-ins, referrals, inbound calls
- [ ] Call-center lead submission with dedicated low-permission role; auto-calculates $10–20 / $5 bounty
- [ ] Territory auto-assignment (Jacksonville, Middleburg, St. Augustine, Ponte Vedra; round-robin; rep-rule override)
- [ ] Lead pipeline stages: New → Contact Attempted → Appointment Set → Inspected → Report Sent → Contingency Signed → Claim Filed → Approved → Installed → Collected → Closed
- [ ] Bad-lead tagging with reason codes + automatic credit-request workflow to the lead vendor

### High
- [ ] Storm / weather integration (CoreLogic MapAlerts or equivalent)
- [ ] Duplicate detection on address + phone
- [ ] Lead value scoring (home value, roof age, story count, carrier, zip)

### Medium
- [ ] Territory map view (pins by status; canvassing routes)
- [ ] Canvassing app (geo-tagged "not home / pitched / appt set")
- [ ] Bad-lead audit dashboard by rep / source / month / reason

### Phase 1 foundations
`lead`, `lead_activity`, `lead_source`, `lead_status`, `territory`,
`bad_lead_reason`, `carrier` tables. Seeded territories, pipeline
stages, reason codes, and known sources.

---

## Epic 4.2 — Sales Pipeline & Rep Productivity

Roadmap phase: **Phase 3**.
Why: reps framed at $80K–$300K are running commission splits by text
message. No shared pipeline visibility today.

### Critical
- [ ] Kanban pipeline board (per-rep + company-wide views)
- [ ] Activity log per lead (calls, texts, emails, notes, photos, documents)
- [ ] Mobile / PWA rep app (view lead, update status, upload photos, send contingency, e-sign)
- [ ] E-signature contingency using the three folder templates
- [ ] Commission calculator: 50/50 default with $1,800 overhead cap; 25/25/50 splits; per-deal overrides; auto-calculate on job close

### High
- [ ] Inspection report builder (CompanyCam photos → branded PDF)
- [ ] Proposal / estimate builder (Good/Better/Best; gutters/siding/solar upsells)
- [ ] Automated follow-up cadences (24h contingency nudge)
- [ ] Rep leaderboard (pipeline value, close rate, revenue booked, avg job size, bad-lead rate)

### Medium
- [ ] Lead-source attribution (revenue by source)
- [ ] 1-3-1 problem-submission form (problem + 3 options + 1 recommendation before it reaches Musab/Carolina)

### Phase 1 foundations
`rep_profile`, `rep_territory`, `commission` tables. Default 50 %
share and $1,800 cap already seeded.

---

## Epic 4.3 — Claims & Insurance Restoration

Roadmap phase: **Phase 4** (will likely split into 4a + 4b).
Why: breakeven jobs become profitable only when supplements for O&P,
ice & water, drip edge, and permit fees get approved. Manual today.

### Critical
- [ ] Claim record per lead (carrier, adjuster, claim #, policy #, loss date, deductible, ACV, RCV, recoverable depreciation)
- [ ] Xactimate ESX import/export (ingest adjuster estimates; export compliant supplements)
- [ ] Supplement builder with template library (O&P, ice & water, drip edge, permit, dumpster, decking, starter strip, ridge cap)
- [ ] Supplement status tracking: Draft → Submitted → Carrier Reviewing → Approved (full) → Approved (partial) → Denied → Appealing

### High
- [ ] Carrier knowledge base (Manatee, State Farm, Allstate, USAA — deductibles, SLAs, objections, reviewer phrasing)
- [ ] Photo-to-line-item linking (inspection photo → Xactimate code justification)
- [ ] Homeowner letter templates (partial approvals, matching issues, discontinued materials, stonewalling)

### Medium
- [ ] Appeal workflow with SLA timers + reminders
- [ ] Claim financial snapshot (ACV vs. RCV vs. supplement approved vs. collected)

### Open decision
Sample `.esx` files needed from Musab before Phase 4b.

### Phase 1 foundations
`carrier`, `claim`, `supplement`, `supplement_line_item`,
`supplement_template` tables.

---

## Epic 4.4 — Job & Project Management

Roadmap phase: **Phase 5** (P&L) + **Phase 5b** (documents).
Why: Job Status List lives in Google Drive with PDFs in per-address
folders, and Drive can't search inside them.

### Critical
- [ ] One job record per property (address, homeowner, phone, email, carrier, rep, stage, contract, materials, labor, overhead, permits, supplements, profit)
- [ ] Document vault per job with OCR full-text PDF search
- [ ] Material order per job with ABC Supply integration (PO ↔ job link)
- [ ] Production schedule (install date, crew assignment, status)

### High
- [ ] Crew dispatch for High Caliber (address, contact, photos, material list, notes)
- [ ] Permit tracking (application date, permit #, expiration, inspections, final)
- [ ] Subcontractor coordination (Ecosolar, interior repair, gutters, siding) with limited-scope job access
- [ ] Live job P&L view ($/SQ and % of contract in real time)

### Medium
- [ ] Gutter & metal takeoff calculator (from GAF QuickMeasure)
- [ ] Post-install punch list

### Phase 1 foundations
`job_pnl_snapshot` table drives P&L and margin-outlier alerts.
"Job" will be modelled atop the existing `invoice` table until a
dedicated `job` table is warranted.

---

## Epic 4.5 — Communication Hub (Team & Homeowner)

Roadmap phase: **Phase 6**.
Why: explicit ask — minimise text/call traffic between Musab, Carolina,
and the sales team by pushing requests and status into the CRM.

### Critical
- [ ] Unified inbox per job (SMS + email + in-app, threaded to the job)
- [ ] Internal `@mentions` / `@requests` on a job
- [ ] Request queue with structured types (permit pull, supplement draft, crew schedule, material order, cancel lead) and SLA fields

### High
- [ ] Homeowner portal (read-only: claim status, inspection report, contract, install schedule, payments)
- [ ] Call logging + recording tied to lead or job

### Medium
- [ ] Automated homeowner notifications (scheduled, approved, confirmed, received)
- [ ] Review-request automation after collection

### Phase 1 foundations
`request` table with all typed categories and SLA fields.
`lead_activity` unifies inbound/outbound communication per lead.

---

## Epic 4.6 — Call Center Operations

Roadmap phase: **Phase 6**.
Why: Jordan-based agents with $280/mo base + $10–20/confirmed + $5/bad.
Interview guide, accent test, scorecard already exist.

### Critical
- [ ] Dedicated low-permission agent role (create leads + view own queue only)
- [ ] Auto payment calculation at month end
- [ ] Dialer integration (JustCall / RingCentral / Five9 — TBD) with click-to-call + recording

### High
- [ ] QA scorecard using the interview-guide rubric
- [ ] Coaching queue — flagged calls route to Amireh

### Medium
- [ ] Training module tracking (Zoom onboarding, completion, quiz scores)
- [ ] Shift tracker (6 PM–midnight Jacksonville)

### Open decision
Telephony vendor selection (budget + Jordan SIP).

### Phase 1 foundations
`call_center_agent`, `call_center_lead_submission` tables.
`Asia/Amman` timezone + $280/$15/$5 defaults already in place.

---

## Epic 4.7 — Document & Photo Hub

Roadmap phase: **Phase 5b**.
Why: PDFs-in-Drive is the single biggest operational blocker.

### Critical
- [ ] Photo management with CompanyCam parity (bulk upload, auto-tag, geotag, captions, annotations, share links)
- [ ] Full-text PDF search (OCR on adjuster reports, invoices, supplements, permits)
- [ ] Template library (contingency from three folder templates, contract, inspection cover, proposal, supplement letter, homeowner letters)

### High
- [ ] E-sign on everything (contingency, contract, change orders, completion)
- [ ] Version control for supplement drafts

### Medium
- [ ] CompanyCam integration (or full replacement)
- [ ] Google Drive migration assist

### Phase 1 foundations
Blob-path fields already on `supplement` (`xactimate_esx_path`,
`counter_estimate_pdf_path`).

---

## Epic 4.8 — Financials, Margin & Reporting

Roadmap phase: **Phase 5a** (live P&L) + **Phase 7** (reporting).
Why: Excel P&L built from scratch per job today; manual commissions.

### Critical
- [ ] Live job P&L (ABC + Crew + Home Depot + overhead + supplement fees + individual charges vs. contract; $/SQ and % in real time)
- [ ] Commission automation on close (50/50, 25/25/50, custom split)
- [ ] QuickBooks / accounting sync (AR, AP, payroll, 1099)

### High
- [ ] Margin outlier alerts (ABC + Crew > 60 % of contract)
- [ ] Monthly P&L dashboard (revenue, COGS, overhead, net by rep / territory / source)
- [ ] Break-even tracker against 2.2 / 4.88 / 20.3 jobs-per-month thresholds

### Medium
- [ ] Payment processing (Stripe or equivalent; ACH + card; separate deductible collection)
- [ ] Homeowner financing (Sunlight, GoodLeap)

### Phase 1 foundations
`commission`, `job_pnl_snapshot` tables.

---

## Epic 4.9 — Team & Role Management

Roadmap phase: **Phase 7**.

### Critical
- [ ] Role-based permissions (Owner, Office Manager, Sales Rep, Call Center Agent, Crew Foreman, Subcontractor)
- [ ] Rep-scoped visibility

### High
- [ ] Onboarding checklist per role (training, documents, certifications, tool access)
- [ ] Time-off & availability (affects auto-assignment)

### Medium
- [ ] 1099 / subcontractor onboarding (W-9, COI, crew agreement for High Caliber, Ecosolar, interior subs)

### Phase 1 foundations
`rep_profile`, `rep_territory` tables. RLS policies deferred to a
Phase 1.5 follow-up once rep accounts are seeded.

---

## Epic 4.10 — Marketing, Growth & Expansion

Roadmap phase: **Phase 7**.

### High
- [ ] Lead-source ROI reporting ($ spent vs. $ collected per source)
- [ ] Email marketing integration (former-customer nurture)

### Medium
- [ ] Referral tracking (homeowner-to-homeowner with automated rewards)
- [ ] Review management (Google, BBB, Yelp)

### Nice
- [ ] Google Local Services Ads integration
- [ ] Federal contracting (SAM.gov, NAICS, bid pipeline for Diversity Contracting LLC)

### Phase 1 foundations
`lead_source` captures per-source payment model, which feeds the ROI
calculation directly.
