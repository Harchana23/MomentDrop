"use server";

import { redirect } from "next/navigation";
import { sendContactEmail, contactEmailConfigured } from "@/lib/support";

export async function submitContact(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    redirect("/contact?error=fields");
  }
  if (!contactEmailConfigured()) {
    redirect("/contact?error=unconfigured");
  }

  const ok = await sendContactEmail({ name, email, subject, message });
  redirect(ok ? "/contact?sent=1" : "/contact?error=send");
}
