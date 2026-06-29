import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** True only when the server-side Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

let cached: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service-role key (bypasses RLS).
 * SERVER-ONLY — never import this into a client component.
 * Returns null if Supabase isn't configured yet.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return cached;
}
