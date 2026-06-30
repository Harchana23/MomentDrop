import { getSupabaseAdmin } from "./supabase";
import { mediaTypeFor } from "./storage";

export const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_SLUG ?? "harchana-wedding";

export type UploadRecord = {
  id: string;
  guestName: string;
  originalFileName?: string;
  mediaType?: string;
  status?: string;
  storagePath?: string;
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
    .select(
      "id, guest_name, original_file_name, media_type, status, storage_path, drive_web_view_link, created_at",
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(max);

  return (data ?? []).map(mapUploadRow);
}

/** Every upload's storage path for the event (used to build the export ZIP). */
export async function getAllUploadFiles(
  eventId: string = EVENT_ID,
): Promise<{ storagePath: string; originalFileName: string; guestName: string }[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data } = await sb
    .from("uploads")
    .select("storage_path, original_file_name, guest_name")
    .eq("event_id", eventId)
    .not("storage_path", "is", null)
    .order("created_at", { ascending: true });

  return (data ?? [])
    .filter((r) => r.storage_path)
    .map((r) => ({
      storagePath: r.storage_path as string,
      originalFileName: (r.original_file_name as string) ?? "file",
      guestName: (r.guest_name as string) ?? "Guest",
    }));
}

export type UploadedFileInput = {
  storagePath: string;
  originalFileName: string;
  mimeType: string;
  size: number;
};

/** Persist upload metadata + bump the guest's count. Returns inserted count. */
export async function recordUploads(
  eventId: string,
  guestName: string,
  files: UploadedFileInput[],
): Promise<number> {
  const sb = getSupabaseAdmin();
  if (!sb || files.length === 0) return 0;

  const rows = files.map((f) => ({
    event_id: eventId,
    guest_name: guestName,
    original_file_name: f.originalFileName,
    media_type: mediaTypeFor(f.mimeType),
    mime_type: f.mimeType,
    size_bytes: f.size,
    storage_path: f.storagePath,
    status: "Ready",
  }));

  const { error } = await sb.from("uploads").insert(rows);
  if (error) throw new Error(error.message);

  await upsertGuest(sb, eventId, guestName, files.length);
  return rows.length;
}

type SupabaseAdmin = NonNullable<ReturnType<typeof getSupabaseAdmin>>;

async function upsertGuest(
  sb: SupabaseAdmin,
  eventId: string,
  guestName: string,
  added: number,
) {
  const { data: existing } = await sb
    .from("guests")
    .select("id, upload_count")
    .eq("event_id", eventId)
    .eq("display_name", guestName)
    .limit(1)
    .maybeSingle();

  if (existing) {
    await sb
      .from("guests")
      .update({ upload_count: (existing.upload_count ?? 0) + added })
      .eq("id", existing.id);
  } else {
    await sb
      .from("guests")
      .insert({ event_id: eventId, display_name: guestName, upload_count: added });
  }
}

type UploadRow = {
  id: string;
  guest_name?: string | null;
  original_file_name?: string | null;
  media_type?: string | null;
  status?: string | null;
  storage_path?: string | null;
  drive_web_view_link?: string | null;
  created_at?: string | null;
};

function mapUploadRow(r: UploadRow): UploadRecord {
  return {
    id: r.id,
    guestName: r.guest_name ?? "Guest",
    originalFileName: r.original_file_name ?? undefined,
    mediaType: r.media_type ?? undefined,
    status: r.status ?? "Ready",
    storagePath: r.storage_path ?? undefined,
    driveWebViewLink: r.drive_web_view_link ?? undefined,
    createdAt: r.created_at ?? null,
  };
}
