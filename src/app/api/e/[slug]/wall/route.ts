import { NextResponse } from "next/server";
import { getPublicEventBySlug, getPublicGallery } from "@/lib/events/public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Live feed for the Photo Wall: published photos with fresh signed URLs. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const all = await getPublicGallery(event.id, 100);
  const items = all
    .filter((i) => i.mediaType === "photo" && i.url)
    .map((i) => ({ id: i.id, url: i.url, guestName: i.guestName }));

  return NextResponse.json({ title: event.title, items });
}
