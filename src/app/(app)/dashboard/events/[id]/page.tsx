import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventForOwner, getEventStats } from "@/lib/events/queries";
import { getSiteUrl } from "@/lib/site-url";
import { qrDataUrl } from "@/lib/qr";
import { EventNav } from "@/components/event-nav";
import { startUpgrade } from "@/lib/billing/actions";
import {
  billingConfigured,
  ringgit,
  UPGRADE_AMOUNT_CENTS,
  UPGRADE_FILE_LIMIT,
} from "@/lib/billing/config";

export const dynamic = "force-dynamic";

export default async function EventOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ upgraded?: string; billing?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const event = await getEventForOwner(id);
  if (!event) notFound();

  const stats = await getEventStats(event.id);
  const shareUrl = `${await getSiteUrl()}/e/${event.slug}`;
  const qr = await qrDataUrl(shareUrl);
  const activeUntil = new Date(event.active_until).toLocaleDateString();

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-[#25211b] md:px-8">
      <div className="mx-auto max-w-5xl">
        <header>
          <Link href="/dashboard" className="text-sm text-[#8b6e3f]">
            ← All events
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{event.title}</h1>
          <p className="mt-1 text-sm text-[#74664f]">
            {event.event_type}
            {event.event_date ? ` · ${event.event_date}` : ""} · {event.plan} plan
          </p>
          <EventNav eventId={event.id} active="overview" />
        </header>

        {sp.upgraded && event.plan === "event" && (
          <p className="mt-5 border border-[#cfe2d0] bg-[#eef4ec] px-4 py-3 text-sm text-[#3b7a4f]">
            Payment received — your event is on the Event plan.
          </p>
        )}
        {sp.upgraded && event.plan !== "event" && (
          <p className="mt-5 border border-[#e7dcc2] bg-[#fbf6ea] px-4 py-3 text-sm text-[#7a6326]">
            Thanks! Confirming your payment — your plan updates shortly. Refresh in a moment.
          </p>
        )}
        {sp.billing === "error" && (
          <p className="mt-5 border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
            Couldn&apos;t start checkout. Please try again.
          </p>
        )}
        {sp.billing === "unconfigured" && (
          <p className="mt-5 border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
            Payments aren&apos;t set up yet.
          </p>
        )}

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

        <section className="mt-6 border border-[#ded4c4] bg-white p-6">
          {event.plan === "event" ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Event plan</h2>
                <p className="mt-1 text-sm text-[#74664f]">
                  Up to {event.file_limit} files · active until {activeUntil}.
                </p>
              </div>
              <span className="bg-[#eef4ec] px-3 py-1 text-sm font-semibold text-[#3b7a4f]">
                Upgraded
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Free trial</h2>
                <p className="mt-1 text-sm text-[#74664f]">
                  Up to {event.file_limit} files · active until {activeUntil}. Upgrade to{" "}
                  {UPGRADE_FILE_LIMIT} files and a longer window.
                </p>
                {!billingConfigured() && (
                  <p className="mt-1 text-xs text-[#a18e73]">Payments aren&apos;t configured yet.</p>
                )}
              </div>
              <form action={startUpgrade}>
                <input type="hidden" name="id" value={id} />
                <button className="inline-flex h-11 items-center justify-center bg-[#8d7147] px-5 text-sm font-semibold text-white hover:bg-[#7a6139]">
                  Upgrade — {ringgit(UPGRADE_AMOUNT_CENTS)}
                </button>
              </form>
            </div>
          )}
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
              Guests can open this link or scan the QR to upload right now.
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

        <section className="mt-6 border border-[#ded4c4] bg-white p-6">
          <h2 className="text-xl font-semibold">Photo Wall</h2>
          <p className="mt-1 text-sm text-[#74664f]">
            A live slideshow of published photos for a screen or projector at your event.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 break-all border border-[#e6ddcf] bg-[#fbf7ef] px-3 py-2 text-sm text-[#5c4a2e]">
              {shareUrl}/wall
            </code>
            <a
              href={`/e/${event.slug}/wall`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center bg-[#1f1b16] px-5 text-sm font-semibold text-white hover:bg-[#3a3127]"
            >
              Open photo wall
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
