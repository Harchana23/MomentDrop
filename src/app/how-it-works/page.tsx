import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { PhoneMock, QrCardMock, PhotoWallMock } from "@/components/marketing";

export const metadata: Metadata = {
  title: "How MomentDrop works",
  description:
    "Create an event, share a QR, guests upload from their phones, and you download everything. Here's the whole flow.",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#fbf6ee] text-[#22211f]">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-5 pt-16 text-center md:pt-24">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7f6a46]">How it works</p>
        <h1 className="mt-4 text-5xl font-semibold leading-[1.04] tracking-tight text-[#26211b] md:text-6xl">
          Simple for you, effortless for guests.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#695b49]">
          No apps to install, no accounts to create. Just a QR code and the photos you&apos;d
          otherwise never see.
        </p>
      </section>

      <div className="mx-auto max-w-5xl space-y-16 px-5 py-16">
        {/* Step 1 */}
        <section className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8d7147]">Step 1</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Create your event &amp; get a QR</h2>
            <p className="mt-3 max-w-md text-[#695b49]">
              Sign up, name your event, pick a date. MomentDrop instantly gives you a shareable
              link and a QR code — and printable table cards in a few designs.
            </p>
          </div>
          <div className="flex justify-center"><QrCardMock /></div>
        </section>

        {/* Step 2 */}
        <section className="grid items-center gap-10 md:grid-cols-[auto_1fr]">
          <div className="order-2 flex justify-center md:order-1"><PhoneMock /></div>
          <div className="order-1 md:order-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8d7147]">Step 2</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Guests scan &amp; upload</h2>
            <p className="mt-3 max-w-md text-[#695b49]">
              Guests scan the QR on their table or tap your link. A simple web page opens —
              they add their name, pick photos and videos, and upload. No app. No account. Works
              on any phone.
            </p>
          </div>
        </section>

        {/* Step 3 */}
        <section className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8d7147]">Step 3</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Manage &amp; download</h2>
            <p className="mt-3 max-w-md text-[#695b49]">
              Watch uploads arrive in your dashboard. Approve or hide photos, organize them into
              albums, put a live Photo Wall on the big screen — then download everything as one
              ZIP, foldered by guest.
            </p>
          </div>
          <div className="w-full max-w-[260px] justify-self-center border border-[#e6ddcf] bg-white p-4">
            <PhotoWallMock count={9} />
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-3xl px-5 pb-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">That&apos;s the whole thing</h2>
        <p className="mt-3 text-[#695b49]">Free to start — set up your first event in minutes.</p>
        <Link
          href="/signup"
          className="mt-7 inline-flex h-12 items-center justify-center bg-[#e0734f] px-7 text-base font-semibold text-white hover:bg-[#cf6541]"
        >
          Create your event
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
