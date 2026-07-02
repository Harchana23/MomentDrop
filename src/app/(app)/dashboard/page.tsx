import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { getDashboardData, type DashboardEvent } from "@/lib/events/queries";
import { getSiteUrl } from "@/lib/site-url";
import { driveThumbUrl } from "@/lib/gdrive";
import { CopyLinkButton } from "@/components/copy-link-button";

export const dynamic = "force-dynamic";

const TYPE_EMOJI: Record<string, string> = {
  wedding: "💍",
  birthday: "🎂",
  party: "🎉",
  corporate: "🏢",
  festival: "🪔",
  trip: "🏝️",
};

const DAY = 86_400_000;

/** Whole-day difference between a date string and today (local). */
function dayDiff(dateStr: string): number {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return NaN;
  const today = new Date();
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const b = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((a - b) / DAY);
}

function dateLabel(dateStr: string | null): { date: string; rel: string } | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const date = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  const n = dayDiff(dateStr);
  const rel =
    n === 0 ? "Today 🎉" : n === 1 ? "Tomorrow" : n > 1 ? `in ${n} days` : n === -1 ? "yesterday" : `${-n} days ago`;
  return { date, rel };
}

function EventCard({ e, base }: { e: DashboardEvent; base: string }) {
  const shareUrl = `${base}/e/${e.slug}`;
  const when = dateLabel(e.eventDate);
  const upgraded = e.plan === "event";
  const daysLeft = dayDiff(e.activeUntil);
  const expiring = !upgraded && !Number.isNaN(daysLeft) && daysLeft <= 3;
  const emoji = TYPE_EMOJI[e.eventType] ?? "📸";

  return (
    <li>
      <Link
        href={`/dashboard/events/${e.id}`}
        className="group block overflow-hidden rounded-2xl border border-[#eaddca] bg-white transition hover:-translate-y-1 hover:border-[#e0734f] hover:shadow-[0_16px_40px_rgba(80,50,20,0.12)]"
      >
        {/* Recent-photo strip */}
        <div className="flex h-24 gap-0.5 bg-[#f3ece1]">
          {e.thumbs.length > 0 ? (
            e.thumbs.map((path, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={driveThumbUrl(path, 240)}
                alt=""
                className="h-full flex-1 object-cover"
              />
            ))
          ) : (
            <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-[#ad9c82]">
              No photos yet — share the QR to start collecting
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-xl font-bold leading-tight text-[#231a12]">
              <span className="mr-1">{emoji}</span>
              {e.title}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                upgraded ? "bg-[#e6f2e8] text-[#3b7a4f]" : "bg-[#fbeadf] text-[#c85f3c]"
              }`}
            >
              {upgraded ? "Event" : "Trial"}
            </span>
          </div>

          {when && (
            <p className="mt-1 text-sm text-[#6f5c46]">
              {when.date} · <span className="font-semibold text-[#c85f3c]">{when.rel}</span>
            </p>
          )}

          <div className="mt-4 flex items-center gap-4 text-sm font-semibold text-[#3a2c1e]">
            <span>📸 {e.uploads.toLocaleString()}</span>
            <span>👥 {e.guests.toLocaleString()}</span>
            <span className="text-[#a18e73]">{e.uploads}/{e.fileLimit} files</span>
          </div>

          {expiring && (
            <p className="mt-3 rounded-lg bg-[#fdf0e9] px-3 py-1.5 text-xs font-semibold text-[#c85f3c]">
              {daysLeft < 0 ? "⚠ Trial expired" : daysLeft === 0 ? "⚠ Trial ends today" : `⚠ Trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2 border-t border-[#f0e6d8] pt-3 text-xs font-bold">
            <CopyLinkButton
              url={shareUrl}
              className="rounded-full border border-[#e6d8c4] px-3 py-1.5 text-[#5c4a2e] hover:border-[#e0734f] hover:text-[#c85f3c]"
            />
            <span className="text-[#c9b597]">·</span>
            <span className="text-[#e0734f] group-hover:underline">Open dashboard →</span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default async function DashboardPage() {
  const sb = await supabaseServer();
  const { data: claims } = await sb.auth.getClaims();
  const email = claims?.claims?.email ?? "";
  const [{ events, totals }, base] = await Promise.all([getDashboardData(), getSiteUrl()]);

  return (
    <main className="bg-[#fbf6ee] px-5 py-6 text-[#24201a] md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e6ddcf] pb-6">
          <div>
            <h1 className="font-serif text-4xl font-bold tracking-tight">Your events</h1>
            <p className="mt-1 text-sm text-[#74664f]">{email}</p>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex h-11 items-center rounded-full bg-[#e0734f] px-5 text-sm font-bold text-white hover:bg-[#cf6541]"
          >
            Create event
          </Link>
        </header>

        {events.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[#d8c6ac] bg-white p-12 text-center">
            <p className="text-4xl">🎉</p>
            <h2 className="font-serif mt-3 text-2xl font-bold">Let&apos;s collect your first moments</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[#74664f]">
              Create an event and you&apos;ll get a QR code your guests can scan to upload photos and
              videos — no app, no account.
            </p>
            <Link
              href="/onboarding"
              className="md-cta mt-6 inline-flex h-11 items-center rounded-full bg-[#e0734f] px-6 text-sm font-bold text-white hover:bg-[#cf6541]"
            >
              Create your first event →
            </Link>
          </div>
        ) : (
          <>
            {/* Summary strip */}
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl border border-[#f0d3c4] bg-[#fbeadf] px-6 py-5">
              <p className="font-serif text-lg font-bold text-[#231a12]">
                🎉 {totals.uploads.toLocaleString()} moments collected
              </p>
              <span className="text-sm font-semibold text-[#8a755c]">
                {totals.events} {totals.events === 1 ? "event" : "events"}
              </span>
              <span className="text-sm font-semibold text-[#8a755c]">
                {totals.guests.toLocaleString()} {totals.guests === 1 ? "guest" : "guests"}
              </span>
            </div>

            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {events.map((e) => (
                <EventCard key={e.id} e={e} base={base} />
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
