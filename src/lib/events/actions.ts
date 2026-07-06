"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteEventFolder, uploadBytesToDrive, makePublicRead } from "@/lib/gdrive";
import { makeEventSlug, slugify } from "@/lib/slug";
import { hashPassword } from "@/lib/password";

export async function createEvent(formData: FormData) {
  const sb = await supabaseServer();
  const { data: claims } = await sb.auth.getClaims();
  const uid = claims?.claims?.sub;
  if (!uid) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    redirect("/onboarding?error=" + encodeURIComponent("Please enter an event name."));
  }
  const eventType = String(formData.get("event_type") ?? "wedding");
  const eventDate = String(formData.get("event_date") ?? "");
  const hostMessage = String(formData.get("host_message") ?? "").trim();

  const { data, error } = await sb
    .from("events")
    .insert({
      owner_id: uid,
      slug: makeEventSlug(title),
      title,
      event_type: eventType,
      event_date: eventDate || null,
      host_message: hostMessage || null,
    })
    .select("id")
    .single();

  if (error) redirect("/onboarding?error=" + encodeURIComponent(error.message));
  redirect(`/dashboard/events/${data.id}`);
}

function settings(id: string, qs: string): never {
  redirect(`/dashboard/events/${id}/settings?${qs}`);
}

export async function updateEventDetails(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) settings(id, "error=" + encodeURIComponent("Event name is required."));

  const perGuestRaw = String(formData.get("per_guest_limit") ?? "").trim();
  const perGuestNum = parseInt(perGuestRaw, 10);
  const patch = {
    title,
    eyebrow: String(formData.get("eyebrow") ?? "").trim() || null,
    host_message: String(formData.get("host_message") ?? "").trim() || null,
    event_date: String(formData.get("event_date") ?? "") || null,
    event_type: String(formData.get("event_type") ?? "wedding"),
    per_guest_limit: perGuestRaw === "" || Number.isNaN(perGuestNum) || perGuestNum < 1 ? null : perGuestNum,
  };
  const sb = await supabaseServer();
  const { error } = await sb.from("events").update(patch).eq("id", id);
  if (error) settings(id, "error=" + encodeURIComponent(error.message));
  revalidatePath(`/dashboard/events/${id}/settings`);
  settings(id, "saved=details");
}

export async function updateEventCover(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const file = formData.get("cover");
  if (!(file instanceof File) || file.size === 0) {
    settings(id, "error=" + encodeURIComponent("Choose an image to upload."));
  }
  const img = file as File;
  if (!img.type.startsWith("image/")) {
    settings(id, "error=" + encodeURIComponent("The cover must be an image (JPG or PNG)."));
  }

  const sb = await supabaseServer();
  // RLS scopes this to the owner; also gives us the slug (Drive folder key).
  const { data: ev } = await sb.from("events").select("id, slug").eq("id", id).maybeSingle();
  if (!ev) settings(id, "error=" + encodeURIComponent("Event not found."));

  const bytes = Buffer.from(await img.arrayBuffer());
  const fileId = await uploadBytesToDrive(
    (ev as { slug: string }).slug,
    `cover-${(ev as { slug: string }).slug}`,
    img.type,
    bytes,
  );
  if (!fileId) settings(id, "error=" + encodeURIComponent("Cover upload failed. Try again."));
  try {
    await makePublicRead(fileId as string);
  } catch {}

  const { error } = await sb.from("events").update({ cover_path: fileId }).eq("id", id);
  if (error) settings(id, "error=" + encodeURIComponent(error.message));
  revalidatePath(`/dashboard/events/${id}/settings`);
  settings(id, "saved=cover");
}

export async function removeEventCover(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const sb = await supabaseServer();
  await sb.from("events").update({ cover_path: null }).eq("id", id);
  revalidatePath(`/dashboard/events/${id}/settings`);
  settings(id, "saved=cover");
}

export async function updateEventSlug(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const slug = slugify(String(formData.get("slug") ?? ""));
  if (!slug) settings(id, "error=" + encodeURIComponent("Enter a valid URL."));

  const sb = await supabaseServer();
  const { error } = await sb.from("events").update({ slug }).eq("id", id);
  if (error) {
    const msg = /duplicate|unique/i.test(error.message)
      ? "That URL is already taken — pick another."
      : error.message;
    settings(id, "error=" + encodeURIComponent(msg));
  }
  revalidatePath(`/dashboard/events/${id}/settings`);
  settings(id, "saved=url");
}

export async function updateAccessControl(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const patch = {
    allow_uploads: formData.get("allow_uploads") === "on",
    require_approval: formData.get("require_approval") === "on",
    allow_downloads: formData.get("allow_downloads") === "on",
    guests_see_only_own: formData.get("guests_see_only_own") === "on",
  };
  const sb = await supabaseServer();
  await sb.from("events").update(patch).eq("id", id);
  revalidatePath(`/dashboard/events/${id}/access`);
  redirect(`/dashboard/events/${id}/access?saved=1`);
}

export async function setEventPassword(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "").trim();
  const sb = await supabaseServer();
  await sb
    .from("events")
    .update({ password_hash: password ? hashPassword(password) : null })
    .eq("id", id);
  revalidatePath(`/dashboard/events/${id}/access`);
  redirect(`/dashboard/events/${id}/access?saved=1`);
}

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const sb = await supabaseServer();
  const { data: ev } = await sb.from("events").select("id, slug").eq("id", id).maybeSingle();
  if (!ev) redirect("/dashboard");

  // Remove the event's Drive folder + files (DB rows cascade on the event delete).
  try {
    await deleteEventFolder(ev.slug as string);
  } catch {}

  await sb.from("events").delete().eq("id", id);
  redirect("/dashboard");
}
