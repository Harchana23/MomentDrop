import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { PhotoGrid, Faq, Photo } from "@/components/marketing";
import { JoyfulHero } from "@/components/joyful-hero";

export const metadata: Metadata = {
  title: "MomentDrop — collect every guest's photos with one QR scan",
  description:
    "Create an event, share a QR code, and let guests upload photos and videos from their phones — no app, no account. Download everything as one album.",
};

const STEPS = [
  { n: "1", t: "Create your event", d: "Sign up, name it, and get a QR code + link in seconds." },
  { n: "2", t: "Guests scan & upload", d: "They open a web page and add photos and videos — no app, no account." },
  { n: "3", t: "Download everything", d: "View, approve, and download every memory as one ZIP." },
];

const FEATURES = [
  { t: "No app for guests", d: "Just a QR code and a web page. Works on any phone, instantly." },
  { t: "Your photos, private", d: "Uploads land in private storage only you control — never a public feed." },
  { t: "Approve before it shows", d: "Optionally review uploads before they appear in the album." },
  { t: "Live Photo Wall", d: "Put a slideshow of photos on the big screen as guests upload." },
  { t: "Organize into albums", d: "Ceremony, reception, photobooth — guests upload to the right one." },
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
    <div className="min-h-screen bg-[#fbf6ee] text-[#24201a]">
      <SiteHeader />

      <JoyfulHero />

      {/* Trust strip */}
      <section className="mx-auto mt-6 max-w-6xl px-5">
        <div className="flex flex-wrap justify-center gap-x-7 gap-y-2 border-y border-[#efe2d0] py-5 text-sm font-medium text-[#8a755c]">
          <span>💍 Weddings</span>
          <span>🪔 Festivals &amp; open houses</span>
          <span>🎂 Birthdays</span>
          <span>🏢 Company events</span>
          <span>🏝️ Trips</span>
        </div>
      </section>

      {/* How it works */}
      <section className="md-reveal mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-serif text-center text-4xl font-bold tracking-tight text-[#231a12] md:text-5xl">
          From QR to album in three steps
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-[#eaddca] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(80,50,20,0.10)]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#fbeadf] text-base font-bold text-[#e0734f]">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.t}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6f5c46]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features + gallery */}
      <section className="md-reveal mx-auto max-w-6xl px-5 py-8">
        <div className="grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
          <div className="order-2 md:order-1">
            <div className="rounded-3xl border border-[#eaddca] bg-white p-4">
              <PhotoGrid count={6} />
              <p className="mt-3 text-center text-xs uppercase tracking-[0.2em] text-[#a97e46]">
                The shared album
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-[#231a12] md:text-5xl">
              Everything you need to keep the memories
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.t}>
                  <h3 className="flex items-center gap-2 text-base font-bold">
                    <span className="text-[#e0734f]">✓</span> {f.t}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#6f5c46]">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Malaysian celebrations */}
      <section className="md-reveal mx-auto max-w-6xl px-5 py-16">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#c85f3c]">Proudly Malaysian</p>
          <h2 className="font-serif mt-3 text-4xl font-bold tracking-tight text-[#231a12] md:text-5xl">
            For every celebration
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[#6f5c46]">
            From a Malay wedding to a Deepavali open house, a birthday bash to your company&apos;s
            annual dinner — MomentDrop gathers every guest&apos;s photos, across every community.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MALAYSIA.map((m) => (
            <div
              key={m.t}
              className="overflow-hidden rounded-2xl border border-[#eaddca] bg-white transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(80,50,20,0.12)]"
            >
              <Photo src={m.src} alt={m.t} className="aspect-[3/4] w-full" />
              <div className="p-4">
                <h3 className="text-base font-bold">{m.t}</h3>
                <p className="mt-1 text-sm text-[#6f5c46]">{m.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="md-reveal mx-auto max-w-6xl px-5 pb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((u) => (
            <Link
              key={u.t}
              href={u.href}
              className="group rounded-2xl border border-[#eaddca] bg-white p-6 transition hover:-translate-y-1 hover:border-[#e0734f] hover:shadow-[0_16px_40px_rgba(80,50,20,0.10)]"
            >
              <h3 className="text-lg font-bold">{u.t}</h3>
              <p className="mt-2 text-sm text-[#6f5c46]">{u.d}</p>
              <span className="mt-4 inline-block text-sm font-bold text-[#e0734f] group-hover:underline">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="md-reveal mx-auto max-w-4xl px-5 py-16">
        <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
          <Photo
            src="/marketing/testimonial.jpg"
            alt="A happy couple"
            fallback="#cdb39a"
            className="mx-auto h-28 w-28 rounded-full"
          />
          <div>
            <p className="font-serif text-2xl font-medium leading-relaxed text-[#3a2c1e]">
              &ldquo;We got hundreds of photos we&apos;d never have seen otherwise — the dance
              floor, the kids&apos; table, all of it. The QR on every table just worked.&rdquo;
            </p>
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-[#c85f3c]">
              Aisyah &amp; Daniel · KL wedding
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="md-reveal mx-auto max-w-3xl px-5 py-12">
        <h2 className="font-serif text-center text-4xl font-bold tracking-tight text-[#231a12]">
          Questions, answered
        </h2>
        <div className="mt-8">
          <Faq items={FAQS} />
        </div>
        <p className="mt-6 text-center text-sm text-[#6f5c46]">
          More on the{" "}
          <Link href="/faq" className="font-bold text-[#c85f3c] underline">
            FAQ page
          </Link>
          .
        </p>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div className="rounded-3xl border border-[#f0d3c4] bg-[#fbeadf] p-10 text-center md:p-14">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-[#231a12] md:text-5xl">
            Start collecting in two minutes
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[#6f5c46]">
            Create an event, print the QR, and watch the photos roll in.
          </p>
          <Link
            href="/signup"
            className="md-cta mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[#e0734f] px-8 text-base font-bold text-white hover:bg-[#cf6541]"
          >
            Create your event — free →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
