import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { driveThumbUrl, ensureEventFolder } from "@/lib/gdrive";

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  event_type: string | null;
  eyebrow: string | null;
  host_message: string | null;
  allow_uploads: boolean;
  allow_downloads: boolean;
  require_approval: boolean;
  active_until: string;
  status: string;
  file_limit: number;
  password_hash: string | null;
  per_guest_limit: number | null;
  cover_path: string | null;
  drive_folder_id: string | null;
};

/** Public event config by slug, read with the service-role client (guests are anonymous). */
export async function getPublicEventBySlug(slug: string): Promise<PublicEvent | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data } = await sb
    .from("events")
    .select(
      "id, slug, title, event_type, eyebrow, host_message, allow_uploads, allow_downloads, require_approval, active_until, status, file_limit, password_hash, per_guest_limit, cover_path, drive_folder_id",
    )
    .eq("slug", slug)
    .maybeSingle();
  return (data as PublicEvent) ?? null;
}

/**
 * The event's Drive folder id, captured on first use. Storing the id (not the
 * slug) means renaming the event URL never orphans the folder. Existing events
 * adopt their current slug-named folder the first time this runs.
 */
export async function resolveEventFolderId(event: {
  id: string;
  slug: string;
  drive_folder_id: string | null;
}): Promise<string> {
  if (event.drive_folder_id) return event.drive_folder_id;
  const folderId = await ensureEventFolder(event.slug);
  if (folderId) {
    const sb = getSupabaseAdmin();
    if (sb) await sb.from("events").update({ drive_folder_id: folderId }).eq("id", event.id);
  }
  return folderId;
}

/** How many photos/videos this guest (by name) has already uploaded to the event. */
export async function countGuestUploads(eventId: string, guestName: string): Promise<number> {
  const sb = getSupabaseAdmin();
  if (!sb || !guestName.trim()) return 0;
  // Escape LIKE wildcards so a name like "50%" matches literally, not as a pattern.
  const safe = guestName.trim().replace(/([\\%_])/g, "\\$1");
  const { count } = await sb
    .from("uploads")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .ilike("guest_name", safe);
  return count ?? 0;
}

/** How many photos/videos this device (by cookie token) has uploaded to the event. */
export async function countGuestUploadsByToken(eventId: string, token: string): Promise<number> {
  const sb = getSupabaseAdmin();
  if (!sb || !token) return 0;
  const { count } = await sb
    .from("uploads")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("guest_token", token);
  return count ?? 0;
}

export type PublicEventStats = {
  photos: number;
  videos: number;
  guests: number;
  /** First-letter avatars of the most recent distinct guests. */
  initials: string[];
};

/** Photo/video/guest counts + recent guest initials for the guest page header. */
export async function getPublicEventStats(eventId: string): Promise<PublicEventStats> {
  const sb = getSupabaseAdmin();
  if (!sb) return { photos: 0, videos: 0, guests: 0, initials: [] };
  const pub = () =>
    sb.from("uploads").select("*", { count: "exact", head: true }).eq("event_id", eventId).eq("review_status", "published");
  const [ph, vd, gs, recent] = await Promise.all([
    pub().eq("media_type", "photo"),
    pub().eq("media_type", "video"),
    sb.from("guests").select("*", { count: "exact", head: true }).eq("event_id", eventId),
    sb
      .from("uploads")
      .select("guest_name")
      .eq("event_id", eventId)
      .eq("review_status", "published")
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const seen = new Set<string>();
  const initials: string[] = [];
  for (const r of recent.data ?? []) {
    const n = ((r.guest_name as string) ?? "").trim();
    if (!n) continue;
    const key = n.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    initials.push(n[0].toUpperCase());
    if (initials.length >= 5) break;
  }
  return { photos: ph.count ?? 0, videos: vd.count ?? 0, guests: gs.count ?? 0, initials };
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

  return (data ?? [])
    .filter((r) => r.storage_path)
    .map((r) => ({
      id: r.id as string,
      url: driveThumbUrl(r.storage_path as string, 1600),
      mediaType: (r.media_type as string) ?? null,
      originalFileName: (r.original_file_name as string) ?? null,
      guestName: (r.guest_name as string) ?? "Guest",
    }));
}

/**
 * Drive file id for a single published video in an event, or null.
 *
 * The video-streaming route uses this to enforce that only a *published* *video*
 * *belonging to this event* can be streamed — never an arbitrary Drive file id.
 */
export async function getPublishedVideoDriveId(
  eventId: string,
  uploadId: string,
): Promise<string | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data } = await sb
    .from("uploads")
    .select("storage_path, media_type, review_status")
    .eq("event_id", eventId)
    .eq("id", uploadId)
    .maybeSingle();
  if (!data || data.review_status !== "published" || data.media_type !== "video") return null;
  return (data.storage_path as string) ?? null;
}
