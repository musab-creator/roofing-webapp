-- CRM Domain Expansion
-- Phase 1 of the roadmap documented in docs/CRM_ROADMAP.md.
--
-- Adds the tables required for the April 2026 holistic specification:
-- leads, claims, supplements, call-center operations, requests,
-- commissions, and job P&L snapshots. No existing tables are modified.
--
-- Money is stored in cents as bigint to avoid float rounding.
-- RLS is intentionally not enabled in this migration; a follow-up will
-- add per-role policies once rep accounts are seeded.

set search_path to public;

-- ---------------------------------------------------------------------
-- Shared updated_at trigger
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Lookup tables
-- ---------------------------------------------------------------------

-- §4.1 Lead sources: Tony Cisneros, SAM Delivery, in-house call center,
-- canvassing, referral, organic, etc. Payment model captured per-source.
create table if not exists public.lead_source (
  id bigint generated always as identity primary key,
  name text not null unique,
  source_type text not null check (source_type in (
    'vendor', 'in_house', 'referral', 'organic', 'canvassing', 'other'
  )),
  contact_info text,
  payment_base_cents bigint default 0 not null,
  payment_per_confirmed_cents bigint default 0 not null,
  payment_per_bad_cents bigint default 0 not null,
  active boolean default true not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_lead_source before update on public.lead_source
  for each row execute procedure public.set_updated_at();

-- §4.1 Territories: Jacksonville, Middleburg, St. Augustine, Ponte Vedra
create table if not exists public.territory (
  id bigint generated always as identity primary key,
  name text not null unique,
  description text,
  zip_codes text[] default '{}'::text[] not null,
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_territory before update on public.territory
  for each row execute procedure public.set_updated_at();

-- §4.1 Structured bad-lead reason codes
create table if not exists public.bad_lead_reason (
  id bigint generated always as identity primary key,
  code text not null unique,
  label text not null,
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_bad_lead_reason before update on public.bad_lead_reason
  for each row execute procedure public.set_updated_at();

-- §4.1 Lead pipeline stages
create table if not exists public.lead_status (
  id bigint generated always as identity primary key,
  name text not null unique,
  description text,
  sort_order int default 0 not null,
  is_terminal boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_lead_status before update on public.lead_status
  for each row execute procedure public.set_updated_at();

-- §4.3 Carrier playbook (State Farm, Allstate, USAA, Manatee, etc.)
create table if not exists public.carrier (
  id bigint generated always as identity primary key,
  name text not null unique,
  phone text,
  email text,
  notes_markdown text,
  avg_response_days int,
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_carrier before update on public.carrier
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------
-- Rep profile (extends auth.users)
-- ---------------------------------------------------------------------

-- §4.2 + §4.9 Rep metadata: default commission share, default overhead
-- cap. Id mirrors auth.users.id so rep_profile and the user row are
-- always in lock-step.
create table if not exists public.rep_profile (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  phone text,
  email text,
  default_commission_share_pct numeric(5, 2) default 50.00 not null,
  default_overhead_cap_cents bigint default 180000 not null, -- $1,800
  active boolean default true not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_rep_profile before update on public.rep_profile
  for each row execute procedure public.set_updated_at();

-- §4.1 + §4.9 Rep ↔ territory many-to-many
create table if not exists public.rep_territory (
  rep_id uuid not null references public.rep_profile (id) on delete cascade,
  territory_id bigint not null references public.territory (id) on delete cascade,
  is_primary boolean default false not null,
  created_at timestamptz default now() not null,
  primary key (rep_id, territory_id)
);
create index if not exists rep_territory_territory_idx
  on public.rep_territory (territory_id);

-- ---------------------------------------------------------------------
-- Leads
-- ---------------------------------------------------------------------

-- §4.1 Pre-customer record. Promoted (not merged) to customer on
-- contingency signature so bad leads never pollute customer history.
create table if not exists public.lead (
  id bigint generated always as identity primary key,
  external_ref text,
  source_id bigint references public.lead_source (id) on delete set null,
  status_id bigint references public.lead_status (id) on delete set null,
  territory_id bigint references public.territory (id) on delete set null,
  assigned_rep_id uuid references public.rep_profile (id) on delete set null,

  first_name text,
  last_name text,
  phone text,
  email text,
  street_address text,
  city text,
  state text,
  zipcode text,

  roof_age_years int,
  story_count int,
  home_value_cents bigint,
  carrier_id bigint references public.carrier (id) on delete set null,
  carrier_name_override text,

  appointment_at timestamptz,
  score int check (score between 0 and 100),
  notes text,

  promoted_customer_id bigint references public.customer (id) on delete set null,
  promoted_at timestamptz,

  bad_lead_reason_id bigint references public.bad_lead_reason (id) on delete set null,
  bad_lead_credit_requested_at timestamptz,
  bad_lead_credit_received boolean default false not null,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_lead before update on public.lead
  for each row execute procedure public.set_updated_at();

create index if not exists lead_source_idx on public.lead (source_id);
create index if not exists lead_status_idx on public.lead (status_id);
create index if not exists lead_territory_idx on public.lead (territory_id);
create index if not exists lead_assigned_rep_idx on public.lead (assigned_rep_id);
create index if not exists lead_phone_idx on public.lead (phone);
create index if not exists lead_address_idx
  on public.lead (street_address, city, state, zipcode);

-- §4.2 + §4.5 Unified activity log per lead. Inbound/outbound calls,
-- texts, emails, notes, status changes, assignment changes, site visits.
create table if not exists public.lead_activity (
  id bigint generated always as identity primary key,
  lead_id bigint not null references public.lead (id) on delete cascade,
  activity_type text not null check (activity_type in (
    'call', 'sms', 'email', 'note', 'status_change', 'assignment',
    'site_visit', 'document', 'photo', 'system'
  )),
  actor_id uuid references public.rep_profile (id) on delete set null,
  body text,
  metadata jsonb default '{}'::jsonb not null,
  occurred_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);
create index if not exists lead_activity_lead_idx
  on public.lead_activity (lead_id, occurred_at desc);
create index if not exists lead_activity_actor_idx
  on public.lead_activity (actor_id);

-- ---------------------------------------------------------------------
-- Claims & supplements (§4.3)
-- ---------------------------------------------------------------------

create table if not exists public.claim (
  id bigint generated always as identity primary key,
  lead_id bigint not null references public.lead (id) on delete cascade,
  claim_number text,
  carrier_id bigint references public.carrier (id) on delete set null,
  carrier_name_override text,

  adjuster_name text,
  adjuster_phone text,
  adjuster_email text,

  policy_number text,
  loss_date date,

  deductible_cents bigint,
  acv_cents bigint,
  rcv_cents bigint,
  recoverable_depreciation_cents bigint,

  status text not null default 'draft' check (status in (
    'draft', 'filed', 'inspecting', 'approved', 'partial',
    'denied', 'closed', 'appealing'
  )),
  filed_at timestamptz,
  approved_at timestamptz,
  notes text,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_claim before update on public.claim
  for each row execute procedure public.set_updated_at();
create index if not exists claim_lead_idx on public.claim (lead_id);
create index if not exists claim_carrier_idx on public.claim (carrier_id);
create index if not exists claim_status_idx on public.claim (status);

create table if not exists public.supplement_template (
  id bigint generated always as identity primary key,
  name text not null unique,
  description text,
  line_items_json jsonb default '[]'::jsonb not null,
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_supplement_template before update on public.supplement_template
  for each row execute procedure public.set_updated_at();

create table if not exists public.supplement (
  id bigint generated always as identity primary key,
  claim_id bigint not null references public.claim (id) on delete cascade,
  submission_number int default 1 not null,
  amount_requested_cents bigint,
  amount_approved_cents bigint,
  status text not null default 'draft' check (status in (
    'draft', 'submitted', 'reviewing', 'approved', 'partial',
    'denied', 'appealing'
  )),
  submitted_at timestamptz,
  response_at timestamptz,
  xactimate_esx_path text,
  counter_estimate_pdf_path text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_supplement before update on public.supplement
  for each row execute procedure public.set_updated_at();
create index if not exists supplement_claim_idx on public.supplement (claim_id);
create index if not exists supplement_status_idx on public.supplement (status);
create unique index if not exists supplement_claim_submission_key
  on public.supplement (claim_id, submission_number);

create table if not exists public.supplement_line_item (
  id bigint generated always as identity primary key,
  supplement_id bigint not null references public.supplement (id) on delete cascade,
  xactimate_code text,
  description text not null,
  qty numeric(12, 4) default 1 not null,
  unit text,
  rate_cents bigint default 0 not null,
  amount_cents bigint default 0 not null,
  approved_qty numeric(12, 4),
  approved_amount_cents bigint,
  approved boolean,
  sort_order int default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_supplement_line_item before update on public.supplement_line_item
  for each row execute procedure public.set_updated_at();
create index if not exists supplement_line_supplement_idx
  on public.supplement_line_item (supplement_id, sort_order);

-- ---------------------------------------------------------------------
-- Call center operations (§4.6)
-- ---------------------------------------------------------------------

create table if not exists public.call_center_agent (
  id bigint generated always as identity primary key,
  auth_user_id uuid references auth.users (id) on delete set null,
  display_name text not null,
  supervisor_name text,
  timezone text default 'Asia/Amman' not null,
  base_pay_cents bigint default 28000 not null,              -- $280
  per_confirmed_cents bigint default 1500 not null,          -- $15
  per_bad_cents bigint default 500 not null,                 -- $5
  start_date date,
  active boolean default true not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_call_center_agent before update on public.call_center_agent
  for each row execute procedure public.set_updated_at();

create table if not exists public.call_center_lead_submission (
  id bigint generated always as identity primary key,
  lead_id bigint not null references public.lead (id) on delete cascade,
  agent_id bigint not null references public.call_center_agent (id) on delete restrict,
  confirmed boolean,
  confirmed_at timestamptz,
  bad_lead_reason_id bigint references public.bad_lead_reason (id) on delete set null,
  payout_cents bigint,
  reviewed_by uuid references public.rep_profile (id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_ccls before update on public.call_center_lead_submission
  for each row execute procedure public.set_updated_at();
create index if not exists ccls_lead_idx on public.call_center_lead_submission (lead_id);
create index if not exists ccls_agent_idx on public.call_center_lead_submission (agent_id);

-- ---------------------------------------------------------------------
-- Request queue (§4.5) — replaces most rep-to-office text traffic
-- ---------------------------------------------------------------------

create table if not exists public.request (
  id bigint generated always as identity primary key,
  request_type text not null check (request_type in (
    'permit_pull', 'supplement_draft', 'crew_schedule',
    'material_order', 'cancel_lead', 'inspection_report',
    'contract_send', 'other'
  )),
  subject text not null,
  body text,
  requester_id uuid references public.rep_profile (id) on delete set null,
  assignee_id uuid references public.rep_profile (id) on delete set null,
  lead_id bigint references public.lead (id) on delete set null,
  claim_id bigint references public.claim (id) on delete set null,
  invoice_id bigint references public.invoice (id) on delete set null,
  status text not null default 'open' check (status in (
    'open', 'in_progress', 'blocked', 'done', 'cancelled'
  )),
  priority text not null default 'normal' check (priority in (
    'low', 'normal', 'high', 'urgent'
  )),
  sla_hours int,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_request before update on public.request
  for each row execute procedure public.set_updated_at();
create index if not exists request_assignee_idx on public.request (assignee_id, status);
create index if not exists request_requester_idx on public.request (requester_id);
create index if not exists request_lead_idx on public.request (lead_id);
create index if not exists request_claim_idx on public.request (claim_id);
create index if not exists request_invoice_idx on public.request (invoice_id);

-- ---------------------------------------------------------------------
-- Commissions & P&L (§4.2, §4.4, §4.8)
-- ---------------------------------------------------------------------

-- Commission on a sold deal. 50/50 default with $1,800 overhead cap;
-- 25/25/50 split-deal supported via two rows with share_pct = 25 and
-- a share_pct = 50 override. Any row can override the cap per deal.
create table if not exists public.commission (
  id bigint generated always as identity primary key,
  invoice_id bigint not null references public.invoice (id) on delete cascade,
  rep_id uuid not null references public.rep_profile (id) on delete restrict,

  share_pct numeric(5, 2) not null,
  overhead_cap_cents bigint not null,

  contract_cents bigint default 0 not null,
  material_cents bigint default 0 not null,
  labor_cents bigint default 0 not null,
  overhead_cents bigint default 0 not null,
  supplement_fee_cents bigint default 0 not null,
  other_cents bigint default 0 not null,

  calculated_profit_cents bigint default 0 not null,
  payout_cents bigint default 0 not null,

  status text not null default 'draft' check (status in (
    'draft', 'approved', 'paid', 'voided'
  )),
  approved_at timestamptz,
  paid_at timestamptz,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create trigger set_updated_at_commission before update on public.commission
  for each row execute procedure public.set_updated_at();
create index if not exists commission_invoice_idx on public.commission (invoice_id);
create index if not exists commission_rep_idx on public.commission (rep_id, status);

-- Job P&L snapshot. Written on invoice update or on explicit recompute
-- so we can show margin drift over time and drive outlier alerts.
create table if not exists public.job_pnl_snapshot (
  id bigint generated always as identity primary key,
  invoice_id bigint not null references public.invoice (id) on delete cascade,
  snapshot_at timestamptz default now() not null,
  contract_cents bigint default 0 not null,
  abc_cents bigint default 0 not null,
  crew_cents bigint default 0 not null,
  home_depot_cents bigint default 0 not null,
  other_materials_cents bigint default 0 not null,
  overhead_cents bigint default 0 not null,
  supplement_fees_cents bigint default 0 not null,
  individual_charges_cents bigint default 0 not null,
  net_profit_cents bigint default 0 not null,
  net_profit_pct numeric(5, 2),
  created_at timestamptz default now() not null
);
create index if not exists job_pnl_invoice_idx
  on public.job_pnl_snapshot (invoice_id, snapshot_at desc);

-- ---------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------

insert into public.territory (name, description, zip_codes) values
  ('Jacksonville',    'Duval County core',   array['32099','32201','32202','32204','32205','32206','32207','32208','32209','32210','32211','32212','32216','32217','32218','32219','32220','32221','32222','32223','32224','32225','32226','32227','32233','32234','32244','32246','32250','32254','32256','32257','32258','32277']),
  ('Middleburg',      'Clay County',         array['32050','32065','32068','32073']),
  ('St. Augustine',   'St. Johns County',    array['32080','32084','32086','32092','32095']),
  ('Ponte Vedra',     'North St. Johns',     array['32081','32082'])
on conflict (name) do nothing;

insert into public.lead_status (name, sort_order, is_terminal) values
  ('New',                1,  false),
  ('Contact Attempted',  2,  false),
  ('Appointment Set',    3,  false),
  ('Inspected',          4,  false),
  ('Report Sent',        5,  false),
  ('Contingency Signed', 6,  false),
  ('Claim Filed',        7,  false),
  ('Approved',           8,  false),
  ('Installed',          9,  false),
  ('Collected',          10, false),
  ('Closed',             11, true),
  ('Lost (Bad Lead)',    12, true)
on conflict (name) do nothing;

insert into public.bad_lead_reason (code, label) values
  ('NO_ANSWER',         'No Answer'),
  ('REFUSED',           'Refused Inspection'),
  ('UNDER_CONTRACT',    'Already Under Contract'),
  ('NEW_ROOF',          'New Roof / No Damage'),
  ('NOT_INTERESTED',    'Not Interested'),
  ('WRONG_INFO',        'Wrong Info / Unreachable')
on conflict (code) do nothing;

insert into public.lead_source (name, source_type, payment_base_cents, payment_per_confirmed_cents, payment_per_bad_cents) values
  ('Tony Cisneros',            'vendor',    0,     0,    0),
  ('SAM Delivery',             'vendor',    0,     0,    0),
  ('In-House Call Center',     'in_house',  28000, 1500, 500),
  ('Canvassing',               'canvassing',0,     0,    0),
  ('Referral',                 'referral',  0,     0,    0),
  ('Organic / Website',        'organic',   0,     0,    0),
  ('CoreLogic MapAlerts',      'vendor',    0,     0,    0)
on conflict (name) do nothing;

insert into public.carrier (name) values
  ('State Farm'),
  ('Allstate'),
  ('USAA'),
  ('Manatee'),
  ('Citizens'),
  ('Progressive'),
  ('Liberty Mutual'),
  ('Farmers'),
  ('Travelers'),
  ('Nationwide')
on conflict (name) do nothing;
