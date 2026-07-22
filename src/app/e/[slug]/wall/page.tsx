import { notFound } from "next/navigation";
import { getPublicEventBySlug, getPublicGallery } from "@/lib/events/public";
import { getWallSettingsPublic } from "@/lib/events/wall-settings";
import { getSiteUrl } from "@/lib/site-url";
import { qrDataUrl } from "@/lib/qr";
import PhotoWall from "./photo-wall";

export const dynamic = "force-dynamic";

export default async function WallPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) notFound();

  const [all, settings, siteUrl] = await Promise.all([
    getPublicGallery(event.id, 100),
    getWallSettingsPublic(event.id),
    getSiteUrl(),
  ]);

  const items = all
    .filter((i) => i.mediaType === "photo" && i.url)
    .map((i) => ({ id: i.id, url: i.url as string, guestName: i.guestName }));

  const joinUrl = `${siteUrl}/e/${slug}`;

  // Generated server-side and inlined as a data URL: the wall often runs on venue wifi
  // that blocks unknown hosts, so nothing on this screen should need a third-party
  // request while it's live. A QR failure must not take the wall down with it.
  let qr: string | null = null;
  if (settings.showQr) {
    try {
      qr = await qrDataUrl(joinUrl);
    } catch {
      qr = null;
    }
  }

  return (
    <PhotoWall
      slug={slug}
      title={event.title}
      initialItems={items}
      settings={settings}
      qrDataUrl={qr}
      joinUrl={joinUrl}
    />
  );
}
