import supabase from '../../lib/supabase-client';
import { TABLES } from '../../lib/db-tables';
import type {
  LeadSource,
  LeadStatus,
  Territory,
  BadLeadReason,
  Carrier
} from '../../types/crm_types';

export const fetchLeadSources = async (): Promise<LeadSource[]> => {
  const { data, error } = await supabase
    .from(TABLES.LEAD_SOURCE)
    .select('*')
    .order('name');
  if (error) throw error;
  return data as LeadSource[];
};

export const fetchLeadStatuses = async (): Promise<LeadStatus[]> => {
  const { data, error } = await supabase
    .from(TABLES.LEAD_STATUS)
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data as LeadStatus[];
};

export const fetchTerritories = async (): Promise<Territory[]> => {
  const { data, error } = await supabase
    .from(TABLES.TERRITORY)
    .select('*')
    .order('name');
  if (error) throw error;
  return data as Territory[];
};

export const fetchBadLeadReasons = async (): Promise<BadLeadReason[]> => {
  const { data, error } = await supabase
    .from(TABLES.BAD_LEAD_REASON)
    .select('*')
    .order('label');
  if (error) throw error;
  return data as BadLeadReason[];
};

export const fetchCarriers = async (): Promise<Carrier[]> => {
  const { data, error } = await supabase
    .from(TABLES.CARRIER)
    .select('*')
    .order('name');
  if (error) throw error;
  return data as Carrier[];
};
