import { supabaseServer } from "@/lib/supabase/server";

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  event_type: string;
  event_date: string | null;
  host_message: string | null;
  plan: string;
  file_limit: number;
  active_until: string;
  status: string;
};

/** The event if it belongs to the signed-in owner, else null (RLS-enforced). */
export async function getEventForOwner(id: string): Promise<EventRow | null> {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("events")
    .select(
      "id, slug, title, event_type, event_date, host_message, plan, file_limit, active_until, status",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as EventRow) ?? null;
}

export async function getEventStats(
  eventId: string,
): Promise<{ uploads: number; guests: number }> {
  const sb = await supabaseServer();
  const [uploads, guests] = await Promise.all([
    sb.from("uploads").select("*", { count: "exact", head: true }).eq("event_id", eventId),
    sb.from("guests").select("*", { count: "exact", head: true }).eq("event_id", eventId),
  ]);
  return { uploads: uploads.count ?? 0, guests: guests.count ?? 0 };
}
