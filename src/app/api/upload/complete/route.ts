import { NextResponse } from "next/server";
import { recordUploads, type UploadedFileInput } from "@/lib/db";
import { driveConfigured, makePublicRead } from "@/lib/gdrive";
import { getPublicEventBySlug } from "@/lib/events/public";
import { isEventAlbum } from "@/lib/albums";

export const runtime = "nodejs";

type IncomingFile = {
  driveFileId?: unknown;
  originalFileName?: unknown;
  mimeType?: unknown;
  size?: unknown;
};

/** Called after the browser uploads to Drive; makes files viewable + records them. */
export async function POST(request: Request) {
  if (!driveConfigured()) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  let body: {
    eventSlug?: unknown;
    guestName?: unknown;
    message?: unknown;
    albumId?: unknown;
    files?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const slug = typeof body.eventSlug === "string" ? body.eventSlug : "";
  const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "";
  if (!guestName) {
    return NextResponse.json({ error: "Missing guest name." }, { status: 400 });
  }

  const event = slug ? await getPublicEventBySlug(slug) : null;
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const rawAlbumId = typeof body.albumId === "string" ? body.albumId : "";
  const albumId = rawAlbumId && (await isEventAlbum(event.id, rawAlbumId)) ? rawAlbumId : null;

  const raw = Array.isArray(body.files) ? (body.files as IncomingFile[]) : [];
  const files: UploadedFileInput[] = raw
    .filter((f) => typeof f.driveFileId === "string" && (f.driveFileId as string).length > 0)
    .map((f) => ({
      storagePath: f.driveFileId as string, // Drive file id
      originalFileName: typeof f.originalFileName === "string" ? f.originalFileName : "file",
      mimeType: typeof f.mimeType === "string" ? f.mimeType : "",
      size: typeof f.size === "number" ? f.size : 0,
    }));

  if (files.length === 0) {
    return NextResponse.json({ error: "No uploaded files to record." }, { status: 400 });
  }

  // Make each uploaded file readable-by-link so thumbnails render.
  await Promise.all(files.map((f) => makePublicRead(f.storagePath)));

  const reviewStatus = event.require_approval ? "pending" : "published";
  try {
    const count = await recordUploads(event.id, guestName, files, reviewStatus, albumId);
    return NextResponse.json({ recorded: count, pending: event.require_approval });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
