import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#22211f]">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7f6a46]">
          MomentDrop
        </p>
        <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-tight text-[#26211b] md:text-6xl">
          Every guest&apos;s photos, in one place.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#695b49]">
          Create an event, share a QR code, and let guests upload photos and videos
          straight from their phones — no app, no account. Download everything when the
          day is done.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center bg-[#1f1b16] px-7 text-base font-semibold text-white transition hover:bg-[#3a3127]"
          >
            Create your event
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center border border-[#d8cdbb] px-7 text-base font-semibold text-[#5c4a2e] transition hover:border-[#8d7147]"
          >
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}
