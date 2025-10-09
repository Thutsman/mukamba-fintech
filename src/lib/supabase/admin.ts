import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server-only Supabase client using the service role key.
// Must NEVER be imported from client components.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase URL or Service Role key');
  }

  return createSupabaseClient(url, serviceRoleKey);
}


