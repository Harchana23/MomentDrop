import { NextResponse } from "next/server";
import { EVENT_ID } from "@/lib/db";
import { createSignedDownloadUrl } from "@/lib/storage";

export const runtime = "nodejs";

/** Redirect to a short-lived signed URL for one object (admin "View" links). */
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path") ?? "";

  // Only allow paths within this event's namespace — no traversal.
  if (!path.startsWith(`${EVENT_ID}/`) || path.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const url = await createSignedDownloadUrl(path, 3600);
  if (!url) return new NextResponse("Not found", { status: 404 });

  return NextResponse.redirect(url);
}
