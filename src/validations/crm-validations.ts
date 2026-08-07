import * as z from 'zod';

// ---------- Leads ----------

export const addLeadSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  street_address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, 'Use 2-letter state').optional().or(z.literal('')),
  zipcode: z.string().optional(),
  source_id: z.coerce.number().int().positive().optional(),
  status_id: z.coerce.number().int().positive().optional(),
  territory_id: z.coerce.number().int().positive().optional(),
  carrier_id: z.coerce.number().int().positive().optional(),
  roof_age_years: z.coerce.number().int().nonnegative().optional(),
  story_count: z.coerce.number().int().nonnegative().optional(),
  home_value_dollars: z.coerce.number().nonnegative().optional(),
  appointment_at: z.string().optional(),
  notes: z.string().optional()
});
export type AddLeadInput = z.infer<typeof addLeadSchema>;

export const markBadLeadSchema = z.object({
  bad_lead_reason_id: z.coerce.number().int().positive({ message: 'Pick a reason' }),
  notes: z.string().optional()
});

// ---------- Claims ----------

export const addClaimSchema = z.object({
  lead_id: z.coerce.number().int().positive(),
  claim_number: z.string().optional(),
  carrier_id: z.coerce.number().int().positive().optional(),
  adjuster_name: z.string().optional(),
  adjuster_phone: z.string().optional(),
  adjuster_email: z.string().email().optional().or(z.literal('')),
  policy_number: z.string().optional(),
  loss_date: z.string().optional(),
  deductible_dollars: z.coerce.number().nonnegative().optional(),
  acv_dollars: z.coerce.number().nonnegative().optional(),
  rcv_dollars: z.coerce.number().nonnegative().optional(),
  recoverable_depreciation_dollars: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional()
});
export type AddClaimInput = z.infer<typeof addClaimSchema>;

// ---------- Supplements ----------

export const addSupplementSchema = z.object({
  claim_id: z.coerce.number().int().positive(),
  submission_number: z.coerce.number().int().positive().default(1),
  amount_requested_dollars: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional()
});
export type AddSupplementInput = z.infer<typeof addSupplementSchema>;

export const supplementLineItemSchema = z.object({
  id: z.coerce.number().optional(),
  xactimate_code: z.string().optional(),
  description: z.string().min(1, 'Required'),
  qty: z.coerce.number().positive().default(1),
  unit: z.string().optional(),
  rate_dollars: z.coerce.number().nonnegative().default(0),
  sort_order: z.coerce.number().int().nonnegative().default(0)
});
export type SupplementLineItemInput = z.infer<typeof supplementLineItemSchema>;

// ---------- Requests ----------

export const addRequestSchema = z.object({
  request_type: z.enum([
    'permit_pull',
    'supplement_draft',
    'crew_schedule',
    'material_order',
    'cancel_lead',
    'inspection_report',
    'contract_send',
    'other'
  ]),
  subject: z.string().min(1, 'Required'),
  body: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  assignee_id: z.string().uuid().optional().or(z.literal('')),
  lead_id: z.coerce.number().int().positive().optional(),
  claim_id: z.coerce.number().int().positive().optional(),
  invoice_id: z.coerce.number().int().positive().optional(),
  sla_hours: z.coerce.number().int().positive().optional(),
  due_at: z.string().optional()
});
export type AddRequestInput = z.infer<typeof addRequestSchema>;

// ---------- Commissions ----------

export const addCommissionSchema = z.object({
  invoice_id: z.coerce.number().int().positive(),
  rep_id: z.string().uuid(),
  share_pct: z.coerce.number().min(0).max(100).default(50),
  overhead_cap_dollars: z.coerce.number().nonnegative().default(1800),
  contract_dollars: z.coerce.number().nonnegative().default(0),
  material_dollars: z.coerce.number().nonnegative().default(0),
  labor_dollars: z.coerce.number().nonnegative().default(0),
  overhead_dollars: z.coerce.number().nonnegative().default(0),
  supplement_fee_dollars: z.coerce.number().nonnegative().default(0),
  other_dollars: z.coerce.number().nonnegative().default(0),
  notes: z.string().optional()
});
export type AddCommissionInput = z.infer<typeof addCommissionSchema>;

// ---------- Call center ----------

export const addAgentSchema = z.object({
  display_name: z.string().min(1, 'Required'),
  supervisor_name: z.string().optional(),
  timezone: z.string().default('Asia/Amman'),
  base_pay_dollars: z.coerce.number().nonnegative().default(280),
  per_confirmed_dollars: z.coerce.number().nonnegative().default(15),
  per_bad_dollars: z.coerce.number().nonnegative().default(5),
  start_date: z.string().optional(),
  notes: z.string().optional()
});
export type AddAgentInput = z.infer<typeof addAgentSchema>;

export const submitCallCenterLeadSchema = z.object({
  agent_id: z.coerce.number().int().positive(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal('')),
  street_address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().length(2),
  zipcode: z.string().min(5),
  appointment_at: z.string().optional(),
  roof_age_years: z.coerce.number().int().nonnegative().optional(),
  notes: z.string().optional()
});
export type SubmitCallCenterLeadInput = z.infer<typeof submitCallCenterLeadSchema>;

// ---------- Carriers ----------

export const addCarrierSchema = z.object({
  name: z.string().min(1, 'Required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  notes_markdown: z.string().optional(),
  avg_response_days: z.coerce.number().int().nonnegative().optional()
});
export type AddCarrierInput = z.infer<typeof addCarrierSchema>;

// ---------- Territories ----------

export const addTerritorySchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  zip_codes_csv: z.string().optional() // comma-separated list
});
export type AddTerritoryInput = z.infer<typeof addTerritorySchema>;

// ---------- Rep profiles ----------

export const addRepProfileSchema = z.object({
  id: z.string().uuid('Must be a Supabase auth user id'),
  display_name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  default_commission_share_pct: z.coerce.number().min(0).max(100).default(50),
  default_overhead_cap_dollars: z.coerce.number().nonnegative().default(1800),
  notes: z.string().optional()
});
export type AddRepProfileInput = z.infer<typeof addRepProfileSchema>;
