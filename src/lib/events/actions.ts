"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { makeEventSlug } from "@/lib/slug";

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
