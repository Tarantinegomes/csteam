const SUPABASE_URL = 'https://eigqvxgmfruxpmrgqype.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Fyezu7Lm4hhGvXj05MGizg_JcL6LpOC';
const SUPABASE_STATE_TABLE = 'app_state';
const SUPABASE_STATE_ROW_ID = 'global';

window.CSTEAM_SUPABASE = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  stateTable: SUPABASE_STATE_TABLE,
  stateRowId: SUPABASE_STATE_ROW_ID,
  client: window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
};
