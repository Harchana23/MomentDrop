import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSignedDownloadUrl } from "@/lib/storage";

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string | null;
  host_message: string | null;
  allow_uploads: boolean;
  allow_downloads: boolean;
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
      "id, slug, title, eyebrow, host_message, allow_uploads, allow_downloads, require_approval, active_until, status, file_limit",
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

export type GalleryItem = {
  id: string;
  url: string | null;
  mediaType: string | null;
  originalFileName: string | null;
  guestName: string;
};

/** Published photos/videos for an event's public gallery, newest first (signed URLs). */
export async function getPublicGallery(eventId: string, max = 200): Promise<GalleryItem[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb
    .from("uploads")
    .select("id, storage_path, media_type, original_file_name, guest_name")
    .eq("event_id", eventId)
    .eq("review_status", "published")
    .order("created_at", { ascending: false })
    .limit(max);

  return Promise.all(
    (data ?? [])
      .filter((r) => r.storage_path)
      .map(async (r) => ({
        id: r.id as string,
        url: await createSignedDownloadUrl(r.storage_path as string, 3600),
        mediaType: (r.media_type as string) ?? null,
        originalFileName: (r.original_file_name as string) ?? null,
        guestName: (r.guest_name as string) ?? "Guest",
      })),
  );
}
