import { getPublicEventBySlug, getPublishedVideoDriveId } from "@/lib/events/public";
import { getAccessToken, driveConfigured } from "@/lib/gdrive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Streams a published guest video from Google Drive so the gallery's <video> tag can
 * play it inline on tap. The browser's Range header is forwarded to Drive, so the
 * player seeks and only pulls the bytes it needs rather than the whole file.
 *
 * Only a published video belonging to this event streams — the lookup enforces that,
 * so the route can't be used to pull arbitrary Drive files.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  if (!driveConfigured()) return new Response("Storage not configured", { status: 503 });

  const { slug, id } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) return new Response("Not found", { status: 404 });

  const fileId = await getPublishedVideoDriveId(event.id, id);
  if (!fileId) return new Response("Not found", { status: 404 });

  const token = await getAccessToken();
  const range = req.headers.get("range");
  const driveRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}`, ...(range ? { Range: range } : {}) } },
  );

  // 206 = partial (Range honoured), 200 = full file. Anything else is an upstream failure.
  if (driveRes.status !== 200 && driveRes.status !== 206) {
    return new Response("Upstream error", { status: 502 });
  }

  const headers = new Headers();
  for (const h of ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"]) {
    const v = driveRes.headers.get(h);
    if (v) headers.set(h, v);
  }
  if (!headers.has("content-type")) headers.set("content-type", "video/mp4");
  if (!headers.has("accept-ranges")) headers.set("accept-ranges", "bytes");
  // Private to the viewer; short cache so re-scrubbing doesn't re-fetch everything.
  headers.set("cache-control", "private, max-age=3600");

  return new Response(driveRes.body, { status: driveRes.status, headers });
}
