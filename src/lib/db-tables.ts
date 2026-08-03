export const TABLES = {
  // Customer related tables
  CUSTOMER: 'customer',
  CUSTOMER_TYPE: 'customer_type',

  // Invoice related tables
  INVOICE: 'invoice',
  INVOICE_LINE_SERVICE: 'invoice_line_service',
  INVOICE_PAYMENT: 'invoice_payment',
  INVOICE_STATUS: 'invoice_status',

  // Project related tables
  PROJECTS: 'projects',

  // Quote related tables
  QUOTE: 'quote',
  QUOTE_LINE_ITEM: 'quote_line_item',
  QUOTE_REQUEST: 'quote_request',
  QUOTE_REQUEST_STATUS: 'quote_request_status',
  QUOTE_STATUS: 'quote_status',

  // Service related tables
  SERVICE: 'service',

  // CRM domain tables introduced in Phase 1 of the roadmap.
  // See docs/CRM_ROADMAP.md and the 20260420000000 migration.
  LEAD: 'lead',
  LEAD_ACTIVITY: 'lead_activity',
  LEAD_SOURCE: 'lead_source',
  LEAD_STATUS: 'lead_status',
  TERRITORY: 'territory',
  BAD_LEAD_REASON: 'bad_lead_reason',
  CARRIER: 'carrier',
  REP_PROFILE: 'rep_profile',
  REP_TERRITORY: 'rep_territory',
  CLAIM: 'claim',
  SUPPLEMENT: 'supplement',
  SUPPLEMENT_LINE_ITEM: 'supplement_line_item',
  SUPPLEMENT_TEMPLATE: 'supplement_template',
  CALL_CENTER_AGENT: 'call_center_agent',
  CALL_CENTER_LEAD_SUBMISSION: 'call_center_lead_submission',
  REQUEST: 'request',
  COMMISSION: 'commission',
  JOB_PNL_SNAPSHOT: 'job_pnl_snapshot'
};
