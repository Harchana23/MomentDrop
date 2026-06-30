import { notFound } from "next/navigation";
import { getPublicEventBySlug, getPublicGallery } from "@/lib/events/public";
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

  const all = await getPublicGallery(event.id, 100);
  const items = all
    .filter((i) => i.mediaType === "photo" && i.url)
    .map((i) => ({ id: i.id, url: i.url as string, guestName: i.guestName }));

  return <PhotoWall slug={slug} title={event.title} initialItems={items} />;
}
