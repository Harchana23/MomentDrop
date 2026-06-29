import { getSupabaseAdmin } from "./supabase";

export const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_SLUG ?? "harchana-wedding";

export type UploadRecord = {
  id: string;
  guestName: string;
  originalFileName?: string;
  mediaType?: string;
  status?: string;
  driveWebViewLink?: string;
  createdAt?: string | null;
};

export type DashboardStats = {
  uploads: number;
  guests: number;
};

/** Live upload + guest counts for the dashboard, or null if Supabase isn't configured. */
export async function getDashboardStats(
  eventId: string = EVENT_ID,
): Promise<DashboardStats | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;

  const [uploads, guests] = await Promise.all([
    sb.from("uploads").select("*", { count: "exact", head: true }).eq("event_id", eventId),
    sb.from("guests").select("*", { count: "exact", head: true }).eq("event_id", eventId),
  ]);

  return { uploads: uploads.count ?? 0, guests: guests.count ?? 0 };
}

/** Most recent uploads (newest first), or [] if Supabase isn't configured. */
export async function getRecentUploads(
  eventId: string = EVENT_ID,
  max = 10,
): Promise<UploadRecord[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data } = await sb
    .from("uploads")
    .select("id, guest_name, original_file_name, media_type, status, drive_web_view_link, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(max);

  return (data ?? []).map((r) => ({
    id: r.id as string,
    guestName: (r.guest_name as string) ?? "Guest",
    originalFileName: (r.original_file_name as string) ?? undefined,
    mediaType: (r.media_type as string) ?? undefined,
    status: (r.status as string) ?? "Ready",
    driveWebViewLink: (r.drive_web_view_link as string) ?? undefined,
    createdAt: (r.created_at as string) ?? null,
  }));
}
