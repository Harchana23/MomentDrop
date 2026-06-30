import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Pricing — MomentDrop",
  description: "Start free. Upgrade your event when you need more uploads and a longer window.",
};

const PLANS = [
  {
    name: "Free trial",
    price: "$0",
    unit: "to start",
    highlight: false,
    features: [
      "Up to 30 photos & videos",
      "Active for 7 days",
      "QR code + shareable link",
      "Approve uploads before they show",
      "Download everything as a ZIP",
    ],
    cta: "Start free",
  },
  {
    name: "Event",
    price: "$29",
    unit: "one-time, per event",
    highlight: true,
    features: [
      "Up to 1,000 photos & videos",
      "Active for 60 days",
      "Everything in Free trial",
      "Priority processing",
      "Keep the full-resolution album",
    ],
    cta: "Start free",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#22211f]">
      <SiteHeader />

      <section className="mx-auto max-w-5xl px-5 pt-16 pb-6 text-center md:pt-24">
        <h1 className="text-5xl font-semibold tracking-tight text-[#26211b]">
          Simple, per-event pricing
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#695b49]">
          No subscription. Start every event free, and upgrade only the events that need
          more.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-8">
        <div className="grid gap-5 md:grid-cols-2">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`flex flex-col border bg-white p-7 ${
                p.highlight ? "border-[#8d7147]" : "border-[#e6ddcf]"
              }`}
            >
              {p.highlight && (
                <span className="mb-3 w-fit bg-[#f3ecdc] px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[#8d7147]">
                  Most popular
                </span>
              )}
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-semibold">{p.price}</span>
                <span className="text-sm text-[#74664f]">{p.unit}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-[#4a4035]">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-[#8d7147]">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-7 inline-flex h-12 items-center justify-center px-5 text-base font-semibold ${
                  p.highlight
                    ? "bg-[#1f1b16] text-white hover:bg-[#3a3127]"
                    : "border border-[#d8cdbb] text-[#5c4a2e] hover:border-[#8d7147]"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-[#74664f]">
          Every event starts on the free trial. Upgrade from your dashboard when you&apos;re
          ready.
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
