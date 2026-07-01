import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { PhoneMock, PhotoGrid, QrCardMock, Faq, Photo } from "@/components/marketing";

export const metadata: Metadata = {
  title: "MomentDrop — collect every guest's photos with one QR scan",
  description:
    "Create an event, share a QR code, and let guests upload photos and videos from their phones — no app, no account. Download everything as one album.",
};

const STEPS = [
  { n: "1", t: "Create your event", d: "Sign up, name your event, and get a QR code + link in seconds." },
  { n: "2", t: "Guests scan & upload", d: "They open a web page on their phone and add photos and videos — no app, no account." },
  { n: "3", t: "Download everything", d: "View, approve, and download every memory as one ZIP when the day is done." },
];

const FEATURES = [
  { t: "No app for guests", d: "Just a QR code and a web page. Works on any phone, instantly." },
  { t: "Your photos, private", d: "Uploads land in private storage only you control — never a public feed." },
  { t: "Approve before it shows", d: "Optionally review uploads before they appear in the album." },
  { t: "Live Photo Wall", d: "Put a slideshow of photos on the big screen as guests upload." },
  { t: "Organize into albums", d: "Ceremony, reception, photobooth — guests upload to the right album." },
  { t: "Download as one ZIP", d: "Every photo and video, organized by guest, in a single download." },
];

const USE_CASES = [
  { t: "Weddings", d: "Every angle of your big day.", href: "/use-cases/wedding" },
  { t: "Birthdays", d: "Candids from every guest.", href: "/use-cases/birthday" },
  { t: "Parties", d: "The whole night, crowdsourced.", href: "/use-cases/party" },
  { t: "Corporate", d: "Conferences, launches, off-sites.", href: "/use-cases/corporate" },
];

const MALAYSIA = [
  { t: "Weddings", d: "Malay, Chinese, Indian, church — every tradition.", src: "/marketing/event-wedding.jpg" },
  { t: "Festivals & open houses", d: "Raya, CNY, Deepavali, Christmas.", src: "/marketing/event-festival.jpg" },
  { t: "Birthdays & parties", d: "Every candid from the night.", src: "/marketing/event-party.jpg" },
  { t: "Company events", d: "Annual dinners, launches, team days.", src: "/marketing/event-corporate.jpg" },
];

const FAQS = [
  { q: "Do guests need to download an app?", a: "No. Guests scan the QR (or open the link), land on a normal web page, and upload straight from their phone — no app and no account." },
  { q: "Where do the photos go?", a: "Into private storage that only you, the event owner, can access. Nothing is posted to a public feed unless you choose to show the shared album." },
  { q: "Can I download everything at the end?", a: "Yes — one click downloads every photo and video as a single ZIP, organized into folders by guest." },
  { q: "How much does it cost?", a: "Every event starts free. Upgrade a specific event for more uploads and a longer window. See the pricing page for details." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#22211f]">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-16 md:grid-cols-[1.05fr_0.95fr] md:pt-24">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7f6a46]">
            Scan · Drop · Remember
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-tight text-[#26211b] md:text-7xl">
            Every guest&apos;s photos, in one place.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#695b49]">
            Create an event, share a QR code, and let guests upload photos and videos straight
            from their phones — no app, no account. You download everything when the day is done.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center bg-[#1f1b16] px-7 text-base font-semibold text-white hover:bg-[#3a3127]"
            >
              Create your event — free
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex h-12 items-center justify-center border border-[#d8cdbb] px-7 text-base font-semibold text-[#5c4a2e] hover:border-[#8d7147]"
            >
              See how it works
            </Link>
          </div>
        </div>
        <div className="relative pb-10 md:pb-0">
          <Photo
            src="/marketing/hero.jpg"
            alt="Guests taking photos at a Malaysian celebration"
            fallback="#d8c3a3"
            className="aspect-[4/3] w-full border border-[#e6ddcf] shadow-[0_30px_80px_rgba(70,55,35,0.15)]"
          />
          <div className="absolute -bottom-4 -left-3 hidden -rotate-2 sm:block">
            <PhoneMock />
          </div>
          <div className="absolute -right-3 -top-6 hidden rotate-3 md:block">
            <QrCardMock />
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="mx-auto mt-16 max-w-6xl px-5">
        <div className="grid gap-6 border-y border-[#e6ddcf] py-8 text-center sm:grid-cols-3">
          {[
            { k: "No app", v: "for your guests" },
            { k: "1 QR", v: "to collect it all" },
            { k: "1 ZIP", v: "to take it home" },
          ].map((s) => (
            <div key={s.k}>
              <p className="text-3xl font-semibold text-[#26211b]">{s.k}</p>
              <p className="mt-1 text-sm text-[#74664f]">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
          From QR to album in three steps
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
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

      {/* Features + gallery visual */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
          <div className="order-2 md:order-1">
            <div className="border border-[#e6ddcf] bg-white p-4">
              <PhotoGrid count={6} />
              <p className="mt-3 text-center text-xs uppercase tracking-[0.2em] text-[#a18e73]">
                The shared album
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Everything you need to keep the memories
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.t}>
                  <h3 className="flex items-center gap-2 text-base font-semibold">
                    <span className="text-[#8d7147]">✓</span> {f.t}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#695b49]">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
          Made for every celebration
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((u) => (
            <Link
              key={u.t}
              href={u.href}
              className="group border border-[#e6ddcf] bg-white p-6 transition hover:border-[#8d7147]"
            >
              <h3 className="text-lg font-semibold">{u.t}</h3>
              <p className="mt-2 text-sm text-[#695b49]">{u.d}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-[#8d7147] group-hover:underline">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Malaysian celebrations */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7f6a46]">
            Proudly Malaysian
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            For every Malaysian celebration
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[#695b49]">
            From a Malay wedding to a Deepavali open house, a birthday bash to your company&apos;s
            annual dinner — MomentDrop gathers every guest&apos;s photos, across every community
            and every kind of event.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MALAYSIA.map((m) => (
            <div key={m.t} className="overflow-hidden border border-[#e6ddcf] bg-white">
              <Photo src={m.src} alt={m.t} className="aspect-[3/4] w-full" />
              <div className="p-4">
                <h3 className="text-base font-semibold">{m.t}</h3>
                <p className="mt-1 text-sm text-[#695b49]">{m.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
          <Photo
            src="/marketing/testimonial.jpg"
            alt="A happy couple"
            fallback="#cdb39a"
            className="mx-auto h-28 w-28 rounded-full"
          />
          <div>
            <p className="text-2xl font-medium leading-relaxed text-[#3a3127]">
              &ldquo;We got hundreds of photos we&apos;d never have seen otherwise — the dance
              floor, the kids&apos; table, all of it. The QR on every table just worked.&rdquo;
            </p>
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-[#8d7147]">
              Aisyah &amp; Daniel · KL wedding
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-12">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Questions, answered</h2>
        <div className="mt-8">
          <Faq items={FAQS} />
        </div>
        <p className="mt-6 text-center text-sm text-[#74664f]">
          More on the <Link href="/faq" className="font-semibold text-[#5c4a2e] underline">FAQ page</Link>.
        </p>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-6">
        <div className="border border-[#e1d8ca] bg-white p-10 text-center md:p-14">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Start collecting in two minutes
          </h2>
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
