import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "See MomentDrop in action — live event album",
  description:
    "A live look at the MomentDrop guest experience: scan, add your photos and videos, and watch the shared album fill up in real time.",
};

type Shot = { src: string; guest: string };

/** Demo gallery seeded with real photos so the interface looks full and alive. */
const GALLERY: Shot[] = [
  { src: "/marketing/gallery-1.jpg", guest: "Aisyah" },
  { src: "/marketing/event-party.jpg", guest: "Wei Jie" },
  { src: "/marketing/gallery-4.jpg", guest: "Priya" },
  { src: "/marketing/gallery-3.jpg", guest: "Daniel" },
  { src: "/marketing/event-festival.jpg", guest: "Nurul" },
  { src: "/marketing/gallery-6.jpg", guest: "Kok Wai" },
  { src: "/marketing/gallery-2.jpg", guest: "Deepa" },
  { src: "/marketing/event-corporate.jpg", guest: "Marcus" },
  { src: "/marketing/gallery-5.jpg", guest: "Siti" },
  { src: "/marketing/testimonial.jpg", guest: "Ravi" },
  { src: "/marketing/hero.jpg", guest: "Mei Ling" },
  { src: "/marketing/event-wedding.jpg", guest: "Farah" },
];

const AVATARS = [
  { i: "A", c: "#B5654A" },
  { i: "W", c: "#e8a33c" },
  { i: "P", c: "#c9738f" },
  { i: "D", c: "#7fb2a1" },
  { i: "N", c: "#b08968" },
];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-serif text-2xl font-bold leading-none text-[#2A1B24]">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#9B8676]">{label}</p>
    </div>
  );
}

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#F4ECE3] text-[#2A1B24]">
      {/* Demo ribbon */}
      <div className="bg-[#2A1B24] px-5 py-2 text-center text-xs font-semibold tracking-wide text-[#f4e3d3]">
        ✨ Live demo — this is exactly what your guests see when they scan
      </div>

      {/* Cover */}
      <header className="relative h-[360px] overflow-hidden md:h-[420px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/marketing/event-wedding.jpg)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(35,26,18,0.28) 0%, rgba(35,26,18,0.15) 40%, rgba(35,26,18,0.78) 100%)",
          }}
        />
        <div className="relative flex h-full flex-col items-center justify-end px-5 pb-10 text-center text-white">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#7fe0a1]" /> 34 guests adding photos now
          </span>
          <p className="font-script text-3xl text-[#ffd9c2] md:text-4xl">The wedding of</p>
          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Aisyah &amp; Daniel
          </h1>
          <p className="mt-3 text-sm font-medium text-white/85 md:text-base">
            28 June 2026 · Kuala Lumpur
          </p>
        </div>
      </header>

      <div className="mx-auto -mt-8 max-w-5xl px-4">
        {/* Upload card */}
        <section className="relative rounded-3xl border border-[#E4D9CF] bg-white p-6 shadow-[0_24px_60px_rgba(90,50,40,0.14)] md:p-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-serif text-2xl font-bold text-[#2A1B24]">Add your photos &amp; videos</h2>
            <p className="mt-1 text-sm text-[#7A6570]">
              Help us capture the whole day — from every angle. No app, no account.
            </p>

            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#F1E4D8] px-3 py-1.5 text-xs font-bold text-[#B5654A]">
              🔒 Your host allows up to 10 per guest
            </span>

            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E0B49A] bg-[#FBF3EC] px-4 py-8">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-[#F1E4D8] text-2xl text-[#B5654A]">
                ⬆
              </div>
              <p className="mt-3 font-semibold text-[#2A1B24]">Tap to choose from your camera roll</p>
              <p className="mt-1 text-xs text-[#9B8676]">JPG · PNG · HEIC · MP4 · MOV</p>
            </div>

            {/* Per-guest quota */}
            <div className="mt-4 text-left">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#7A6570]">Your uploads</span>
                <span className="text-[#B5654A]">3 of 10 added</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#f0e2d0]">
                <div className="h-full rounded-full bg-[#B5654A]" style={{ width: "30%" }} />
              </div>
              <p className="mt-1.5 text-center text-xs text-[#9B8676]">
                7 left — the host set a limit so every guest gets a turn
              </p>
            </div>

            <input
              disabled
              placeholder="Your name (so the couple knows it's you)"
              className="mt-4 h-12 w-full rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 text-sm outline-none placeholder:text-[#9B8676]"
            />
            <button
              disabled
              className="md-cta mt-3 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#B5654A] text-base font-bold text-white"
            >
              Share your photos →
            </button>
          </div>
        </section>

        {/* Live stats */}
        <section className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          <Stat value="248" label="Photos" />
          <span className="hidden h-8 w-px bg-[#E4D9CF] sm:block" />
          <Stat value="17" label="Videos" />
          <span className="hidden h-8 w-px bg-[#E4D9CF] sm:block" />
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {AVATARS.map((a) => (
                <span
                  key={a.i}
                  className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#F4ECE3] text-xs font-bold text-white"
                  style={{ background: a.c }}
                >
                  {a.i}
                </span>
              ))}
            </div>
            <Stat value="34" label="Guests" />
          </div>
        </section>

        {/* Shared album */}
        <section className="mt-12 pb-16">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#B5654A]">The shared album</p>
            <h2 className="font-serif mt-2 text-3xl font-bold tracking-tight text-[#2A1B24] md:text-4xl">
              Every guest&apos;s view, in one place
            </h2>
          </div>

          <div className="mt-8 columns-2 gap-3 sm:columns-3 lg:columns-4 [column-fill:_balance]">
            {GALLERY.map((g, i) => (
              <figure
                key={i}
                className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-[#E4D9CF] bg-[#EFE4D8]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.src}
                  alt={`Photo shared by ${g.guest}`}
                  loading="lazy"
                  className="w-full transition duration-500 group-hover:scale-[1.04]"
                />
                <figcaption
                  className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 pb-2 pt-8 text-xs font-semibold text-white"
                  style={{ background: "linear-gradient(transparent, rgba(35,26,18,0.55))" }}
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white/25 text-[10px]">
                    {g.guest[0]}
                  </span>
                  {g.guest}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Behind the scenes — the host control that sets the per-guest limit */}
        <section className="mb-16 rounded-3xl border border-[#E4D9CF] bg-white p-6 md:p-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1ece2] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#7A6570]">
              👑 Host view
            </span>
            <h2 className="font-serif mt-3 text-2xl font-bold text-[#2A1B24]">You decide how many each guest can add</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-[#7A6570]">
              Set a per-guest limit so no single phone floods the album — everyone gets a fair turn.
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-[#E4D9CF] bg-[#FBF3EC] p-5">
            <p className="text-sm font-semibold text-[#2A1B24]">Photos &amp; videos per guest</p>
            <div className="mt-3 flex items-center gap-4">
              <button
                disabled
                className="grid h-11 w-11 place-items-center rounded-full border border-[#B5654A] text-xl font-bold text-[#B5654A]"
              >
                −
              </button>
              <span className="font-serif text-4xl font-bold text-[#2A1B24]">10</span>
              <button
                disabled
                className="grid h-11 w-11 place-items-center rounded-full bg-[#B5654A] text-xl font-bold text-white"
              >
                +
              </button>
              <span className="ml-auto text-xs text-[#9B8676]">
                Unlimited on
                <br />
                Plus &amp; Pro
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Live toast */}
      <div className="md-chip fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-[#f0e2d0] bg-white px-4 py-2 text-sm font-bold text-[#2A1B24] shadow-[0_12px_30px_rgba(90,50,40,0.18)]">
        📸 Wei Jie just added a photo
      </div>

      <footer className="border-t border-[#E4D9CF] py-8 text-center text-xs uppercase tracking-[0.18em] text-[#9B8676]">
        Powered by{" "}
        <Link href="/" className="font-semibold text-[#B5654A] hover:underline">
          MomentDrop
        </Link>
      </footer>
    </main>
  );
}
