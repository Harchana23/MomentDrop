/** Waitlist / "notify me" signups. Reuses the same Make.com webhook as the contact
 *  form, tagged with a distinct source so they're easy to filter from support mail. */

import { SUPPORT_EMAIL } from "@/lib/support";

export function waitlistConfigured(): boolean {
  return Boolean(process.env.MAKE_CONTACT_WEBHOOK_URL);
}

/** Basic shape check — the webhook does the real work, this just avoids obvious junk. */
export function looksLikeEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/** POST a waitlist signup to the Make.com webhook. Returns true on success. */
export async function sendWaitlistSignup(input: {
  email: string;
  feature: string;
}): Promise<boolean> {
  const url = process.env.MAKE_CONTACT_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "momentdrop-waitlist",
        to: SUPPORT_EMAIL,
        email: input.email,
        feature: input.feature,
        subject: `Waitlist signup — ${input.feature}`,
        message: `${input.email} wants to be notified when ${input.feature} launches.`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
