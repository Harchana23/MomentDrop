"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { stripeConfigured, createCheckoutSession } from "./stripe";
import { PLANS, isPlanKey } from "./plans";

/** Start a per-event upgrade: create a Stripe Checkout session and send the owner to pay. */
export async function startCheckout(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const planParam = String(formData.get("plan") ?? "");
  if (!isPlanKey(planParam)) redirect(`/dashboard/events/${id}?billing=error`);
  if (!stripeConfigured()) redirect(`/dashboard/events/${id}?billing=unconfigured`);

  const sb = await supabaseServer();
  const { data: ev } = await sb.from("events").select("id, title").eq("id", id).maybeSingle();
  if (!ev) redirect("/dashboard");

  const base = await getSiteUrl();
  let url: string | null = null;
  try {
    url = await createCheckoutSession({
      plan: PLANS[planParam],
      eventId: id,
      eventTitle: String(ev.title),
      successUrl: `${base}/dashboard/events/${id}?upgraded=1`,
      cancelUrl: `${base}/dashboard/events/${id}?billing=cancelled`,
    });
  } catch {
    redirect(`/dashboard/events/${id}?billing=error`);
  }
  if (!url) redirect(`/dashboard/events/${id}?billing=error`);
  redirect(url);
}
