import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Faq } from "@/components/marketing";

export const metadata: Metadata = {
  title: "FAQ — MomentDrop",
  description: "Common questions about collecting guest photos and videos with MomentDrop.",
};

const FAQS = [
  { q: "Do guests need to download an app or sign up?", a: "No. Guests scan the QR code (or open your link), land on a normal mobile web page, and upload photos and videos straight from their phone. No app, no account." },
  { q: "Where are the photos stored?", a: "In private cloud storage that only you, the event owner, can access from your dashboard. Nothing is posted to a public feed — you choose whether to show a shared album back to guests." },
  { q: "Can I approve photos before they appear?", a: "Yes. Turn on 'Require approval' in Access Control and new uploads wait in an Approval tab until you publish them." },
  { q: "How do I download everything?", a: "From the event's Media tab, click 'Download all (ZIP)'. You get every photo and video in one file, organized into folders by guest name." },
  { q: "What's a Photo Wall?", a: "A live, full-screen slideshow of published photos you can put on a projector or TV at the venue. It auto-advances and refreshes as new photos come in." },
  { q: "Can I password-protect my event?", a: "Yes. Set a password in Access Control and guests must enter it before they can open the event page." },
  { q: "How big can uploads be?", a: "Each file can be up to 50MB on the standard setup — plenty for photos and short videos. Larger video support can be raised on request." },
  { q: "What does it cost?", a: "Every event starts on a free trial. You can upgrade a specific event for more uploads and a longer active window. See the pricing page." },
  { q: "Is it just for weddings?", a: "No — it works great for birthdays, parties, and corporate events too. Anywhere people take photos, MomentDrop collects them." },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#F4ECE3] text-[#2A1B24]">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-5 pt-16 text-center md:pt-24">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7A6570]">FAQ</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-[#2A1B24]">
          Questions, answered
        </h1>
      </section>
      <section className="mx-auto max-w-3xl px-5 py-12">
        <Faq items={FAQS} />
        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center btn-grad px-7 text-base font-semibold text-white"
          >
            Create your event
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
