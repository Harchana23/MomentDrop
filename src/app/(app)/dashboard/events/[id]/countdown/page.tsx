import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventForOwner } from "@/lib/events/queries";
import { getCountdownOwner } from "@/lib/events/countdown";
import { EventNav } from "@/components/event-nav";
import CountdownForm from "./countdown-form";

export const dynamic = "force-dynamic";

export default async function CountdownPage({
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
  const cd = await getCountdownOwner(id);

  return (
    <main className="min-h-screen bg-[#F4ECE3] px-5 py-6 text-[#2A1B24] md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href={`/dashboard/events/${id}`} className="text-sm text-[#B5654A]">
          ← {event.title}
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">Countdown</h1>
        <EventNav eventId={id} active="countdown" />

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

        {cd.available ? (
          <CountdownForm
            id={id}
            initial={{ enabled: cd.enabled, title: cd.title, until: cd.until }}
          />
        ) : (
          <div className="mt-6 border border-dashed border-[#cbbfa9] bg-white p-8 text-center text-sm text-[#7A6570]">
            Countdown needs a quick database update. Run{" "}
            <code className="text-[#4A3540]">supabase/004_countdown.sql</code> in your Supabase
            SQL editor, then refresh.
          </div>
        )}
      </div>
    </main>
  );
}
