import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventForOwner } from "@/lib/events/queries";
import { getAlbumsOwner } from "@/lib/albums";
import { createAlbum, deleteAlbum } from "@/lib/albums-actions";
import { EventNav } from "@/components/event-nav";

export const dynamic = "force-dynamic";

export default async function AlbumsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const event = await getEventForOwner(id);
  if (!event) notFound();
  const { available, albums } = await getAlbumsOwner(id);

  return (
    <main className="min-h-screen bg-[#F4ECE3] px-5 py-6 text-[#2A1B24] md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href={`/dashboard/events/${id}`} className="text-sm text-[#B5654A]">
          ← {event.title}
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">Albums</h1>
        <EventNav eventId={id} active="albums" />

        {sp.error && (
          <p className="mt-5 border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
            {sp.error}
          </p>
        )}
        {sp.saved && (
          <p className="mt-5 border border-[#cfe2d0] bg-[#eef4ec] px-4 py-3 text-sm text-[#3b7a4f]">
            Saved.
          </p>
        )}

        {!available ? (
          <div className="mt-6 border border-dashed border-[#cbbfa9] bg-white p-8 text-center text-sm text-[#7A6570]">
            Albums needs a quick database update. Run{" "}
            <code className="text-[#4A3540]">supabase/005_albums.sql</code> in your Supabase SQL
            editor, then refresh.
          </div>
        ) : (
          <>
            <section className="mt-6 border border-[#E4D9CF] bg-white p-6">
              <h2 className="text-lg font-semibold">New album</h2>
              <form action={createAlbum} className="mt-4 space-y-4">
                <input type="hidden" name="eventId" value={id} />
                <input
                  name="title"
                  required
                  placeholder="e.g. Ceremony, Reception, Photobooth"
                  className="h-12 w-full border border-[#E4D9CF] bg-[#FFFBF6] px-4 outline-none focus:border-[#B5654A]"
                />
                <label className="flex items-center gap-3 text-sm text-[#4A3540]">
                  <input type="checkbox" name="allow_uploads" defaultChecked className="h-4 w-4" />
                  Let guests upload to this album
                </label>
                <button className="h-11 rounded-full bg-[#B5654A] px-5 text-sm font-semibold text-white hover:bg-[#8F4A34]">
                  Create album
                </button>
              </form>
            </section>

            <section className="mt-6 border border-[#E4D9CF] bg-white">
              {albums.length === 0 ? (
                <p className="p-6 text-sm text-[#7A6570]">
                  No albums yet. Create one above — guests can then pick it when uploading.
                </p>
              ) : (
                <ul className="divide-y divide-[#eee6da]">
                  {albums.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 p-5">
                      <div>
                        <p className="font-semibold">{a.title}</p>
                        <p className="mt-1 text-sm text-[#7A6570]">
                          {a.count} {a.count === 1 ? "photo" : "photos"}
                          {a.allowUploads ? " · open for guest uploads" : " · uploads off"}
                        </p>
                      </div>
                      <form action={deleteAlbum}>
                        <input type="hidden" name="eventId" value={id} />
                        <input type="hidden" name="albumId" value={a.id} />
                        <button className="h-9 border border-[#E4D9CF] px-3 text-xs font-semibold text-[#9a3b2b] hover:border-[#cf6b58]">
                          Delete
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
