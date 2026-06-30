import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Wedding photo sharing — MomentDrop",
  description:
    "Collect every wedding photo and video from your guests with a single QR code. No app, no account. Download everything as one album.",
};

const BENEFITS = [
  { t: "Catch the candids", d: "Your photographer can't be everywhere. Guests capture the toasts, the dance floor, and the in-between moments." },
  { t: "No app, no friction", d: "Guests scan the QR on their table and upload straight from their camera roll. Grandparents included." },
  { t: "One private album", d: "Everything lands in your private storage — not a public hashtag feed. You decide what's shown." },
  { t: "Yours forever", d: "Download every photo and video as a single ZIP, organized by guest, to keep or print." },
];

export default function WeddingUseCasePage() {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#22211f]">
      <SiteHeader />

      <section className="mx-auto max-w-4xl px-5 pt-16 pb-10 text-center md:pt-24">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7f6a46]">
          For weddings
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-5xl font-semibold leading-[1.04] tracking-tight text-[#26211b] md:text-6xl">
          Every guest&apos;s view of your wedding day.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#695b49]">
          Put a QR code on each table. Your guests scan, upload their photos and videos, and
          you walk away with the whole day — from every angle.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-flex h-12 items-center justify-center bg-[#1f1b16] px-7 text-base font-semibold text-white hover:bg-[#3a3127]"
        >
          Create your wedding event
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.t} className="border border-[#e6ddcf] bg-white p-6">
              <h3 className="text-lg font-semibold">{b.t}</h3>
              <p className="mt-2 text-sm leading-6 text-[#695b49]">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Set up in minutes</h2>
        <p className="mt-3 text-[#695b49]">
          Create your event, print the QR for your tables, and you&apos;re ready for the big
          day. Free to start.
        </p>
        <Link
          href="/signup"
          className="mt-7 inline-flex h-12 items-center justify-center bg-[#1f1b16] px-7 text-base font-semibold text-white hover:bg-[#3a3127]"
        >
          Get started — free
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
