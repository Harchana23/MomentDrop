/** Paid per-event plans. Amounts in sen (cents), currency MYR. */

export type PlanKey = "plus" | "pro";

export type Plan = {
  key: PlanKey;
  label: string;
  amountCents: number;
  fileLimit: number;
  /** How long the event stays active after upgrading, in days. */
  days: number;
  blurb: string;
};

export const PLANS: Record<PlanKey, Plan> = {
  plus: {
    key: "plus",
    label: "Plus",
    amountCents: 4900,
    fileLimit: 400,
    days: 90,
    blurb: "400 uploads · 3 months storage",
  },
  pro: {
    key: "pro",
    label: "Pro",
    amountCents: 9900,
    fileLimit: 1000,
    days: 180,
    blurb: "1,000 uploads · 6 months storage",
  },
};

export function isPlanKey(s: string): s is PlanKey {
  return s === "plus" || s === "pro";
}

/** True once the event is on any paid plan. */
export function isPaidPlan(plan: string | null | undefined): boolean {
  return plan === "plus" || plan === "pro";
}

export function ringgit(cents: number): string {
  return `RM${(cents / 100).toFixed(0)}`;
}
