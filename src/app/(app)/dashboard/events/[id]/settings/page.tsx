import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventForOwner } from "@/lib/events/queries";
import { getSiteUrl } from "@/lib/site-url";
import { EventNav } from "@/components/event-nav";
import { updateEventDetails, updateEventSlug, deleteEvent } from "@/lib/events/actions";

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
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-[#25211b] md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href={`/dashboard/events/${id}`} className="text-sm text-[#8b6e3f]">
          ← {event.title}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Settings</h1>
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

        <section className="mt-6 border border-[#ded4c4] bg-white p-6">
          <h2 className="text-xl font-semibold">Event details</h2>
          <form action={updateEventDetails} className="mt-5 space-y-4">
            <input type="hidden" name="id" value={id} />
            <label className="block">
              <span className="text-sm font-medium text-[#4a4035]">Event name</span>
              <input
                name="title"
                defaultValue={event.title}
                required
                className="mt-2 h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#4a4035]">Tagline (optional)</span>
              <input
                name="eyebrow"
                defaultValue={event.eyebrow ?? ""}
                placeholder="A short line shown above the title"
                className="mt-2 h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#4a4035]">Welcome message (optional)</span>
              <textarea
                name="host_message"
                defaultValue={event.host_message ?? ""}
                className="mt-2 min-h-20 w-full resize-none border border-[#d8cdbb] bg-[#fffdf9] px-4 py-3 outline-none focus:border-[#8f7245]"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-[#4a4035]">Type</span>
                <select
                  name="event_type"
                  defaultValue={event.event_type}
                  className="mt-2 h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]"
                >
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday</option>
                  <option value="party">Party</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#4a4035]">Date</span>
                <input
                  name="event_date"
                  type="date"
                  defaultValue={event.event_date ?? ""}
                  className="mt-2 h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]"
                />
              </label>
            </div>
            <button className="h-11 bg-[#1f1b16] px-5 text-sm font-semibold text-white hover:bg-[#3a3127]">
              Save details
            </button>
          </form>
        </section>

        <section className="mt-6 border border-[#ded4c4] bg-white p-6">
          <h2 className="text-xl font-semibold">Custom URL</h2>
          <p className="mt-1 text-sm text-[#74664f]">Your guests&apos; upload link.</p>
          <form action={updateEventSlug} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={id} />
            <div className="flex items-center gap-1 border border-[#d8cdbb] bg-[#fffdf9] px-3">
              <span className="text-sm text-[#a18e73]">{base}/e/</span>
              <input
                name="slug"
                defaultValue={event.slug}
                className="h-12 flex-1 bg-transparent outline-none"
              />
            </div>
            <button className="h-11 bg-[#1f1b16] px-5 text-sm font-semibold text-white hover:bg-[#3a3127]">
              Save URL
            </button>
          </form>
        </section>

        <section className="mt-6 border border-[#e3c4bd] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#9a3b2b]">Danger zone</h2>
          <p className="mt-1 text-sm text-[#74664f]">
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
