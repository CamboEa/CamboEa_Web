import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Anonymous client for public reads guarded by RLS (e.g. lessons list). */
export function getSupabaseAnonClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}
