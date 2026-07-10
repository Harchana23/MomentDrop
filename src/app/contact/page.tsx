import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { submitContact } from "@/lib/contact-actions";
import { SUPPORT_EMAIL } from "@/lib/support";

export const metadata: Metadata = {
  title: "Contact us — MomentDrop",
  description:
    "Questions about collecting your event photos with MomentDrop? Reach our team — we're happy to help.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const inputClass =
    "mt-2 h-12 w-full rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 text-base outline-none transition focus:border-[#B5654A]";

  return (
    <div className="min-h-screen bg-[#F4ECE3] text-[#2A1B24]">
      <SiteHeader />

      <section className="mx-auto max-w-5xl px-5 pt-16 pb-4 text-center md:pt-24">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#B5654A]">Contact us</p>
        <h1 className="font-serif mt-3 text-5xl font-bold tracking-tight text-[#2A1B24] md:text-6xl">
          We&apos;d love to help
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#7A6570]">
          Planning an event, or stuck on something? Send us a message and we&apos;ll get back to you,
          usually within a day.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Info */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E4D9CF] bg-white p-6">
            <h2 className="font-serif text-lg font-bold">Email support</h2>
            <p className="mt-1 text-sm text-[#7A6570]">
              Prefer email? Reach us directly at
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-2 inline-block break-all font-bold text-[#B5654A] hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
          <div className="rounded-2xl border border-[#E4D9CF] bg-white p-6">
            <h2 className="font-serif text-lg font-bold">Response time</h2>
            <p className="mt-1 text-sm text-[#7A6570]">
              We answer messages within one business day. During busy event seasons, hang tight —
              we read every one.
            </p>
          </div>
          <div className="rounded-2xl border border-[#E4D9CF] bg-white p-6">
            <h2 className="font-serif text-lg font-bold">Quick answers</h2>
            <p className="mt-1 text-sm text-[#7A6570]">
              Many questions are covered on our{" "}
              <Link href="/faq" className="font-bold text-[#B5654A] hover:underline">
                FAQ
              </Link>{" "}
              and{" "}
              <Link href="/pricing" className="font-bold text-[#B5654A] hover:underline">
                pricing
              </Link>{" "}
              pages.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-[#E4D9CF] bg-white p-6 shadow-[0_16px_40px_rgba(90,50,40,0.08)] md:p-8">
          {sp.sent && (
            <p className="mb-5 rounded-xl border border-[#cfe2d0] bg-[#eef4ec] px-4 py-3 text-sm text-[#3b7a4f]">
              Thanks — your message is on its way. We&apos;ll reply by email soon.
            </p>
          )}
          {sp.error === "fields" && (
            <p className="mb-5 rounded-xl border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
              Please fill in your name, email, and a message.
            </p>
          )}
          {sp.error === "send" && (
            <p className="mb-5 rounded-xl border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
              Something went wrong sending your message. Please email us at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          )}
          {sp.error === "unconfigured" && (
            <p className="mb-5 rounded-xl border border-[#e7dcc2] bg-[#fbf6ea] px-4 py-3 text-sm text-[#7a6326]">
              Our contact form isn&apos;t live just yet — please email us directly at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          )}

          <form action={submitContact} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-[#2A1B24]">Your name</span>
                <input name="name" type="text" required placeholder="Aisyah" className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[#2A1B24]">Email</span>
                <input name="email" type="email" required placeholder="you@email.com" className={inputClass} />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-[#2A1B24]">Subject</span>
              <input name="subject" type="text" placeholder="How can we help?" className={inputClass} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#2A1B24]">Message</span>
              <textarea
                name="message"
                required
                placeholder="Tell us what's on your mind…"
                className="mt-2 min-h-32 w-full resize-none rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 py-3 text-base outline-none transition focus:border-[#B5654A]"
              />
            </label>
            <button className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#B5654A] text-base font-bold text-white transition hover:bg-[#8F4A34]">
              Send message
            </button>
          </form>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
