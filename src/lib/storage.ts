import { getSupabaseAdmin } from "./supabase";

export const MEDIA_BUCKET = "event-media";

/** Per-file ceiling. Free tier caps the project at 50MB; Pro can raise it. */
export const MAX_FILE_BYTES = 50 * 1000 * 1000;

export const ALLOWED_MIME_PREFIXES = ["image/", "video/"] as const;

export function isAllowedMime(mime: string): boolean {
  return ALLOWED_MIME_PREFIXES.some((p) => mime.startsWith(p));
}

export function mediaTypeFor(mime: string): "photo" | "video" | "file" {
  if (mime.startsWith("image/")) return "photo";
  if (mime.startsWith("video/")) return "video";
  return "file";
}

/** Strip anything risky from a guest-supplied filename, keep a readable tail. */
export function safeFileName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(-80);
  return cleaned || "file";
}

/** Build the object path: <event>/<yyyy-mm-dd>/<rand>-<safeName>. */
export function buildStoragePath(eventId: string, originalName: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${eventId}/${day}/${rand}-${safeFileName(originalName)}`;
}

export type SignedUpload = { path: string; token: string };

/**
 * Create a one-time signed upload URL for a path. The browser uploads the file
 * directly to Storage with this token — the service-role key never leaves the server.
 */
export async function createSignedUpload(path: string): Promise<SignedUpload | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb.storage
    .from(MEDIA_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) return null;
  return { path: data.path, token: data.token };
}

/** Short-lived signed download URL for viewing one object in the admin UI. */
export async function createSignedDownloadUrl(
  path: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}

/** Download one object as bytes (used to build the export ZIP). */
export async function downloadObject(path: string): Promise<Blob | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb.storage.from(MEDIA_BUCKET).download(path);
  if (error || !data) return null;
  return data;
}
