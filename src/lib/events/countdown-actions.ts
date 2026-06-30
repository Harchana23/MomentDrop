"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export async function saveCountdown(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const enabled = formData.get("enabled") === "on";
  const title = String(formData.get("title") ?? "").trim() || null;
  const until = String(formData.get("until") ?? "") || null;

  const sb = await supabaseServer();
  const { error } = await sb
    .from("events")
    .update({ countdown_enabled: enabled, countdown_title: title, countdown_until: until })
    .eq("id", id);

  if (error) {
    const msg = /column|countdown/i.test(error.message)
      ? "Run supabase/004_countdown.sql in Supabase to enable Countdown."
      : error.message;
    redirect(`/dashboard/events/${id}/countdown?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath(`/dashboard/events/${id}/countdown`);
  redirect(`/dashboard/events/${id}/countdown?saved=1`);
}
