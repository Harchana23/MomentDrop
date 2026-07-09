import { NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/billing/stripe";
import { upgradeEvent } from "@/lib/billing/grant";
import { isPlanKey } from "@/lib/billing/plans";

export const runtime = "nodejs";

/** Stripe webhook. On a completed & paid Checkout Session, grant the event its plan. */
export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature") ?? "";
  const payload = await request.text();
  const event = constructWebhookEvent(payload, sig);
  if (!event) return NextResponse.json({ ok: false }, { status: 400 });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      payment_status?: string;
      metadata?: { eventId?: string; plan?: string };
    };
    const eventId = session.metadata?.eventId ?? "";
    const plan = session.metadata?.plan ?? "";
    if (session.payment_status === "paid" && eventId && isPlanKey(plan)) {
      await upgradeEvent(eventId, plan);
    }
  }

  return NextResponse.json({ received: true });
}
