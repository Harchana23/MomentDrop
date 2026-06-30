import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { UPGRADE_DAYS, UPGRADE_FILE_LIMIT } from "./config";

/** Apply the paid "Event" plan to an event (called from the verified payment callback). */
export async function upgradeEvent(eventId: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) return false;
  const activeUntil = new Date(Date.now() + UPGRADE_DAYS * 86_400_000).toISOString();
  const { error } = await sb
    .from("events")
    .update({
      plan: "event",
      file_limit: UPGRADE_FILE_LIMIT,
      active_until: activeUntil,
      status: "active",
    })
    .eq("id", eventId);
  return !error;
}
