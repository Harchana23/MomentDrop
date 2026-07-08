/** Support contact + transactional email via Resend (https://resend.com). */

export const SUPPORT_EMAIL = "momentdropsharing@gmail.com";

export function contactEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function esc(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c,
  );
}

/** Email a contact-form submission to the support inbox. Returns true on success. */
export async function sendContactEmail(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const html = `
    <div style="font-family:system-ui,sans-serif;font-size:15px;color:#24201a">
      <h2 style="margin:0 0 12px">New MomentDrop contact message</h2>
      <p style="margin:4px 0"><b>From:</b> ${esc(input.name)} &lt;${esc(input.email)}&gt;</p>
      <p style="margin:4px 0"><b>Subject:</b> ${esc(input.subject) || "(none)"}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:12px 0" />
      <p style="white-space:pre-wrap;margin:0">${esc(input.message)}</p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "MomentDrop <onboarding@resend.dev>",
        to: [SUPPORT_EMAIL],
        reply_to: input.email,
        subject: `[MomentDrop] ${input.subject || "New contact message"}`,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
