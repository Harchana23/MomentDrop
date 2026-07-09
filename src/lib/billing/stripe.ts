import Stripe from "stripe";
import type { Plan } from "./plans";

const KEY = process.env.STRIPE_SECRET_KEY ?? "";

export function stripeConfigured(): boolean {
  return Boolean(KEY);
}

let cached: Stripe | null = null;
function stripe(): Stripe {
  if (!cached) cached = new Stripe(KEY);
  return cached;
}

/** Create a Checkout Session for a one-time per-event upgrade. Returns the URL. */
export async function createCheckoutSession(opts: {
  plan: Plan;
  eventId: string;
  eventTitle: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string | null> {
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    // Payment methods (card, FPX, GrabPay…) follow what's enabled in the dashboard.
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "myr",
          unit_amount: opts.plan.amountCents,
          product_data: { name: `MomentDrop ${opts.plan.label} — ${opts.eventTitle}` },
        },
      },
    ],
    metadata: { eventId: opts.eventId, plan: opts.plan.key },
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
  });
  return session.url;
}

/** Verify a webhook payload came from Stripe. Returns the event or null. */
export function constructWebhookEvent(payload: string, signature: string): Stripe.Event | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  if (!secret) return null;
  try {
    return stripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return null;
  }
}
