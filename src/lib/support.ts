/** Support contact. Submissions are forwarded to a Make.com webhook, which
 *  emails the support inbox (and can fan out to Sheets, WhatsApp, etc.). */

export const SUPPORT_EMAIL = "momentdropsharing@gmail.com";

export function contactWebhookConfigured(): boolean {
  return Boolean(process.env.MAKE_CONTACT_WEBHOOK_URL);
}

/** POST a contact-form submission to the Make.com webhook. Returns true on success. */
export async function sendContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const url = process.env.MAKE_CONTACT_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "momentdrop-contact",
        to: SUPPORT_EMAIL,
        name: input.name,
        email: input.email,
        subject: input.subject || "New contact message",
        message: input.message,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
