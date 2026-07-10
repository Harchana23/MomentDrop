import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventForOwner } from "@/lib/events/queries";
import { getEventGuests } from "@/lib/guests";
import { EventNav } from "@/components/event-nav";

export const dynamic = "force-dynamic";

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventForOwner(id);
  if (!event) notFound();
  const guests = await getEventGuests(id);

  return (
    <main className="min-h-screen bg-[#F4ECE3] px-5 py-6 text-[#2A1B24] md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href={`/dashboard/events/${id}`} className="text-sm text-[#B5654A]">
          ← {event.title}
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">Guests</h1>
        <EventNav eventId={id} active="guests" />

        {guests.length === 0 ? (
          <div className="mt-6 border border-dashed border-[#cbbfa9] bg-white p-10 text-center text-sm text-[#7A6570]">
            No guests yet — they&apos;ll appear here as people upload to your event.
          </div>
        ) : (
          <div className="mt-6 glass">
            <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#eee6da] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#9B8676]">
              <span>Guest</span>
              <span>Uploads</span>
            </div>
            <ul className="divide-y divide-[#eee6da]">
              {guests.map((g) => (
                <li key={g.id} className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-4">
                  <div>
                    <p className="font-semibold">{g.displayName}</p>
                    {g.email && <p className="text-sm text-[#7A6570]">{g.email}</p>}
                  </div>
                  <span className="text-sm font-medium text-[#5f513d]">{g.uploadCount}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
