import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventForOwner } from "@/lib/events/queries";
import {
  getEventUploads,
  getUploadCounts,
  type ReviewStatus,
} from "@/lib/uploads/queries";
import { createSignedDownloadUrl } from "@/lib/storage";
import { setUploadStatus } from "@/lib/uploads/actions";

export const dynamic = "force-dynamic";

const TABS: { key: ReviewStatus; label: string }[] = [
  { key: "published", label: "Published" },
  { key: "pending", label: "Approval" },
  { key: "hidden", label: "Hidden" },
];

function StatusButton({
  uploadId,
  eventId,
  status,
  label,
  primary,
}: {
  uploadId: string;
  eventId: string;
  status: ReviewStatus;
  label: string;
  primary?: boolean;
}) {
  return (
    <form action={setUploadStatus}>
      <input type="hidden" name="uploadId" value={uploadId} />
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="status" value={status} />
      <button
        className={
          primary
            ? "h-9 px-3 text-xs font-semibold text-white bg-[#1f1b16] hover:bg-[#3a3127]"
            : "h-9 px-3 text-xs font-semibold text-[#5c4a2e] border border-[#d8cdbb] hover:border-[#8d7147]"
        }
      >
        {label}
      </button>
    </form>
  );
}

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
  const items = await Promise.all(
    uploads.map(async (u) => ({
      ...u,
      url: u.storagePath ? await createSignedDownloadUrl(u.storagePath, 3600) : null,
    })),
  );
  const hasAny = counts.published + counts.pending > 0;

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-[#25211b] md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-[#ded4c4] pb-5">
          <Link href={`/dashboard/events/${id}`} className="text-sm text-[#8b6e3f]">
            ← {event.title}
          </Link>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-semibold tracking-tight">Media</h1>
            {hasAny && (
              <a
                href={`/dashboard/events/${id}/export`}
                className="inline-flex h-11 items-center justify-center bg-[#8d7147] px-5 text-sm font-semibold text-white"
              >
                Download all (ZIP)
              </a>
            )}
          </div>
          <nav className="mt-5 flex gap-1">
            {TABS.map((t) => {
              const n = counts[t.key];
              const active = t.key === tab;
              return (
                <Link
                  key={t.key}
                  href={`/dashboard/events/${id}/media?tab=${t.key}`}
                  className={`border-b-2 px-3 py-2 text-sm font-medium ${
                    active
                      ? "border-[#8d7147] text-[#25211b]"
                      : "border-transparent text-[#74664f] hover:text-[#25211b]"
                  }`}
                >
                  {t.label} ({n})
                </Link>
              );
            })}
          </nav>
        </header>

        {items.length === 0 ? (
          <div className="mt-10 border border-dashed border-[#cbbfa9] bg-white p-10 text-center text-sm text-[#74664f]">
            {tab === "pending"
              ? "Nothing waiting for approval."
              : tab === "hidden"
                ? "Nothing hidden."
                : "No photos yet — they'll appear here as guests upload."}
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((u) => (
              <li key={u.id} className="border border-[#ded4c4] bg-white">
                <a
                  href={u.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-square overflow-hidden bg-[#efe9df]"
                >
                  {u.mediaType === "photo" && u.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.url} alt={u.originalFileName ?? "photo"} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs uppercase tracking-wide text-[#a18e73]">
                      {u.mediaType === "video" ? "Video" : "File"}
                    </span>
                  )}
                </a>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold">{u.guestName}</p>
                  <p className="truncate text-xs text-[#74664f]">{u.originalFileName ?? u.mediaType}</p>
                  <div className="mt-3 flex gap-2">
                    {tab === "pending" && (
                      <StatusButton uploadId={u.id} eventId={id} status="published" label="Approve" primary />
                    )}
                    {tab === "hidden" ? (
                      <StatusButton uploadId={u.id} eventId={id} status="published" label="Restore" />
                    ) : (
                      <StatusButton uploadId={u.id} eventId={id} status="hidden" label="Hide" />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
