import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventForOwner } from "@/lib/events/queries";
import { getWallSettingsOwner } from "@/lib/events/wall-settings";
import { EventNav } from "@/components/event-nav";
import WallForm from "./wall-form";

export const dynamic = "force-dynamic";

export default async function WallSettingsPage({
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
  const { migrated, settings } = await getWallSettingsOwner(id);

  return (
    <main className="min-h-screen bg-[#F4ECE3] px-5 py-6 text-[#2A1B24] md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href={`/dashboard/events/${id}`} className="text-sm text-[#B5654A]">
          ← {event.title}
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">Photo Wall</h1>
        <EventNav eventId={id} active="wall" />

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

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#E4D9CF] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Open the wall on your screen</p>
            <p className="mt-1 text-sm text-[#7A6570]">
              Put this on a TV or projector. Move the mouse for playback controls.
            </p>
          </div>
          <a
            href={`/e/${event.slug}/wall`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full btn-grad px-5 text-sm font-bold text-white"
          >
            Open photo wall
          </a>
        </div>

        {!migrated && (
          <div className="mt-5 border border-dashed border-[#cbbfa9] bg-white p-6 text-center text-sm text-[#7A6570]">
            The wall is running with default settings. To change them, run{" "}
            <code className="text-[#4A3540]">supabase/009_wall_settings.sql</code> in your Supabase
            SQL editor, then refresh.
          </div>
        )}

        <WallForm id={id} initial={settings} />
      </div>
    </main>
  );
}
