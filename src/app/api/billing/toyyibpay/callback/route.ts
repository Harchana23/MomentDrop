import { NextResponse } from "next/server";
import { getBillPaid } from "@/lib/billing/toyyibpay";
import { upgradeEvent } from "@/lib/billing/grant";
import { UPGRADE_AMOUNT_CENTS } from "@/lib/billing/config";

export const runtime = "nodejs";

/**
 * ToyyibPay server-to-server callback. Fields: status (1=success), billcode,
 * order_id (= our event id). We re-verify with ToyyibPay before granting.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false }, { status: 400 });

  const status = String(form.get("status") ?? "");
  const billcode = String(form.get("billcode") ?? "");
  const eventId = String(form.get("order_id") ?? "");
  if (status !== "1" || !billcode || !eventId) {
    return NextResponse.json({ ok: true }); // ignore pending/failed
  }

  const verified = await getBillPaid(billcode);
  if (verified?.paid && verified.amountCents >= UPGRADE_AMOUNT_CENTS) {
    await upgradeEvent(eventId);
  }
  return NextResponse.json({ ok: true });
}
