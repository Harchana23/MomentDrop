"use client";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/** Browser-side Supabase client (anon key, RLS-enforced). */
export function supabaseBrowser() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
