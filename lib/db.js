import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
  );
}

/**
 * Singleton Supabase client using the service_role key.
 * This runs only on the server (API routes) — never exposed to the browser.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});
