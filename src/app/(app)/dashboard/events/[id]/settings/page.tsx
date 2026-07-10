import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventForOwner } from "@/lib/events/queries";
import { getSiteUrl } from "@/lib/site-url";
import { driveThumbUrl } from "@/lib/gdrive";
import { EventNav } from "@/components/event-nav";
import {
  updateEventDetails,
  updateEventSlug,
  updateEventCover,
  removeEventCover,
  deleteEvent,
} from "@/lib/events/actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
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
  const base = await getSiteUrl();

  return (
    <main className="min-h-screen bg-[#F4ECE3] px-5 py-6 text-[#2A1B24] md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href={`/dashboard/events/${id}`} className="text-sm text-[#B5654A]">
          ← {event.title}
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">Settings</h1>
        <EventNav eventId={id} active="settings" />

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

        <section className="mt-6 border border-[#E4D9CF] bg-white p-6">
          <h2 className="font-serif text-xl font-bold">Event details</h2>
          <form action={updateEventDetails} className="mt-5 space-y-4">
            <input type="hidden" name="id" value={id} />
            <label className="block">
              <span className="text-sm font-medium text-[#4A3540]">Event name</span>
              <input
                name="title"
                defaultValue={event.title}
                required
                className="mt-2 h-12 w-full rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 outline-none focus:border-[#B5654A]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#4A3540]">Tagline (optional)</span>
              <input
                name="eyebrow"
                defaultValue={event.eyebrow ?? ""}
                placeholder="A short line shown above the title"
                className="mt-2 h-12 w-full rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 outline-none focus:border-[#B5654A]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#4A3540]">Welcome message (optional)</span>
              <textarea
                name="host_message"
                defaultValue={event.host_message ?? ""}
                className="mt-2 min-h-20 w-full resize-none border border-[#E4D9CF] bg-[#FFFBF6] px-4 py-3 outline-none focus:border-[#B5654A]"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-[#4A3540]">Type</span>
                <select
                  name="event_type"
                  defaultValue={event.event_type}
                  className="mt-2 h-12 w-full rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 outline-none focus:border-[#B5654A]"
                >
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday</option>
                  <option value="party">Party</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#4A3540]">Date</span>
                <input
                  name="event_date"
                  type="date"
                  defaultValue={event.event_date ?? ""}
                  className="mt-2 h-12 w-full rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 outline-none focus:border-[#B5654A]"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-[#4A3540]">Photos &amp; videos per guest</span>
              <input
                name="per_guest_limit"
                type="number"
                min={1}
                defaultValue={event.per_guest_limit ?? ""}
                placeholder="Unlimited"
                className="mt-2 h-12 w-full rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 outline-none focus:border-[#B5654A]"
              />
              <span className="mt-1 block text-xs text-[#9B8676]">
                Leave blank for unlimited. Caps how many each guest can upload, so no single phone
                floods the album.
              </span>
            </label>
            <button className="h-11 rounded-full bg-[#B5654A] px-5 text-sm font-semibold text-white hover:bg-[#8F4A34]">
              Save details
            </button>
          </form>
        </section>

        <section className="mt-6 border border-[#E4D9CF] bg-white p-6">
          <h2 className="font-serif text-xl font-bold">Cover photo</h2>
          <p className="mt-1 text-sm text-[#7A6570]">
            Shown behind your event name on the guest page. A wide landscape photo works best.
            Leave blank to use a themed default.
          </p>
          {event.cover_path && (
            <div className="mt-4 overflow-hidden rounded-lg border border-[#E4D9CF]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={driveThumbUrl(event.cover_path, 900)}
                alt="Current cover"
                className="h-40 w-full object-cover"
              />
            </div>
          )}
          <form action={updateEventCover} className="mt-4 flex flex-wrap items-center gap-3">
            <input type="hidden" name="id" value={id} />
            <input
              name="cover"
              type="file"
              accept="image/*"
              required
              className="text-sm text-[#4A3540] file:mr-3 file:border file:border-[#E4D9CF] file:bg-[#FBF3EC] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#4A3540]"
            />
            <button className="h-11 rounded-full bg-[#B5654A] px-5 text-sm font-semibold text-white hover:bg-[#8F4A34]">
              {event.cover_path ? "Replace cover" : "Upload cover"}
            </button>
          </form>
          {event.cover_path && (
            <form action={removeEventCover} className="mt-3">
              <input type="hidden" name="id" value={id} />
              <button className="text-sm font-semibold text-[#9a3b2b] hover:underline">
                Remove cover
              </button>
            </form>
          )}
        </section>

        <section className="mt-6 border border-[#E4D9CF] bg-white p-6">
          <h2 className="font-serif text-xl font-bold">Custom URL</h2>
          <p className="mt-1 text-sm text-[#7A6570]">Your guests&apos; upload link.</p>
          <form action={updateEventSlug} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={id} />
            <div className="flex items-center gap-1 border border-[#E4D9CF] bg-[#FFFBF6] px-3">
              <span className="text-sm text-[#9B8676]">{base}/e/</span>
              <input
                name="slug"
                defaultValue={event.slug}
                className="h-12 flex-1 bg-transparent outline-none"
              />
            </div>
            <button className="h-11 rounded-full bg-[#B5654A] px-5 text-sm font-semibold text-white hover:bg-[#8F4A34]">
              Save URL
            </button>
          </form>
        </section>

        <section className="mt-6 border border-[#e3c4bd] bg-white p-6">
          <h2 className="font-serif text-xl font-bold text-[#9a3b2b]">Danger zone</h2>
          <p className="mt-1 text-sm text-[#7A6570]">
            Deleting an event permanently removes its photos, guests, and link. This can&apos;t be
            undone.
          </p>
          <form action={deleteEvent} className="mt-4">
            <input type="hidden" name="id" value={id} />
            <button className="h-11 border border-[#cf6b58] px-5 text-sm font-semibold text-[#9a3b2b] hover:bg-[#fbf1ef]">
              Delete this event
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
