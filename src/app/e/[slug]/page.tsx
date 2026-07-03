import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  getPublicEventBySlug,
  getPublicGallery,
  getPublicEventStats,
  uploadsOpen,
} from "@/lib/events/public";
import { getCountdownPublic, countingDown } from "@/lib/events/countdown";
import { getGuestAlbums } from "@/lib/albums";
import { cookieToken } from "@/lib/password";
import { verifyEventPassword } from "@/lib/events/guest-actions";
import GuestUploader from "./guest-uploader";
import CountdownScreen from "./countdown-screen";

export const dynamic = "force-dynamic";

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
        <main className="grid min-h-screen place-items-center bg-[#fbf6ee] px-5 text-[#24201a]">
          <div className="w-full max-w-sm rounded-3xl border border-[#eaddca] bg-white p-7 text-center shadow-[0_24px_60px_rgba(80,50,20,0.14)]">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#231a12]">{event.title}</h1>
            <p className="mt-2 text-sm text-[#6f5c46]">This event is password protected.</p>
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
                className="h-12 w-full rounded-xl border border-[#e6d8c4] bg-[#fffdf9] px-4 outline-none focus:border-[#e0734f]"
              />
              <button className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#e0734f] text-base font-bold text-white hover:bg-[#cf6541]">
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

  const COVERS: Record<string, string> = {
    wedding: "event-wedding",
    birthday: "event-party",
    party: "event-party",
    corporate: "event-corporate",
    festival: "event-festival",
    trip: "hero",
  };
  const coverSrc = `/marketing/${COVERS[event.event_type ?? ""] ?? "hero"}.jpg`;
  const AV_COLORS = ["#e0734f", "#e8a33c", "#c9738f", "#7fb2a1", "#b08968"];

  return (
    <main className="min-h-screen bg-[#fbf6ee] text-[#24201a]">
      {/* Cover */}
      <header className="relative h-[360px] overflow-hidden md:h-[440px]">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${coverSrc})` }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(35,26,18,0.30) 0%, rgba(35,26,18,0.18) 42%, rgba(35,26,18,0.82) 100%)",
          }}
        />
        <div className="relative flex h-full flex-col items-center justify-end px-5 pb-12 text-center text-white">
          {event.eyebrow ? (
            <p className="font-script text-3xl text-[#ffd9c2] md:text-4xl">{event.eyebrow}</p>
          ) : (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">You&apos;re invited</p>
          )}
          <h1 className="font-serif mt-1 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            {event.title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/85 md:text-base">
            {event.host_message || "Share your photos and videos — no app, no account."}
          </p>

          {stats.photos + stats.videos > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
              {stats.initials.length > 0 && (
                <div className="flex -space-x-2">
                  {stats.initials.map((c, i) => (
                    <span
                      key={i}
                      className="grid h-8 w-8 place-items-center rounded-full border-2 border-white/70 text-xs font-bold text-white"
                      style={{ background: AV_COLORS[i % AV_COLORS.length] }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
              <span className="font-semibold">
                <b className="font-bold">{stats.photos}</b> {stats.photos === 1 ? "photo" : "photos"}
              </span>
              <span className="font-semibold">
                <b className="font-bold">{stats.videos}</b> {stats.videos === 1 ? "video" : "videos"}
              </span>
              {stats.guests > 0 && (
                <span className="font-semibold">
                  <b className="font-bold">{stats.guests}</b> {stats.guests === 1 ? "guest" : "guests"}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Upload card */}
      <div className="mx-auto -mt-10 w-full max-w-xl px-4">
        <div className="rounded-3xl border border-[#eaddca] bg-white p-6 shadow-[0_24px_60px_rgba(80,50,20,0.14)] md:p-8">
          {open.open ? (
            <GuestUploader eventSlug={event.slug} albums={albums} />
          ) : (
            <div className="py-8 text-center">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-[#231a12]">Uploads closed</h2>
              <p className="mt-2 text-sm text-[#6f5c46]">{open.reason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Shared album */}
      {gallery.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-14">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#c85f3c]">The shared album</p>
            <h2 className="font-serif mt-2 text-3xl font-bold tracking-tight text-[#231a12] md:text-4xl">
              Every guest&apos;s view, in one place
            </h2>
          </div>
          <div className="mt-8 columns-2 gap-3 sm:columns-3 lg:columns-4 [column-fill:_balance]">
            {gallery.map((g) => (
              <figure
                key={g.id}
                className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-[#eaddca] bg-[#efe7db]"
              >
                <a href={g.url ?? "#"} target="_blank" rel="noreferrer" className="block">
                  {g.mediaType === "photo" && g.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.url}
                      alt={g.originalFileName ?? "photo"}
                      loading="lazy"
                      className="w-full transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <span className="flex aspect-square w-full items-center justify-center text-xs font-semibold uppercase tracking-wide text-[#a18e73]">
                      {g.mediaType === "video" ? "▶ Video" : "File"}
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
                </a>
              </figure>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-[#e6ddcf] py-8 text-center text-xs uppercase tracking-[0.18em] text-[#a18e73]">
        Powered by{" "}
        <Link href="/" className="font-semibold text-[#c08a54] hover:underline">
          MomentDrop
        </Link>
      </footer>
    </main>
  );
}
