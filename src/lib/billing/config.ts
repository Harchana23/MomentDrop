/** What the paid "Event" plan grants, and the ToyyibPay credentials. */

export const UPGRADE_AMOUNT_CENTS = Number(process.env.EVENT_UPGRADE_AMOUNT_CENTS ?? "10000"); // MYR 100.00
export const UPGRADE_FILE_LIMIT = Number(process.env.EVENT_UPGRADE_FILE_LIMIT ?? "1000");
export const UPGRADE_DAYS = Number(process.env.EVENT_UPGRADE_DAYS ?? "60");

/** Use https://dev.toyyibpay.com for sandbox, https://toyyibpay.com for live. */
export const TOYYIBPAY_BASE = (process.env.TOYYIBPAY_BASE_URL ?? "https://toyyibpay.com").replace(/\/$/, "");
export const TOYYIBPAY_SECRET = process.env.TOYYIBPAY_SECRET_KEY ?? "";
export const TOYYIBPAY_CATEGORY = process.env.TOYYIBPAY_CATEGORY_CODE ?? "";

export function billingConfigured(): boolean {
  return Boolean(TOYYIBPAY_SECRET && TOYYIBPAY_CATEGORY);
}

export function ringgit(cents: number): string {
  return `RM${(cents / 100).toFixed(0)}`;
}
