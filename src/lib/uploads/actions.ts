"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getEventForOwner } from "@/lib/events/queries";
import { deleteDriveFile } from "@/lib/gdrive";

const ALLOWED = ["published", "pending", "hidden"];

/** Owner moderates an upload (approve/hide/restore). RLS limits this to their events. */
export async function setUploadStatus(formData: FormData) {
  const id = String(formData.get("uploadId") ?? "");
  const status = String(formData.get("status") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  if (!id || !ALLOWED.includes(status)) return;

  const sb = await supabaseServer();
  await sb.from("uploads").update({ review_status: status }).eq("id", id);
  revalidatePath(`/dashboard/events/${eventId}/media`);
}

/**
 * Owner permanently deletes an upload — the Google Drive file AND the database row.
 * Unlike "hide" (reversible), this cannot be undone.
 */
export async function deleteUpload(formData: FormData) {
  const id = String(formData.get("uploadId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  if (!id || !eventId) return;

  // Re-verify ownership server-side — never trust the form's eventId.
  const event = await getEventForOwner(eventId);
  if (!event) return;

  const sb = getSupabaseAdmin();
  if (!sb) return;

  // Look up the Drive file id, scoped to this owned event, before removing the row.
  const { data } = await sb
    .from("uploads")
    .select("storage_path")
    .eq("id", id)
    .eq("event_id", eventId)
    .maybeSingle();
  if (!data) return; // not found, or not part of this event

  // Delete the file first, then the row. If the Drive delete fails we still remove the
  // row so it leaves the dashboard; an orphaned file is harmless and cleaned with the
  // event folder later.
  if (data.storage_path) {
    try {
      await deleteDriveFile(data.storage_path as string);
    } catch {}
  }
  await sb.from("uploads").delete().eq("id", id).eq("event_id", eventId);

  revalidatePath(`/dashboard/events/${eventId}/media`);
}
