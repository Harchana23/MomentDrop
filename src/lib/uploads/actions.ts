"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

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
