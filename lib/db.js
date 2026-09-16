import { createClient } from '@supabase/supabase-js';

let _supabase = null;

/**
 * Returns a singleton Supabase client.
 * Lazily initialized on first call (at request time, not build time).
 * This avoids crashes during Next.js static build when env vars aren't yet available.
 */
export function getSupabase() {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment.'
    );
  }

  _supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  return _supabase;
}
