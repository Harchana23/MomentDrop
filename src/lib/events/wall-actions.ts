"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { SLIDE_MS_MIN, SLIDE_MS_MAX, WALL_DEFAULTS } from "@/lib/events/wall-settings";

const pick = <T extends string>(value: FormDataEntryValue | null, allowed: readonly T[], fallback: T): T =>
  allowed.includes(String(value) as T) ? (String(value) as T) : fallback;

export async function saveWallSettings(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  // The form is a convenience; this action is the boundary. Every value is clamped
  // here regardless of what was posted — a hand-crafted POST must not be able to set
  // a 5ms slide and spin the wall in a loop in front of a room.
  const rawMs = Number(formData.get("slide_ms"));
  const slideMs = Number.isFinite(rawMs)
    ? Math.min(SLIDE_MS_MAX, Math.max(SLIDE_MS_MIN, Math.round(rawMs)))
    : WALL_DEFAULTS.slideMs;

  const update = {
    wall_slide_ms: slideMs,
    wall_transition: pick(formData.get("transition"), ["fade", "slide", "none"] as const, "fade"),
    wall_order: pick(formData.get("order"), ["newest", "oldest", "shuffle"] as const, "newest"),
    wall_jump_to_new: formData.get("jump_to_new") === "on",
    wall_show_name: formData.get("show_name") === "on",
    wall_show_title: formData.get("show_title") === "on",
    wall_show_qr: formData.get("show_qr") === "on",
    wall_fit: pick(formData.get("fit"), ["contain", "cover"] as const, "contain"),
    wall_blur_bg: formData.get("blur_bg") === "on",
  };

  const sb = await supabaseServer();
  const { error } = await sb.from("events").update(update).eq("id", id);

  if (error) {
    const msg = /column|wall_/i.test(error.message)
      ? "Run supabase/009_wall_settings.sql in Supabase to enable Photo Wall settings."
      : error.message;
    redirect(`/dashboard/events/${id}/wall?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath(`/dashboard/events/${id}/wall`);
  redirect(`/dashboard/events/${id}/wall?saved=1`);
}
