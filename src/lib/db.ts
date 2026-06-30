import { getSupabaseAdmin } from "./supabase/admin";
import { mediaTypeFor } from "./storage";

export type UploadedFileInput = {
  storagePath: string;
  originalFileName: string;
  mimeType: string;
  size: number;
};

/**
 * Persist upload metadata for an event + bump the guest's count.
 * `reviewStatus` is 'published' normally, or 'pending' when the event requires
 * approval before guests' uploads are visible. Returns the inserted count.
 */
export async function recordUploads(
  eventId: string,
  guestName: string,
  files: UploadedFileInput[],
  reviewStatus: "published" | "pending" = "published",
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
    review_status: reviewStatus,
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
