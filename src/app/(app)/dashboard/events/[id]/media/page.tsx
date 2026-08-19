import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventForOwner } from "@/lib/events/queries";
import {
  getEventUploads,
  getUploadCounts,
  type ReviewStatus,
} from "@/lib/uploads/queries";
import { driveThumbUrl, driveViewUrl } from "@/lib/gdrive";
import { EventNav } from "@/components/event-nav";
import { MediaGrid } from "./media-grid";

export const dynamic = "force-dynamic";

const TABS: { key: ReviewStatus; label: string }[] = [
  { key: "published", label: "Published" },
  { key: "pending", label: "Approval" },
  { key: "hidden", label: "Hidden" },
];

export default async function MediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const event = await getEventForOwner(id);
  if (!event) notFound();

  const tab: ReviewStatus = (["published", "pending", "hidden"].includes(sp.tab ?? "")
    ? sp.tab
    : "published") as ReviewStatus;

  const counts = await getUploadCounts(id);
  const uploads = await getEventUploads(id, tab);
  const items = uploads.map((u) => ({
    id: u.id,
    guestName: u.guestName,
    originalFileName: u.originalFileName,
    mediaType: u.mediaType,
    url: u.storagePath ? driveThumbUrl(u.storagePath, 600) : null,
    viewUrl: u.storagePath ? driveViewUrl(u.storagePath) : null,
  }));
  const total = counts.published + counts.pending + counts.hidden;
  const hasAny = counts.published + counts.pending > 0;

  return (
    <main className="min-h-screen bg-[#F4ECE3] px-5 py-6 text-[#2A1B24] md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-[#E4D9CF] pb-5">
          <Link
            href={`/dashboard/events/${id}`}
            className="text-sm font-semibold text-[#B5654A] hover:underline"
          >
            ← {event.title}
          </Link>
          <EventNav eventId={id} active="media" />
          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-serif text-4xl font-bold tracking-tight">Media</h1>
              <p className="mt-1 text-sm text-[#7A6570]">
                {total} {total === 1 ? "upload" : "uploads"}
                {counts.pending > 0 && ` · ${counts.pending} awaiting approval`}
              </p>
            </div>
            {hasAny && (
              <a
                href={`/dashboard/events/${id}/export`}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full btn-grad px-6 text-sm font-bold text-white"
              >
                ⬇ Download all (ZIP)
              </a>
            )}
          </div>
          <nav className="mt-5 flex gap-1 overflow-x-auto border-b border-[#E4D9CF]">
            {TABS.map((t) => {
              const n = counts[t.key];
              const active = t.key === tab;
              return (
                <Link
                  key={t.key}
                  href={`/dashboard/events/${id}/media?tab=${t.key}`}
                  className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "border-[#B5654A] text-[#2A1B24]"
                      : "border-transparent text-[#7A6570] hover:text-[#2A1B24]"
                  }`}
                >
                  {t.label} ({n})
                </Link>
              );
            })}
          </nav>
        </header>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[#E0B49A] bg-white p-12 text-center text-sm text-[#7A6570]">
            {tab === "pending"
              ? "Nothing waiting for approval."
              : tab === "hidden"
                ? "Nothing hidden."
                : "No photos yet — they'll appear here as guests upload."}
          </div>
        ) : (
          <MediaGrid items={items} eventId={id} tab={tab} />
        )}
      </div>
    </main>
  );
}
