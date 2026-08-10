import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  getPublicEventBySlug,
  getPublicGallery,
  getPublicEventStats,
  countEventUploads,
  uploadsOpen,
} from "@/lib/events/public";
import { getCountdownPublic, countingDown } from "@/lib/events/countdown";
import { driveThumbUrl } from "@/lib/gdrive";
import { getGuestAlbums } from "@/lib/albums";
import { cookieToken } from "@/lib/password";
import { verifyEventPassword } from "@/lib/events/guest-actions";
import GuestUploader from "./guest-uploader";
import CountdownScreen from "./countdown-screen";

export const dynamic = "force-dynamic";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-serif text-2xl font-bold leading-none text-[#2A1B24]">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#9B8676]">{label}</p>
    </div>
  );
}

export default async function GuestEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pwerror?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const event = await getPublicEventBySlug(slug);
  if (!event) notFound();

  const cd = await getCountdownPublic(event.id);
  if (countingDown(cd)) {
    return <CountdownScreen title={cd.title || event.title} until={cd.until as string} />;
  }

  if (event.password_hash) {
    const store = await cookies();
    if (store.get(`md_pw_${event.id}`)?.value !== cookieToken(event.password_hash)) {
      return (
        <main className="grid min-h-screen place-items-center bg-[#F4ECE3] px-5 text-[#2A1B24]">
          <div className="w-full max-w-sm rounded-3xl glass p-7 text-center shadow-[0_24px_60px_rgba(90,50,40,0.14)]">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#2A1B24]">{event.title}</h1>
            <p className="mt-2 text-sm text-[#7A6570]">This event is password protected.</p>
            {sp.pwerror && (
              <p className="mt-4 text-sm text-[#9a3b2b]">Wrong password — try again.</p>
            )}
            <form action={verifyEventPassword} className="mt-5 space-y-3">
              <input type="hidden" name="slug" value={event.slug} />
              <input
                name="password"
                type="password"
                required
                placeholder="Event password"
                className="h-12 w-full rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 outline-none focus:border-[#B5654A]"
              />
              <button className="inline-flex h-12 w-full items-center justify-center rounded-full btn-grad text-base font-bold text-white">
                Enter
              </button>
            </form>
          </div>
        </main>
      );
    }
  }

  const open = uploadsOpen(event);
  const albums = open.open ? await getGuestAlbums(event.id) : [];
  const gallery = event.allow_downloads ? await getPublicGallery(event.id) : [];
  const stats = await getPublicEventStats(event.id);
  const filesUsed = await countEventUploads(event.id);

  const COVERS: Record<string, string> = {
    wedding: "event-wedding",
    birthday: "event-party",
    party: "event-party",
    corporate: "event-corporate",
    festival: "event-festival",
    trip: "hero",
  };
  const coverSrc = event.cover_path
    ? driveThumbUrl(event.cover_path, 1600)
    : `/marketing/${COVERS[event.event_type ?? ""] ?? "hero"}.jpg`;
  const AV_COLORS = ["#B5654A", "#e8a33c", "#c9738f", "#7fb2a1", "#b08968"];
  const recentGuest = gallery[0]?.guestName ?? "";

  return (
    <main className="min-h-screen bg-[#F4ECE3] text-[#2A1B24]">
      {/* Cover */}
      <header className="relative h-[360px] overflow-hidden md:h-[440px]">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${coverSrc})` }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(35,26,18,0.28) 0%, rgba(35,26,18,0.15) 42%, rgba(35,26,18,0.82) 100%)",
          }}
        />
        <div className="relative flex h-full flex-col items-center justify-start px-5 pt-14 text-center text-white md:pt-16">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
            {stats.guests > 0 ? (
              <>
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#7fe0a1]" /> {stats.guests}{" "}
                {stats.guests === 1 ? "guest" : "guests"} adding photos
              </>
            ) : (
              "Be the first to add a photo"
            )}
          </span>
          {event.eyebrow ? (
            <p className="font-script text-3xl text-[#ffd9c2] md:text-4xl">{event.eyebrow}</p>
          ) : (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">You&apos;re invited</p>
          )}
          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            {event.title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-white/85 md:text-base">
            {event.host_message || "Share your photos and videos — no app, no account."}
          </p>
        </div>
      </header>

      {/* Upload card */}
      <div className="relative z-10 mx-auto -mt-24 w-full max-w-2xl px-4 md:-mt-32">
        <div className="rounded-3xl glass p-6 shadow-[0_24px_60px_rgba(90,50,40,0.14)] md:p-8">
          {open.open ? (
            <div className="mx-auto max-w-xl">
              <div className="text-center">
                <h2 className="font-serif text-2xl font-bold text-[#2A1B24]">Add your photos &amp; videos</h2>
                <p className="mt-1 text-sm text-[#7A6570]">
                  Help capture the whole event — from every angle. No app, no account.
                </p>
                {event.per_guest_limit != null && (
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#F1E4D8] px-3 py-1.5 text-xs font-bold text-[#B5654A]">
                    🔒 Up to {event.per_guest_limit} per guest
                  </span>
                )}
              </div>
              <div className="mt-5">
                <GuestUploader
                  eventSlug={event.slug}
                  albums={albums}
                  perGuestLimit={event.per_guest_limit}
                />
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-[#2A1B24]">Uploads closed</h2>
              <p className="mt-2 text-sm text-[#7A6570]">{open.reason}</p>
            </div>
          )}
        </div>

        {/* Live stats */}
        <section className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          <Stat value={String(stats.photos)} label="Photos" />
          <span className="hidden h-8 w-px bg-[#E4D9CF] sm:block" />
          <Stat value={String(stats.videos)} label="Videos" />
          <span className="hidden h-8 w-px bg-[#E4D9CF] sm:block" />
          <Stat value={`${filesUsed} / ${event.file_limit}`} label="Files" />
          <span className="hidden h-8 w-px bg-[#E4D9CF] sm:block" />
          <div className="flex items-center gap-3">
            {stats.initials.length > 0 && (
              <div className="flex -space-x-2">
                {stats.initials.map((c, i) => (
                  <span
                    key={i}
                    className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#F4ECE3] text-xs font-bold text-white"
                    style={{ background: AV_COLORS[i % AV_COLORS.length] }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
            <Stat value={String(stats.guests)} label="Guests" />
          </div>
        </section>
      </div>

      {/* Shared album */}
      {gallery.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-14">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#B5654A]">The shared album</p>
            <h2 className="font-serif mt-2 text-3xl font-bold tracking-tight text-[#2A1B24] md:text-4xl">
              Every guest&apos;s view, in one place
            </h2>
          </div>
          <div className="mt-8 columns-2 gap-3 sm:columns-3 lg:columns-4 [column-fill:_balance]">
            {gallery.map((g) => (
              <figure
                key={g.id}
                className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-[#E4D9CF] bg-[#EFE4D8]"
              >
                {/* Not a link: guests view the album but can't open/enlarge a photo. */}
                <div className="block select-none">
                  {g.mediaType === "photo" && g.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.url}
                      alt={g.originalFileName ?? "photo"}
                      loading="lazy"
                      className="w-full transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : g.mediaType === "video" ? (
                    // poster = the Drive thumbnail; preload="none" so nothing streams
                    // until a guest taps the native play button.
                    <video
                      src={`/api/e/${slug}/video/${g.id}`}
                      poster={g.url ?? undefined}
                      preload="none"
                      playsInline
                      controls
                      controlsList="nodownload"
                      className="w-full"
                    />
                  ) : (
                    <span className="flex aspect-square w-full items-center justify-center text-xs font-semibold uppercase tracking-wide text-[#9B8676]">
                      File
                    </span>
                  )}
                  <figcaption
                    className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 pb-2 pt-8 text-xs font-semibold text-white"
                    style={{ background: "linear-gradient(transparent, rgba(35,26,18,0.55))" }}
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-white/25 text-[10px]">
                      {(g.guestName || "G")[0]}
                    </span>
                    {g.guestName}
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </section>
      )}

      {recentGuest && (
        <div className="md-chip fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-[#f0e2d0] bg-white px-4 py-2 text-sm font-bold text-[#2A1B24] shadow-[0_12px_30px_rgba(90,50,40,0.18)]">
          📸 {recentGuest} just added a photo
        </div>
      )}

      <footer className="border-t border-[#E4D9CF] py-8 text-center text-xs uppercase tracking-[0.18em] text-[#9B8676]">
        Powered by{" "}
        <Link href="/" className="font-semibold text-[#B5654A] hover:underline">
          MomentDrop
        </Link>
      </footer>
    </main>
  );
}
