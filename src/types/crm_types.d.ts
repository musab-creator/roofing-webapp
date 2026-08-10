// CRM domain types introduced in Phase 1.
// Mirrors supabase/migrations/20260420000000_crm_domain_expansion.sql.
// All money is stored in cents as bigint; TS mirrors as `number` since
// we do not deal with amounts beyond Number.MAX_SAFE_INTEGER in cents.

// ---------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------

type Timestamps = {
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------
// Lookup tables
// ---------------------------------------------------------------------

export type LeadSourceType =
  | 'vendor'
  | 'in_house'
  | 'referral'
  | 'organic'
  | 'canvassing'
  | 'other';

export type LeadSourceInsert = {
  name: string;
  source_type: LeadSourceType;
  contact_info?: string;
  payment_base_cents?: number;
  payment_per_confirmed_cents?: number;
  payment_per_bad_cents?: number;
  active?: boolean;
  notes?: string;
};

export type LeadSource = LeadSourceInsert & {
  id: number;
  payment_base_cents: number;
  payment_per_confirmed_cents: number;
  payment_per_bad_cents: number;
  active: boolean;
} & Timestamps;

export type TerritoryInsert = {
  name: string;
  description?: string;
  zip_codes?: string[];
  active?: boolean;
};

export type Territory = TerritoryInsert & {
  id: number;
  zip_codes: string[];
  active: boolean;
} & Timestamps;

export type BadLeadReasonCode =
  | 'NO_ANSWER'
  | 'REFUSED'
  | 'UNDER_CONTRACT'
  | 'NEW_ROOF'
  | 'NOT_INTERESTED'
  | 'WRONG_INFO';

export type BadLeadReasonInsert = {
  code: BadLeadReasonCode | string;
  label: string;
  active?: boolean;
};

export type BadLeadReason = BadLeadReasonInsert & {
  id: number;
  active: boolean;
} & Timestamps;

export type LeadStatusName =
  | 'New'
  | 'Contact Attempted'
  | 'Appointment Set'
  | 'Inspected'
  | 'Report Sent'
  | 'Contingency Signed'
  | 'Claim Filed'
  | 'Approved'
  | 'Installed'
  | 'Collected'
  | 'Closed'
  | 'Lost (Bad Lead)';

export type LeadStatusInsert = {
  name: LeadStatusName | string;
  description?: string;
  sort_order?: number;
  is_terminal?: boolean;
};

export type LeadStatus = LeadStatusInsert & {
  id: number;
  sort_order: number;
  is_terminal: boolean;
} & Timestamps;

export type CarrierInsert = {
  name: string;
  phone?: string;
  email?: string;
  notes_markdown?: string;
  avg_response_days?: number;
  active?: boolean;
};

export type Carrier = CarrierInsert & {
  id: number;
  active: boolean;
} & Timestamps;

// ---------------------------------------------------------------------
// Rep profile
// ---------------------------------------------------------------------

export type RepProfileInsert = {
  id: string; // uuid matching auth.users.id
  display_name: string;
  phone?: string;
  email?: string;
  default_commission_share_pct?: number;
  default_overhead_cap_cents?: number;
  active?: boolean;
  notes?: string;
};

export type RepProfile = RepProfileInsert & {
  default_commission_share_pct: number;
  default_overhead_cap_cents: number;
  active: boolean;
} & Timestamps;

export type RepTerritory = {
  rep_id: string;
  territory_id: number;
  is_primary: boolean;
  created_at: string;
};

// ---------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------

export type LeadInsert = {
  external_ref?: string;
  source_id?: number | null;
  status_id?: number | null;
  territory_id?: number | null;
  assigned_rep_id?: string | null;

  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zipcode?: string;

  roof_age_years?: number;
  story_count?: number;
  home_value_cents?: number;
  carrier_id?: number | null;
  carrier_name_override?: string;

  appointment_at?: string;
  score?: number;
  notes?: string;

  promoted_customer_id?: number | null;
  promoted_at?: string | null;

  bad_lead_reason_id?: number | null;
  bad_lead_credit_requested_at?: string | null;
  bad_lead_credit_received?: boolean;
};

export type Lead = LeadInsert & {
  id: number;
  bad_lead_credit_received: boolean;
} & Timestamps;

export type LeadWithRelations = Lead & {
  source: LeadSource | null;
  status: LeadStatus | null;
  territory: Territory | null;
  carrier: Carrier | null;
  bad_lead_reason: BadLeadReason | null;
};

export type LeadActivityType =
  | 'call'
  | 'sms'
  | 'email'
  | 'note'
  | 'status_change'
  | 'assignment'
  | 'site_visit'
  | 'document'
  | 'photo'
  | 'system';

export type LeadActivityInsert = {
  lead_id: number;
  activity_type: LeadActivityType;
  actor_id?: string | null;
  body?: string;
  metadata?: Record<string, unknown>;
  occurred_at?: string;
};

export type LeadActivity = LeadActivityInsert & {
  id: number;
  metadata: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
};

// ---------------------------------------------------------------------
// Claims & supplements
// ---------------------------------------------------------------------

export type ClaimStatus =
  | 'draft'
  | 'filed'
  | 'inspecting'
  | 'approved'
  | 'partial'
  | 'denied'
  | 'closed'
  | 'appealing';

export type ClaimInsert = {
  lead_id: number;
  claim_number?: string;
  carrier_id?: number | null;
  carrier_name_override?: string;
  adjuster_name?: string;
  adjuster_phone?: string;
  adjuster_email?: string;
  policy_number?: string;
  loss_date?: string;
  deductible_cents?: number;
  acv_cents?: number;
  rcv_cents?: number;
  recoverable_depreciation_cents?: number;
  status?: ClaimStatus;
  filed_at?: string;
  approved_at?: string;
  notes?: string;
};

export type Claim = ClaimInsert & {
  id: number;
  status: ClaimStatus;
} & Timestamps;

export type ClaimWithRelations = Claim & {
  lead: Lead;
  carrier: Carrier | null;
  supplements: Supplement[];
};

export type SupplementStatus =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'approved'
  | 'partial'
  | 'denied'
  | 'appealing';

export type SupplementTemplateLineItem = {
  xactimate_code?: string;
  description: string;
  qty?: number;
  unit?: string;
  rate_cents?: number;
};

export type SupplementTemplateInsert = {
  name: string;
  description?: string;
  line_items_json?: SupplementTemplateLineItem[];
  active?: boolean;
};

export type SupplementTemplate = SupplementTemplateInsert & {
  id: number;
  line_items_json: SupplementTemplateLineItem[];
  active: boolean;
} & Timestamps;

export type SupplementInsert = {
  claim_id: number;
  submission_number?: number;
  amount_requested_cents?: number;
  amount_approved_cents?: number;
  status?: SupplementStatus;
  submitted_at?: string;
  response_at?: string;
  xactimate_esx_path?: string;
  counter_estimate_pdf_path?: string;
  notes?: string;
};

export type Supplement = SupplementInsert & {
  id: number;
  submission_number: number;
  status: SupplementStatus;
} & Timestamps;

export type SupplementLineItemInsert = {
  supplement_id: number;
  xactimate_code?: string;
  description: string;
  qty?: number;
  unit?: string;
  rate_cents?: number;
  amount_cents?: number;
  approved_qty?: number;
  approved_amount_cents?: number;
  approved?: boolean | null;
  sort_order?: number;
};

export type SupplementLineItem = SupplementLineItemInsert & {
  id: number;
  qty: number;
  rate_cents: number;
  amount_cents: number;
  sort_order: number;
} & Timestamps;

export type SupplementWithRelations = Supplement & {
  line_items: SupplementLineItem[];
  claim: Claim;
};

// ---------------------------------------------------------------------
// Call center
// ---------------------------------------------------------------------

export type CallCenterAgentInsert = {
  auth_user_id?: string | null;
  display_name: string;
  supervisor_name?: string;
  timezone?: string;
  base_pay_cents?: number;
  per_confirmed_cents?: number;
  per_bad_cents?: number;
  start_date?: string;
  active?: boolean;
  notes?: string;
};

export type CallCenterAgent = CallCenterAgentInsert & {
  id: number;
  timezone: string;
  base_pay_cents: number;
  per_confirmed_cents: number;
  per_bad_cents: number;
  active: boolean;
} & Timestamps;

export type CallCenterLeadSubmissionInsert = {
  lead_id: number;
  agent_id: number;
  confirmed?: boolean | null;
  confirmed_at?: string;
  bad_lead_reason_id?: number | null;
  payout_cents?: number;
  reviewed_by?: string | null;
  reviewed_at?: string;
  notes?: string;
};

export type CallCenterLeadSubmission = CallCenterLeadSubmissionInsert & {
  id: number;
} & Timestamps;

// ---------------------------------------------------------------------
// Request queue
// ---------------------------------------------------------------------

export type RequestType =
  | 'permit_pull'
  | 'supplement_draft'
  | 'crew_schedule'
  | 'material_order'
  | 'cancel_lead'
  | 'inspection_report'
  | 'contract_send'
  | 'other';

export type RequestStatus =
  | 'open'
  | 'in_progress'
  | 'blocked'
  | 'done'
  | 'cancelled';

export type RequestPriority = 'low' | 'normal' | 'high' | 'urgent';

export type RequestInsert = {
  request_type: RequestType;
  subject: string;
  body?: string;
  requester_id?: string | null;
  assignee_id?: string | null;
  lead_id?: number | null;
  claim_id?: number | null;
  invoice_id?: number | null;
  status?: RequestStatus;
  priority?: RequestPriority;
  sla_hours?: number;
  due_at?: string;
  completed_at?: string;
};

export type Request = RequestInsert & {
  id: number;
  status: RequestStatus;
  priority: RequestPriority;
} & Timestamps;

// ---------------------------------------------------------------------
// Commissions & P&L
// ---------------------------------------------------------------------

export type CommissionStatus = 'draft' | 'approved' | 'paid' | 'voided';

export type CommissionInsert = {
  invoice_id: number;
  rep_id: string;
  share_pct: number;
  overhead_cap_cents: number;
  contract_cents?: number;
  material_cents?: number;
  labor_cents?: number;
  overhead_cents?: number;
  supplement_fee_cents?: number;
  other_cents?: number;
  calculated_profit_cents?: number;
  payout_cents?: number;
  status?: CommissionStatus;
  approved_at?: string;
  paid_at?: string;
  notes?: string;
};

export type Commission = CommissionInsert & {
  id: number;
  contract_cents: number;
  material_cents: number;
  labor_cents: number;
  overhead_cents: number;
  supplement_fee_cents: number;
  other_cents: number;
  calculated_profit_cents: number;
  payout_cents: number;
  status: CommissionStatus;
} & Timestamps;

export type JobPnlSnapshotInsert = {
  invoice_id: number;
  snapshot_at?: string;
  contract_cents?: number;
  abc_cents?: number;
  crew_cents?: number;
  home_depot_cents?: number;
  other_materials_cents?: number;
  overhead_cents?: number;
  supplement_fees_cents?: number;
  individual_charges_cents?: number;
  net_profit_cents?: number;
  net_profit_pct?: number;
};

export type JobPnlSnapshot = JobPnlSnapshotInsert & {
  id: number;
  snapshot_at: string;
  contract_cents: number;
  abc_cents: number;
  crew_cents: number;
  home_depot_cents: number;
  other_materials_cents: number;
  overhead_cents: number;
  supplement_fees_cents: number;
  individual_charges_cents: number;
  net_profit_cents: number;
  created_at: string;
};
