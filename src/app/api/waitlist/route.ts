import { NextResponse } from "next/server";
import { sendWaitlistSignup, waitlistConfigured, looksLikeEmail } from "@/lib/waitlist";

export const runtime = "nodejs";

/** "Notify me" signup for a coming-soon feature. */
export async function POST(req: Request) {
  if (!waitlistConfigured()) {
    return NextResponse.json({ error: "Signups aren't set up yet." }, { status: 503 });
  }

  let body: { email?: unknown; feature?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const feature = typeof body.feature === "string" ? body.feature.trim().slice(0, 80) : "";

  if (!looksLikeEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const ok = await sendWaitlistSignup({ email, feature: feature || "AI Photobooth" });
  if (!ok) {
    return NextResponse.json({ error: "Couldn't save that — try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
