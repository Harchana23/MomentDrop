import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export type Countdown = {
  available: boolean; // false if the DB columns don't exist yet (migration not run)
  enabled: boolean;
  title: string | null;
  until: string | null;
};

const NONE: Countdown = { available: false, enabled: false, title: null, until: null };

function fromRow(data: Record<string, unknown>): Countdown {
  return {
    available: true,
    enabled: Boolean(data.countdown_enabled),
    title: (data.countdown_title as string) ?? null,
    until: (data.countdown_until as string) ?? null,
  };
}

/** Countdown config for the public guest page (service-role). Degrades to NONE pre-migration. */
export async function getCountdownPublic(eventId: string): Promise<Countdown> {
  const sb = getSupabaseAdmin();
  if (!sb) return NONE;
  const { data, error } = await sb
    .from("events")
    .select("countdown_enabled, countdown_title, countdown_until")
    .eq("id", eventId)
    .maybeSingle();
  if (error || !data) return NONE;
  return fromRow(data);
}

/** Countdown config for the owner settings page (RLS). Degrades to NONE pre-migration. */
export async function getCountdownOwner(eventId: string): Promise<Countdown> {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("events")
    .select("countdown_enabled, countdown_title, countdown_until")
    .eq("id", eventId)
    .maybeSingle();
  if (error || !data) return NONE;
  return fromRow(data);
}

export function countingDown(cd: Countdown): boolean {
  return cd.enabled && !!cd.until && new Date(cd.until).getTime() > Date.now();
}
