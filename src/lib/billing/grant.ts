import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PLANS, type PlanKey } from "./plans";

/** Apply a paid plan to an event (called only from the verified Stripe webhook). */
export async function upgradeEvent(eventId: string, planKey: PlanKey): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) return false;
  const plan = PLANS[planKey];
  const activeUntil = new Date(Date.now() + plan.days * 86_400_000).toISOString();
  const { error } = await sb
    .from("events")
    .update({
      plan: plan.key,
      file_limit: plan.fileLimit,
      active_until: activeUntil,
      status: "active",
    })
    .eq("id", eventId);
  return !error;
}
