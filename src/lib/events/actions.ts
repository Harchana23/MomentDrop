"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { makeEventSlug, slugify } from "@/lib/slug";

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

  const patch = {
    title,
    eyebrow: String(formData.get("eyebrow") ?? "").trim() || null,
    host_message: String(formData.get("host_message") ?? "").trim() || null,
    event_date: String(formData.get("event_date") ?? "") || null,
    event_type: String(formData.get("event_type") ?? "wedding"),
  };
  const sb = await supabaseServer();
  const { error } = await sb.from("events").update(patch).eq("id", id);
  if (error) settings(id, "error=" + encodeURIComponent(error.message));
  revalidatePath(`/dashboard/events/${id}/settings`);
  settings(id, "saved=details");
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

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const sb = await supabaseServer();
  const { data: ev } = await sb.from("events").select("id").eq("id", id).maybeSingle();
  if (!ev) redirect("/dashboard");

  // Remove the event's stored media (DB rows cascade on the event delete).
  const admin = getSupabaseAdmin();
  if (admin) {
    try {
      const { data: dateFolders } = await admin.storage.from("event-media").list(id, { limit: 1000 });
      const paths: string[] = [];
      for (const entry of dateFolders ?? []) {
        if (entry.id === null) {
          const { data: inner } = await admin.storage
            .from("event-media")
            .list(`${id}/${entry.name}`, { limit: 1000 });
          for (const f of inner ?? []) paths.push(`${id}/${entry.name}/${f.name}`);
        } else {
          paths.push(`${id}/${entry.name}`);
        }
      }
      if (paths.length) await admin.storage.from("event-media").remove(paths);
    } catch {}
  }

  await sb.from("events").delete().eq("id", id);
  redirect("/dashboard");
}
