import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string | null;
  host_message: string | null;
  allow_uploads: boolean;
  require_approval: boolean;
  active_until: string;
  status: string;
  file_limit: number;
};

/** Public event config by slug, read with the service-role client (guests are anonymous). */
export async function getPublicEventBySlug(slug: string): Promise<PublicEvent | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data } = await sb
    .from("events")
    .select(
      "id, slug, title, eyebrow, host_message, allow_uploads, require_approval, active_until, status, file_limit",
    )
    .eq("slug", slug)
    .maybeSingle();
  return (data as PublicEvent) ?? null;
}

export async function countEventUploads(eventId: string): Promise<number> {
  const sb = getSupabaseAdmin();
  if (!sb) return 0;
  const { count } = await sb
    .from("uploads")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);
  return count ?? 0;
}

/** Whether the event is currently accepting guest uploads, with a reason if not. */
export function uploadsOpen(e: PublicEvent): { open: boolean; reason?: string } {
  if (e.status !== "active") return { open: false, reason: "This event isn't active yet." };
  if (!e.allow_uploads) return { open: false, reason: "Uploads are turned off for this event." };
  if (new Date(e.active_until).getTime() < Date.now())
    return { open: false, reason: "This event has ended." };
  return { open: true };
}
