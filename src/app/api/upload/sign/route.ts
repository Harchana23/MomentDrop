import { NextResponse } from "next/server";
import {
  MAX_FILE_BYTES,
  buildStoragePath,
  createSignedUpload,
  isAllowedMime,
} from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { countEventUploads, getPublicEventBySlug, uploadsOpen } from "@/lib/events/public";

export const runtime = "nodejs";

type IncomingFile = { name?: unknown; type?: unknown; size?: unknown };

const MAX_FILES_PER_REQUEST = 30;

/**
 * Give the browser one-time signed upload URLs for a specific event's guests.
 * Validates the event is open + within its file limit, and each file's mime/size.
 * The service-role key never leaves the server.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
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

  const signed = [];
  for (const f of files) {
    const name = typeof f.name === "string" && f.name ? f.name : "file";
    const type = typeof f.type === "string" ? f.type : "";
    const size = typeof f.size === "number" ? f.size : 0;

    if (!isAllowedMime(type)) {
      return NextResponse.json({ error: `"${name}" is not a photo or video.` }, { status: 400 });
    }
    if (size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: `"${name}" is larger than the 50MB limit.` }, { status: 400 });
    }

    const path = buildStoragePath(event.id, name);
    const upload = await createSignedUpload(path);
    if (!upload) {
      return NextResponse.json({ error: "Could not start upload." }, { status: 500 });
    }
    signed.push({ originalFileName: name, path: upload.path, token: upload.token });
  }

  return NextResponse.json({ bucket: "event-media", files: signed });
}
