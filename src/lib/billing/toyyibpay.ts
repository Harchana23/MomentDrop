import { TOYYIBPAY_BASE, TOYYIBPAY_CATEGORY, TOYYIBPAY_SECRET } from "./config";

export function paymentUrl(billCode: string): string {
  return `${TOYYIBPAY_BASE}/${billCode}`;
}

type CreateBillOpts = {
  name: string;
  description: string;
  amountCents: number;
  externalRef: string;
  returnUrl: string;
  callbackUrl: string;
};

/** Create a ToyyibPay bill; returns its BillCode (or null on failure). */
export async function createBill(opts: CreateBillOpts): Promise<string | null> {
  const form = new URLSearchParams({
    userSecretKey: TOYYIBPAY_SECRET,
    categoryCode: TOYYIBPAY_CATEGORY,
    billName: opts.name.slice(0, 30),
    billDescription: opts.description.slice(0, 100),
    billPriceSetting: "1",
    billPayorInfo: "1",
    billAmount: String(opts.amountCents),
    billReturnUrl: opts.returnUrl,
    billCallbackUrl: opts.callbackUrl,
    billExternalReferenceNo: opts.externalRef,
    billPaymentChannel: "2", // FPX + card
  });
  try {
    const res = await fetch(`${TOYYIBPAY_BASE}/index.php/api/createBill`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    const code = Array.isArray(data) ? data[0]?.BillCode : data?.BillCode;
    return typeof code === "string" ? code : null;
  } catch {
    return null;
  }
}

/** Re-verify a bill server-side (never trust the callback alone). */
export async function getBillPaid(
  billCode: string,
): Promise<{ paid: boolean; amountCents: number } | null> {
  const form = new URLSearchParams({ userSecretKey: TOYYIBPAY_SECRET, billCode });
  try {
    const res = await fetch(`${TOYYIBPAY_BASE}/index.php/api/getBillTransactions`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (!Array.isArray(data)) return null;
    const paid = data.find((t) => String(t.billpaymentStatus) === "1");
    if (!paid) return { paid: false, amountCents: 0 };
    return { paid: true, amountCents: Math.round(Number(paid.billpaymentAmount) * 100) };
  } catch {
    return null;
  }
}
