/**
 * The single source of truth for plan facts.
 *
 * These numbers appear on /pricing, in the JSON-LD offers, in the guides, and in
 * the chatbot's knowledge base. Anything that states a price, an upload cap, or a
 * retention window imports from here.
 *
 * Two exceptions worth knowing:
 * - `src/lib/chat/knowledge.ts` is a prose prompt, not structured data, so it stays
 *   hand-maintained. If you change a number here, change it there too.
 * - `/pricing` and the JSON-LD offers must never disagree: marking up a price the
 *   visitor cannot see on the page is a Google policy violation, not a typo.
 */
export type PlanName = "Free" | "Plus" | "Pro";

export type Plan = {
  name: PlanName;
  /** Numeric price in MYR, for schema markup. */
  price: number;
  /** Display price, e.g. "RM49". */
  priceLabel: string;
  uploads: number;
  /** Display uploads, e.g. "1,000". */
  uploadsLabel: string;
  guestsLabel: string;
  retentionLabel: string;
  blurb: string;
};

export const PLANS: Plan[] = [
  {
    name: "Free",
    price: 0,
    priceLabel: "RM0",
    uploads: 30,
    uploadsLabel: "30",
    guestsLabel: "up to 10 guests",
    retentionLabel: "7 days",
    blurb: "Try MomentDrop risk-free at your next small gathering.",
  },
  {
    name: "Plus",
    price: 49,
    priceLabel: "RM49",
    uploads: 400,
    uploadsLabel: "400",
    guestsLabel: "unlimited guests",
    retentionLabel: "3 months",
    blurb: "Perfect for birthdays, engagements and mid-size events.",
  },
  {
    name: "Pro",
    price: 99,
    priceLabel: "RM99",
    uploads: 1000,
    uploadsLabel: "1,000",
    guestsLabel: "unlimited guests",
    retentionLabel: "6 months",
    blurb: "Built for weddings and large, branded celebrations.",
  },
];

export const planBy = (name: PlanName): Plan => {
  const plan = PLANS.find((p) => p.name === name);
  if (!plan) throw new Error(`Unknown plan: ${name}`);
  return plan;
};
