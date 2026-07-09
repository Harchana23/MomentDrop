import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventForOwner, getEventStats } from "@/lib/events/queries";
import { getSiteUrl } from "@/lib/site-url";
import { qrDataUrl } from "@/lib/qr";
import { EventNav } from "@/components/event-nav";
import { CopyLinkButton } from "@/components/copy-link-button";
import { startCheckout } from "@/lib/billing/actions";
import { stripeConfigured } from "@/lib/billing/stripe";
import { PLANS, isPaidPlan, ringgit } from "@/lib/billing/plans";

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

  const isPaid = isPaidPlan(event.plan);
  const planLabel = event.plan === "pro" ? "Pro" : event.plan === "plus" ? "Plus" : "Trial";
  const paymentsReady = stripeConfigured();

  return (
    <main className="min-h-screen bg-[#fbf6ee] px-5 py-6 text-[#24201a] md:px-8">
      <div className="mx-auto max-w-5xl">
        <header>
          <Link href="/dashboard" className="text-sm font-semibold text-[#c85f3c] hover:underline">
            ← All events
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-4xl font-bold tracking-tight">{event.title}</h1>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                isPaid ? "bg-[#e6f2e8] text-[#3b7a4f]" : "bg-[#fbeadf] text-[#c85f3c]"
              }`}
            >
              {planLabel}
            </span>
          </div>
          <p className="mt-1 text-sm capitalize text-[#74664f]">
            {event.event_type}
            {event.event_date ? ` · ${event.event_date}` : ""}
          </p>
          <EventNav eventId={event.id} active="overview" />
        </header>

        {sp.upgraded && isPaid && (
          <p className="mt-5 rounded-xl border border-[#cfe2d0] bg-[#eef4ec] px-4 py-3 text-sm text-[#3b7a4f]">
            Payment received — your event is on the {planLabel} plan.
          </p>
        )}
        {sp.upgraded && !isPaid && (
          <p className="mt-5 rounded-xl border border-[#e7dcc2] bg-[#fbf6ea] px-4 py-3 text-sm text-[#7a6326]">
            Thanks! Confirming your payment — your plan updates within a few seconds. Refresh shortly.
          </p>
        )}
        {sp.billing === "cancelled" && (
          <p className="mt-5 rounded-xl border border-[#e7dcc2] bg-[#fbf6ea] px-4 py-3 text-sm text-[#7a6326]">
            Checkout cancelled — no charge was made.
          </p>
        )}
        {sp.billing === "error" && (
          <p className="mt-5 rounded-xl border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
            Couldn&apos;t start checkout. Please try again.
          </p>
        )}
        {sp.billing === "unconfigured" && (
          <p className="mt-5 rounded-xl border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
            Payments aren&apos;t set up yet.
          </p>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Uploads", value: String(stats.uploads) },
            { label: "Guests", value: String(stats.guests) },
            { label: "Files used", value: `${stats.uploads} / ${event.file_limit}` },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-[#eaddca] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a18e73]">
                {s.label}
              </p>
              <p className="font-serif mt-2 text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </section>

        {isPaid ? (
          <section className="mt-6 rounded-2xl border border-[#eaddca] bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold">{planLabel} plan</h2>
                <p className="mt-1 text-sm text-[#6f5c46]">
                  Up to {event.file_limit} files · active until {activeUntil}.
                </p>
              </div>
              <span className="rounded-full bg-[#e6f2e8] px-3 py-1 text-sm font-bold text-[#3b7a4f]">
                Upgraded
              </span>
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-[#eaddca] bg-white p-6">
            <h2 className="font-serif text-xl font-bold">Free trial</h2>
            <p className="mt-1 text-sm text-[#6f5c46]">
              Up to {event.file_limit} files · active until {activeUntil}. Upgrade this event for more
              uploads and a longer window.
            </p>
            {!paymentsReady && (
              <p className="mt-1 text-xs text-[#a18e73]">Payments aren&apos;t configured yet.</p>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["plus", "pro"] as const).map((key) => {
                const plan = PLANS[key];
                const popular = key === "pro";
                return (
                  <div
                    key={key}
                    className={`rounded-2xl border p-5 ${
                      popular ? "border-[#e0734f] bg-[#fdf6f1]" : "border-[#eaddca] bg-[#fbf7ef]"
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-serif text-lg font-bold text-[#231a12]">{plan.label}</h3>
                      <span className="font-serif text-2xl font-bold text-[#231a12]">
                        {ringgit(plan.amountCents)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#6f5c46]">{plan.blurb}</p>
                    <form action={startCheckout} className="mt-4">
                      <input type="hidden" name="id" value={id} />
                      <input type="hidden" name="plan" value={key} />
                      <button
                        disabled={!paymentsReady}
                        className={`inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-bold transition disabled:opacity-50 ${
                          popular
                            ? "bg-[#e0734f] text-white hover:bg-[#cf6541]"
                            : "border-2 border-[#e0734f] text-[#c85f3c] hover:bg-[#fbeadf]"
                        }`}
                      >
                        Upgrade to {plan.label}
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs text-[#a18e73]">
              Secure checkout by Stripe · FPX, cards &amp; e-wallets · one-time, per event
            </p>
          </section>
        )}

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-[#eaddca] bg-white p-6">
            <h2 className="font-serif text-xl font-bold">Share your event</h2>
            <p className="mt-1 text-sm text-[#6f5c46]">
              Guests open this link (or scan the QR) to upload. Active until {activeUntil}.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#e6ddcf] bg-[#fbf7ef] px-3 py-2">
              <code className="flex-1 break-all text-sm text-[#5c4a2e]">{shareUrl}</code>
              <CopyLinkButton
                url={shareUrl}
                className="shrink-0 rounded-full border border-[#e6d8c4] px-3 py-1.5 text-xs font-bold text-[#5c4a2e] hover:border-[#e0734f] hover:text-[#c85f3c]"
              />
            </div>
            <a
              href={`/e/${event.slug}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs font-bold text-[#c85f3c] hover:underline"
            >
              Preview guest page →
            </a>
          </div>
          <div className="rounded-2xl border border-[#eaddca] bg-white p-6 text-center">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#a97e46]">QR code</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Event QR code" className="mx-auto mt-4 h-44 w-44 rounded-xl" />
            <a
              href={qr}
              download={`${event.slug}-qr.png`}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-[#d8cdbb] px-4 text-sm font-bold text-[#5c4a2e] hover:border-[#e0734f]"
            >
              Download QR
            </a>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#eaddca] bg-white p-6">
          <h2 className="font-serif text-xl font-bold">Photo Wall</h2>
          <p className="mt-1 text-sm text-[#6f5c46]">
            A live slideshow of published photos for a screen or projector at your event.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#e6ddcf] bg-[#fbf7ef] px-3 py-2">
              <code className="flex-1 break-all text-sm text-[#5c4a2e]">{shareUrl}/wall</code>
              <CopyLinkButton
                url={`${shareUrl}/wall`}
                className="shrink-0 rounded-full border border-[#e6d8c4] px-3 py-1.5 text-xs font-bold text-[#5c4a2e] hover:border-[#e0734f] hover:text-[#c85f3c]"
              />
            </div>
            <a
              href={`/e/${event.slug}/wall`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#e0734f] px-5 text-sm font-bold text-white hover:bg-[#cf6541]"
            >
              Open photo wall
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
