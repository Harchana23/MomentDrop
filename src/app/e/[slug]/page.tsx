import { notFound } from "next/navigation";
import { getPublicEventBySlug, getPublicGallery, uploadsOpen } from "@/lib/events/public";
import GuestUploader from "./guest-uploader";

export const dynamic = "force-dynamic";

export default async function GuestEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) notFound();

  const open = uploadsOpen(event);
  const gallery = event.allow_downloads ? await getPublicGallery(event.id) : [];

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#22211f]">
      <div className="mx-auto w-full max-w-5xl px-5 py-10">
        <header className="mx-auto max-w-md text-center">
          {event.eyebrow && (
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7f6a46]">
              {event.eyebrow}
            </p>
          )}
          <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight text-[#26211b]">
            {event.title}
          </h1>
          {event.host_message ? (
            <p className="mt-4 text-base leading-7 text-[#695b49]">{event.host_message}</p>
          ) : (
            <p className="mt-4 text-base leading-7 text-[#695b49]">
              Share your photos and videos — no app, no account.
            </p>
          )}
        </header>

        <div className="mx-auto mt-8 max-w-md border border-[#e1d8ca] bg-white p-5 shadow-[0_24px_80px_rgba(70,55,35,0.12)] md:p-7">
          {open.open ? (
            <GuestUploader eventSlug={event.slug} />
          ) : (
            <div className="py-8 text-center">
              <h2 className="text-xl font-semibold tracking-tight">Uploads closed</h2>
              <p className="mt-2 text-sm text-[#695b49]">{open.reason}</p>
            </div>
          )}
        </div>

        {gallery.length > 0 && (
          <section className="mt-14">
            <h2 className="text-center text-2xl font-semibold tracking-tight">Shared album</h2>
            <p className="mt-1 text-center text-sm text-[#74664f]">
              {gallery.length} {gallery.length === 1 ? "memory" : "memories"} from guests
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {gallery.map((g) => (
                <li key={g.id} className="border border-[#e6ddcf] bg-white">
                  <a
                    href={g.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="block aspect-square overflow-hidden bg-[#efe9df]"
                  >
                    {g.mediaType === "photo" && g.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={g.url}
                        alt={g.originalFileName ?? "photo"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs uppercase tracking-wide text-[#a18e73]">
                        {g.mediaType === "video" ? "Video" : "File"}
                      </span>
                    )}
                  </a>
                  <p className="truncate px-2 py-1 text-xs text-[#74664f]">{g.guestName}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 text-center text-xs uppercase tracking-[0.18em] text-[#a18e73]">
          Powered by MomentDrop
        </p>
      </div>
    </main>
  );
}
