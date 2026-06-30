import { NextResponse } from "next/server";
import { EVENT_ID } from "@/lib/db";
import {
  MAX_FILE_BYTES,
  buildStoragePath,
  createSignedUpload,
  isAllowedMime,
} from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

type IncomingFile = { name?: unknown; type?: unknown; size?: unknown };

const MAX_FILES_PER_REQUEST = 30;

/**
 * Hand the browser one-time signed upload URLs so it can push files straight to
 * Storage. We validate name/mime/size here; the bucket enforces the 50MB cap too.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  let body: { guestName?: unknown; files?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "";
  if (!guestName) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }

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

  const signed = [];
  for (const f of files) {
    const name = typeof f.name === "string" && f.name ? f.name : "file";
    const type = typeof f.type === "string" ? f.type : "";
    const size = typeof f.size === "number" ? f.size : 0;

    if (!isAllowedMime(type)) {
      return NextResponse.json(
        { error: `"${name}" is not a photo or video.` },
        { status: 400 },
      );
    }
    if (size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `"${name}" is larger than the 50MB limit.` },
        { status: 400 },
      );
    }

    const path = buildStoragePath(EVENT_ID, name);
    const upload = await createSignedUpload(path);
    if (!upload) {
      return NextResponse.json({ error: "Could not start upload." }, { status: 500 });
    }
    signed.push({ originalFileName: name, path: upload.path, token: upload.token });
  }

  return NextResponse.json({ bucket: "event-media", files: signed });
}
