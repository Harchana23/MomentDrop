"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export async function createAlbum(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const allowUploads = formData.get("allow_uploads") === "on";
  if (!title) {
    redirect(`/dashboard/events/${eventId}/albums?error=${encodeURIComponent("Album title is required.")}`);
  }

  const sb = await supabaseServer();
  const { error } = await sb
    .from("albums")
    .insert({ event_id: eventId, title, allow_uploads: allowUploads });
  if (error) {
    const msg = /relation|albums|column/i.test(error.message)
      ? "Run supabase/005_albums.sql in Supabase to enable Albums."
      : error.message;
    redirect(`/dashboard/events/${eventId}/albums?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath(`/dashboard/events/${eventId}/albums`);
  redirect(`/dashboard/events/${eventId}/albums?saved=1`);
}

export async function deleteAlbum(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const albumId = String(formData.get("albumId") ?? "");
  const sb = await supabaseServer();
  await sb.from("albums").delete().eq("id", albumId);
  revalidatePath(`/dashboard/events/${eventId}/albums`);
  redirect(`/dashboard/events/${eventId}/albums?saved=1`);
}
