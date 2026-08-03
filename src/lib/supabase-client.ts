import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL;
const supabaseKey = import.meta.env.REACT_APP_SUPABASE_KEY;

// Guard: if env vars are missing, fall back to a placeholder client instead of
// throwing at module load — an unconfigured build would otherwise white-screen
// every route, including the public marketing website at /website.
if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase env vars (REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_KEY) are not set — CRM data features are disabled.'
  );
}

export default createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-anon-key'
);
