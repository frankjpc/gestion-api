import { createClient } from '@supabase/supabase-js';

let _supabase = null;

/**
 * Returns a lazy-initialized Supabase client.
 * Does NOT throw at build time — only fails at runtime if env vars are wrong.
 */
export function getSupabase() {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  // createClient does not throw with empty strings.
  // If vars are missing, DB calls will return auth errors at request time,
  // but the build will complete successfully.
  _supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  return _supabase;
}
