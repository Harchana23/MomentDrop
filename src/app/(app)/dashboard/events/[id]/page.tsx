import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventForOwner, getEventStats } from "@/lib/events/queries";
import { getSiteUrl } from "@/lib/site-url";
import { qrDataUrl } from "@/lib/qr";

export const dynamic = "force-dynamic";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventForOwner(id);
  if (!event) notFound();

  const stats = await getEventStats(event.id);
  const shareUrl = `${await getSiteUrl()}/e/${event.slug}`;
  const qr = await qrDataUrl(shareUrl);
  const activeUntil = new Date(event.active_until).toLocaleDateString();

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-[#25211b] md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-3 border-b border-[#ded4c4] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/dashboard" className="text-sm text-[#8b6e3f]">
              ← All events
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{event.title}</h1>
            <p className="mt-1 text-sm text-[#74664f]">
              {event.event_type}
              {event.event_date ? ` · ${event.event_date}` : ""} · {event.plan} plan
            </p>
          </div>
          <Link
            href={`/dashboard/events/${event.id}/media`}
            className="inline-flex h-11 w-fit items-center justify-center bg-[#1f1b16] px-5 text-sm font-semibold text-white"
          >
            View &amp; download photos
          </Link>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Uploads", value: String(stats.uploads) },
            { label: "Guests", value: String(stats.guests) },
            { label: "Plan", value: `${stats.uploads}/${event.file_limit} files` },
          ].map((s) => (
            <div key={s.label} className="border border-[#ded4c4] bg-white p-5">
              <p className="text-sm text-[#74664f]">{s.label}</p>
              <p className="mt-3 text-2xl font-semibold">{s.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="border border-[#ded4c4] bg-white p-6">
            <h2 className="text-xl font-semibold">Share your event</h2>
            <p className="mt-1 text-sm text-[#74664f]">
              Guests open this link (or scan the QR) to upload. Active until {activeUntil}.
            </p>
            <div className="mt-4 flex items-center gap-2 border border-[#e6ddcf] bg-[#fbf7ef] px-3 py-2">
              <code className="flex-1 break-all text-sm text-[#5c4a2e]">{shareUrl}</code>
            </div>
            <p className="mt-3 text-xs text-[#a18e73]">
              The guest upload page goes live in the next build step.
            </p>
          </div>
          <div className="border border-[#ded4c4] bg-white p-6 text-center">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6e3f]">
              QR code
            </h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Event QR code" className="mx-auto mt-4 h-48 w-48" />
            <a
              href={qr}
              download={`${event.slug}-qr.png`}
              className="mt-4 inline-flex h-10 items-center justify-center border border-[#d8cdbb] px-4 text-sm font-semibold text-[#5c4a2e]"
            >
              Download QR
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
