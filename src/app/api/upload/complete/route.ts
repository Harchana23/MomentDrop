import { NextResponse } from "next/server";
import { EVENT_ID, recordUploads, type UploadedFileInput } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

type IncomingFile = {
  storagePath?: unknown;
  originalFileName?: unknown;
  mimeType?: unknown;
  size?: unknown;
};

/** Called after the browser finishes uploading; writes metadata rows to Postgres. */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  let body: { guestName?: unknown; message?: unknown; files?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "";
  if (!guestName) {
    return NextResponse.json({ error: "Missing guest name." }, { status: 400 });
  }

  const raw = Array.isArray(body.files) ? (body.files as IncomingFile[]) : [];
  const files: UploadedFileInput[] = raw
    .filter((f) => typeof f.storagePath === "string" && (f.storagePath as string).length > 0)
    .map((f) => ({
      storagePath: f.storagePath as string,
      originalFileName: typeof f.originalFileName === "string" ? f.originalFileName : "file",
      mimeType: typeof f.mimeType === "string" ? f.mimeType : "",
      size: typeof f.size === "number" ? f.size : 0,
    }));

  if (files.length === 0) {
    return NextResponse.json({ error: "No uploaded files to record." }, { status: 400 });
  }

  try {
    const count = await recordUploads(EVENT_ID, guestName, files);
    return NextResponse.json({ recorded: count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
