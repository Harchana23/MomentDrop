// Google Drive storage backend. SERVER-ONLY.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE = "https://www.googleapis.com/drive/v3";
const UPLOAD = "https://www.googleapis.com/upload/drive/v3";

const CLIENT_ID = process.env.GDRIVE_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.GDRIVE_CLIENT_SECRET ?? "";
const REFRESH_TOKEN = process.env.GDRIVE_REFRESH_TOKEN ?? "";
const ROOT_FOLDER = process.env.GDRIVE_ROOT_FOLDER_ID ?? "";

export function driveConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN && ROOT_FOLDER);
}

let cachedToken: { value: string; exp: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() + 60_000) return cachedToken.value;
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const t = await r.json();
  if (!t.access_token) throw new Error("Drive token refresh failed");
  cachedToken = { value: t.access_token, exp: Date.now() + (t.expires_in ?? 3600) * 1000 };
  return cachedToken.value;
}

async function authHeaders(): Promise<Record<string, string>> {
  return { Authorization: "Bearer " + (await getAccessToken()) };
}

const folderCache = new Map<string, string>();

/** Find (or create) the event's folder under the MomentDrop root; returns folder id. */
export async function ensureEventFolder(key: string): Promise<string> {
  const cached = folderCache.get(key);
  if (cached) return cached;
  const h = await authHeaders();
  const safe = key.replace(/'/g, "");
  const q = `name='${safe}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${ROOT_FOLDER}' in parents`;
  const r = await fetch(`${DRIVE}/files?fields=files(id)&q=` + encodeURIComponent(q), { headers: h });
  const d = await r.json();
  let id: string | undefined = d.files?.[0]?.id;
  if (!id) {
    const c = await fetch(`${DRIVE}/files?fields=id`, {
      method: "POST",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: safe,
        mimeType: "application/vnd.google-apps.folder",
        parents: [ROOT_FOLDER],
      }),
    });
    id = (await c.json()).id;
  }
  if (id) folderCache.set(key, id);
  return id ?? "";
}

/**
 * Start a resumable upload; returns the session URI the browser PUTs the file to.
 * `origin` MUST be the page's origin — Google only enables CORS on the session
 * (so the browser's cross-origin PUT is allowed) when the init request carries it.
 */
export async function initResumableUpload(
  folderId: string,
  name: string,
  mimeType: string,
  size: number,
  origin: string,
): Promise<string | null> {
  const h = await authHeaders();
  const headers: Record<string, string> = {
    ...h,
    "Content-Type": "application/json; charset=UTF-8",
    "X-Upload-Content-Type": mimeType || "application/octet-stream",
    "X-Upload-Content-Length": String(size),
  };
  if (origin) headers["Origin"] = origin;
  const r = await fetch(`${UPLOAD}/files?uploadType=resumable&fields=id`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, parents: [folderId] }),
  });
  return r.headers.get("location");
}

/**
 * Upload raw bytes to the event's folder from the server (no browser/CORS).
 * Reuses the resumable session, then PUTs the buffer. Returns the Drive file id.
 */
export async function uploadBytesToDrive(
  folderKey: string,
  name: string,
  mimeType: string,
  bytes: Buffer,
): Promise<string | null> {
  const folderId = await ensureEventFolder(folderKey);
  if (!folderId) return null;
  const sessionUri = await initResumableUpload(folderId, name, mimeType, bytes.length, "");
  if (!sessionUri) return null;
  const put = await fetch(sessionUri, {
    method: "PUT",
    headers: { "Content-Type": mimeType || "application/octet-stream" },
    body: new Uint8Array(bytes),
  });
  if (!put.ok) return null;
  const j = await put.json().catch(() => null);
  return (j?.id as string) ?? null;
}

/** Make a file readable by anyone with the link (so thumbnails render). */
export async function makePublicRead(fileId: string): Promise<void> {
  const h = await authHeaders();
  await fetch(`${DRIVE}/files/${fileId}/permissions`, {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });
}

/** Public thumbnail/preview URL (works for image and video files once shared). */
export function driveThumbUrl(fileId: string, width = 1000): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
}

/** Link to open the file in Drive's viewer. */
export function driveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/** Download a file's bytes (used to build the export ZIP). */
export async function downloadDriveFile(fileId: string): Promise<Buffer | null> {
  const h = await authHeaders();
  const r = await fetch(`${DRIVE}/files/${fileId}?alt=media`, { headers: h });
  if (!r.ok) return null;
  return Buffer.from(await r.arrayBuffer());
}

/** Trash the event's folder and everything in it (called on event delete). */
export async function deleteEventFolder(key: string): Promise<void> {
  const h = await authHeaders();
  const safe = key.replace(/'/g, "");
  const q = `name='${safe}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${ROOT_FOLDER}' in parents`;
  const r = await fetch(`${DRIVE}/files?fields=files(id)&q=` + encodeURIComponent(q), { headers: h });
  const id = (await r.json()).files?.[0]?.id;
  if (id) {
    await fetch(`${DRIVE}/files/${id}`, { method: "DELETE", headers: h });
    folderCache.delete(key);
  }
}
