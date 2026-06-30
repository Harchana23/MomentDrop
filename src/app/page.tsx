import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

const STEPS = [
  { n: "1", t: "Create your event", d: "Sign up, name your event, and get a QR code + link in seconds." },
  { n: "2", t: "Guests scan & upload", d: "They open a web page on their phone and add photos and videos — no app, no account." },
  { n: "3", t: "Download everything", d: "View, approve, and download every memory as one ZIP when the day is done." },
];

const FEATURES = [
  { t: "No app for guests", d: "Just a QR code and a web page. Works on any phone." },
  { t: "Your photos, private", d: "Uploads go to private storage only you can access — never a public feed." },
  { t: "Approve before it shows", d: "Optionally review uploads before they appear." },
  { t: "Download as one ZIP", d: "Every photo and video, organized by guest, in a single download." },
  { t: "QR + shareable link", d: "Print the QR for tables or share the link in a group chat." },
  { t: "Built for the moment", d: "Capture the candids your photographer missed." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#22211f]">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-5 pt-16 pb-10 text-center md:pt-24">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7f6a46]">
          Scan · Drop · Remember
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-[#26211b] md:text-7xl">
          Every guest&apos;s photos, in one place.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#695b49]">
          MomentDrop lets your guests upload photos and videos from their phones with a
          single QR scan — no app, no account. You download everything when the event ends.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center bg-[#1f1b16] px-7 text-base font-semibold text-white hover:bg-[#3a3127]"
          >
            Create your event — free
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-12 items-center justify-center border border-[#d8cdbb] px-7 text-base font-semibold text-[#5c4a2e] hover:border-[#8d7147]"
          >
            See pricing
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="border border-[#e6ddcf] bg-white p-6">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#f3ecdc] text-sm font-semibold text-[#8d7147]">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm leading-6 text-[#695b49]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Everything you need to collect the memories</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="border border-[#e6ddcf] bg-white p-5">
              <h3 className="text-base font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm leading-6 text-[#695b49]">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="border border-[#e1d8ca] bg-white p-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Start free, in two minutes</h2>
          <p className="mx-auto mt-3 max-w-md text-[#695b49]">
            Create an event, print the QR, and watch the photos roll in.
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-flex h-12 items-center justify-center bg-[#1f1b16] px-7 text-base font-semibold text-white hover:bg-[#3a3127]"
          >
            Create your event
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
