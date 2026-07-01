import { NextResponse } from "next/server";
import { MAX_FILE_BYTES, isAllowedMime, safeFileName } from "@/lib/storage";
import { driveConfigured, ensureEventFolder, initResumableUpload } from "@/lib/gdrive";
import { countEventUploads, getPublicEventBySlug, uploadsOpen } from "@/lib/events/public";

export const runtime = "nodejs";

type IncomingFile = { name?: unknown; type?: unknown; size?: unknown };

const MAX_FILES_PER_REQUEST = 30;
const MAX_MB = Math.round(MAX_FILE_BYTES / 1_000_000);

/**
 * Start a Google Drive resumable upload per file and hand the browser the session
 * URIs. Guests then upload directly to Drive (no proxying through the server).
 */
export async function POST(request: Request) {
  if (!driveConfigured()) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  let body: { eventSlug?: unknown; guestName?: unknown; files?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const slug = typeof body.eventSlug === "string" ? body.eventSlug : "";
  const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "";
  if (!guestName) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }

  const event = slug ? await getPublicEventBySlug(slug) : null;
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const open = uploadsOpen(event);
  if (!open.open) return NextResponse.json({ error: open.reason }, { status: 403 });

  const files = Array.isArray(body.files) ? (body.files as IncomingFile[]) : [];
  if (files.length === 0) {
    return NextResponse.json({ error: "Pick at least one photo or video." }, { status: 400 });
  }
  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json(
      { error: `Please upload at most ${MAX_FILES_PER_REQUEST} files at a time.` },
      { status: 400 },
    );
  }

  const used = await countEventUploads(event.id);
  if (used + files.length > event.file_limit) {
    return NextResponse.json(
      { error: `This event can hold ${event.file_limit} files (${used} already used).` },
      { status: 403 },
    );
  }

  const folderId = await ensureEventFolder(event.slug);
  if (!folderId) {
    return NextResponse.json({ error: "Could not prepare storage." }, { status: 500 });
  }

  // The browser will PUT to Drive from this origin — Drive needs it to enable CORS.
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const signed = [];
  for (const f of files) {
    const name = typeof f.name === "string" && f.name ? f.name : "file";
    const type = typeof f.type === "string" ? f.type : "";
    const size = typeof f.size === "number" ? f.size : 0;

    if (!isAllowedMime(type)) {
      return NextResponse.json({ error: `"${name}" is not a photo or video.` }, { status: 400 });
    }
    if (size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: `"${name}" is larger than the ${MAX_MB}MB limit.` }, { status: 400 });
    }

    const sessionUri = await initResumableUpload(folderId, safeFileName(name), type, size, origin);
    if (!sessionUri) {
      return NextResponse.json({ error: "Could not start upload." }, { status: 500 });
    }
    signed.push({ originalFileName: name, sessionUri });
  }

  return NextResponse.json({ files: signed });
}
