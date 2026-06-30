"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { billingConfigured, TOYYIBPAY_BASE, UPGRADE_AMOUNT_CENTS } from "./config";
import { createBill } from "./toyyibpay";

/** Start a per-event upgrade: create a ToyyibPay bill and send the owner to pay. */
export async function startUpgrade(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!billingConfigured()) redirect(`/dashboard/events/${id}?billing=unconfigured`);

  const sb = await supabaseServer();
  const { data: ev } = await sb.from("events").select("id, title").eq("id", id).maybeSingle();
  if (!ev) redirect("/dashboard");

  const base = await getSiteUrl();
  const billCode = await createBill({
    name: "MomentDrop Event",
    description: `Upgrade ${String(ev.title)}`,
    amountCents: UPGRADE_AMOUNT_CENTS,
    externalRef: id,
    returnUrl: `${base}/dashboard/events/${id}?upgraded=1`,
    callbackUrl: `${base}/api/billing/toyyibpay/callback`,
  });
  if (!billCode) redirect(`/dashboard/events/${id}?billing=error`);

  redirect(`${TOYYIBPAY_BASE}/${billCode}`);
}
